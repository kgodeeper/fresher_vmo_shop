import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  UseFilters,
} from '@nestjs/common';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Order } from './order.entity';
import { ProductModelService } from '../models/model.service';
import { OrderProduct } from '../order-products/order-product.entity';
import { CustomerService } from '../customers/customer.service';
import { AppHttpException } from '../../exceptions/http.exception';
import { DeliveryService } from '../deliveries/delivery.service';
import { UUID_REGEX } from '../../utils/regex.util';
import { ProductModel } from '../models/model.entity';
import { ProductService } from '../products/product.service';
import { CustomerCouponService } from '../customer-coupons/customer-coupon.service';
import {
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
  Status,
} from '../../commons/enum.common';
import {
  getAllForceOptions,
  getAllJoinOptions,
  IPaginate,
  IPagination,
} from '../../utils/interface.util';
import { MAX_ELEMENTS_OF_PAGE } from '../../commons/const.common';
import { getTotalPages } from '../../utils/number.util';
import { PaymentService } from '../payments/payment.service';
import { CustomerCoupon } from '../customer-coupons/customer-coupon.entity';
import { OrderProductService } from '../order-products/order-product.service';
import { AccountService } from '../accounts/account.service';
import { PaginationService } from '../paginations/pagination.service';

@Injectable()
export class OrderService extends ServiceUtil<Order, Repository<Order>> {
  constructor(
    private dataSource: DataSource,
    private productService: ProductService,
    private customerCouponService: CustomerCouponService,
    private customerService: CustomerService,
    private deliveryService: DeliveryService,
    private accountService: AccountService,
    private paginationService: PaginationService<Order>,
    private orderProductService: OrderProductService,
    private productModelService: ProductModelService,
    @Inject(forwardRef(() => PaymentService))
    private paymentService: PaymentService,
  ) {
    super(dataSource.getRepository(Order));
  }

  async customerOrder(
    coupon: string,
    delivery: string,
    orderProducts: { modelId: string; quantity: number }[],
    username: string,
  ): Promise<void> {
    /**
     * reduce element of product array
     * increase quantity if two elements has same product model's id
     */
    const reduceProducts = orderProducts.reduce(
      (
        reduced: { modelId: string; quantity: number }[],
        product: { modelId: string; quantity: number },
      ) => {
        let checkExist = false;
        for (let i = 0; i < reduced.length; i++) {
          if (reduced[i].modelId === product.modelId) {
            checkExist = true;
            reduced[i].quantity = reduced[i].quantity + product.quantity;
          }
        }
        if (!checkExist) {
          reduced.push(product);
        }
        return reduced;
      },
      [],
    );
    /**
     * check product model
     * use map to save total quantity of model of same product
     */
    const quantityMap = new Map();
    const models: ProductModel[] = [];
    for (let i = 0; i < reduceProducts.length; i++) {
      const existModel = await this.productModelService.checkModel(
        reduceProducts[i],
      );
      models.push(existModel);
      const pkProduct = existModel.fkProduct.pkProduct;
      quantityMap.set(
        pkProduct,
        Number(quantityMap.get(pkProduct) | 0) + reduceProducts[i].quantity,
      );
    }
    /**
     * check customer coupon id
     */
    let existCustomerCoupon: CustomerCoupon;
    if (coupon) {
      existCustomerCoupon =
        await this.customerCouponService.getCustomerCouponById(coupon);
      if (existCustomerCoupon.used) {
        throw new AppHttpException(
          HttpStatus.BAD_REQUEST,
          'Your coupon was used',
        );
      }
      if (existCustomerCoupon.fkCoupon.status !== Status.ACTIVE) {
        throw new AppHttpException(
          HttpStatus.BAD_REQUEST,
          'Your coupon was remove',
        );
      }
      if (
        new Date(existCustomerCoupon.fkCoupon.end) < new Date() ||
        new Date(existCustomerCoupon.fkCoupon.begin) > new Date()
      ) {
        throw new AppHttpException(
          HttpStatus.BAD_REQUEST,
          'Can not used this coupon',
        );
      }
    }
    /**
     * get information
     */
    const existCustomer = await this.customerService.getCustomerByUsername(
      username,
    );
    if (!delivery.match(UUID_REGEX)) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Delivery id is not correct',
      );
    }
    /**
     * check account's delivery
     */
    const existDelivery = await this.deliveryService.getCustomerDelivery(
      delivery,
      existCustomer.pkCustomer,
    );
    /**
     * transaction for add order in db
     */
    await this.dataSource.transaction(async (entityManager) => {
      /**
       * create an order
       */
      const order = new Order();
      order.fkCustomer = existCustomer;
      order.fkDelivery = existDelivery;
      order.deliveryAddress = `${existDelivery.phone} - ${existDelivery.homeAddress} - ${existDelivery.district} - ${existDelivery.province}`;
      order.fkCustomerCoupon = existCustomerCoupon;
      order.discount = 0 | existCustomerCoupon?.fkCoupon.discount;
      // use customer coupon
      if (existCustomerCoupon) {
        existCustomerCoupon.used = true;
        await entityManager.save(existCustomerCoupon);
      }
      const existCoupon = existCustomerCoupon?.fkCoupon;
      await entityManager.save(order);
      /**
       * add product to order product
       */
      let allTotalPrice = 0;
      for (let i = 0; i < models.length; i++) {
        const orderProduct = new OrderProduct(
          models[i],
          order,
          reduceProducts[i].quantity,
        );
        orderProduct.priceBeforeSale = models[i].fkProduct.exportPrice;
        await entityManager.save(orderProduct);
        // get product
        const product = models[i].fkProduct;
        // get flashsale of product
        const flashSale = await this.productService.getFlashSaleProduct(
          product.pkProduct,
        );
        /**
         * resolve price after sale:
         * if( remain sale quantity < order quantity): no discount
         * else accept discount
         */
        orderProduct.priceAfterSale = product.exportPrice;
        if (flashSale) {
          if (
            Number(flashSale.remainQuantity) >=
            Number(quantityMap.get(models[i].fkProduct.pkProduct))
          ) {
            orderProduct.priceAfterSale =
              Number(product.exportPrice) - Number(flashSale.discount);
            /**
             * reduce flashsale remain quantity
             */
            flashSale.remainQuantity =
              (flashSale.remainQuantity - quantityMap.get(product.pkProduct)) |
              0;
            await entityManager.save(flashSale);
          }
        }
        /**
         * total price
         */
        orderProduct.totalPrice =
          orderProduct.priceAfterSale * reduceProducts[i].quantity;
        allTotalPrice += orderProduct.totalPrice;
        await entityManager.save(orderProduct);
        // reduce quantity instock of model
        models[i].quantityInStock =
          models[i].quantityInStock - reduceProducts[i].quantity;
        // reduce total quantity in map
        await entityManager.save(models[i]);
      }

      /**
       * resolve order information:
       * default shipment price is 10
       */
      order.shipmentPrice = 10;
      order.totalPrice = allTotalPrice;
      order.finalPrice =
        order.totalPrice -
        (Number(existCoupon?.discount) | 0) +
        order.shipmentPrice;
      await entityManager.save(order);
    });
  }

  async getOwnOrders(
    page: number,
    pLimit: string,
    search: string,
    sort: string,
    filter: string,
    range: string,
    username: string,
  ): Promise<IPagination<Order>> {
    if (page <= 0) page = 1;
    let limit = 25;
    if (Number(pLimit) !== NaN && Number(pLimit) >= 0) limit = Number(pLimit);
    const join: getAllJoinOptions = {
      rootName: 'order',
      joinColumns: [
        {
          column: 'order.products',
          optional: 'product',
        },
      ],
    };
    const existAccount = await this.accountService.getActiveAccountName(
      username,
    );
    const existCustomer = await this.customerService.getCustomerByAccount(
      existAccount.pkAccount,
    );
    const force: getAllForceOptions = {
      forces: [
        {
          column: 'fkCustomer',
          condition: existCustomer.pkCustomer,
        },
      ],
    };
    let totals = [];
    try {
      totals = await this.getAlls(search, sort, filter, force, join, range);
    } catch (error) {
      console.log(error);
    }
    const total = totals.length;
    const elements = totals.splice((page - 1) * limit, page * limit);
    this.paginationService.setPrefix('orders/own');
    return this.paginationService.getResponseObject(
      elements,
      total,
      page,
      limit,
      search,
      sort,
      filter,
    );
  }

  async customerGetDetails(username: string, id: string): Promise<Order> {
    const existCustomer = await this.customerService.getCustomerByUsername(
      username,
    );
    const order = await this.repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.fkCustomer', 'customer')
      .leftJoinAndSelect('order.fkCustomerCoupon', 'coupon')
      .leftJoinAndSelect('coupon.fkCoupon', 'detail')
      .leftJoinAndSelect('order.fkDelivery', 'delivery')
      .leftJoinAndSelect('order.products', 'products')
      .leftJoinAndSelect('products.fkProductModel', 'model')
      .leftJoinAndSelect('model.fkProduct', 'product')
      .leftJoinAndSelect('order.fkPayment', 'payment')
      .where('"order"."fkCustomer" = :customer AND "order"."pkOrder" = :id', {
        id,
        customer: existCustomer.pkCustomer,
      })
      .getOne();
    if (!order) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'You dont have this order',
      );
    }
    order.products.forEach((item) => {
      delete item.fkProductModel.fkProduct.importPrice;
    });
    return order;
  }

  async getAllOrders(
    page: number,
    pLimit: string,
    search: string,
    sort: string,
    filter: string,
    range: string,
    username: string,
  ): Promise<IPagination<Order>> {
    if (page <= 0) page = 1;
    let limit = 25;
    if (Number(pLimit) !== NaN && Number(pLimit) >= 0) limit = Number(pLimit);
    const join: getAllJoinOptions = {
      rootName: 'order',
      joinColumns: [
        {
          column: 'order.products',
          optional: 'product',
        },
      ],
    };
    let totals = [];
    try {
      totals = await this.getAlls(search, sort, filter, null, join, range);
    } catch (error) {
      console.log(error);
    }
    const total = totals.length;
    const elements = totals.splice((page - 1) * limit, page * limit);
    this.paginationService.setPrefix('orders/all');
    return this.paginationService.getResponseObject(
      elements,
      total,
      page,
      limit,
      search,
      sort,
      filter,
    );
  }

  async changeStatus(status: ShipmentStatus, id: string): Promise<void> {
    if (status === ShipmentStatus.COMPLETE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Only customer can be set complete status for order',
      );
    }
    const existOrder = await this.findOneByCondition({ pkOrder: id });
    if (!existOrder) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Order with this id is not exist',
      );
    }
    if (existOrder.shipmentStatus === ShipmentStatus.COMPLETE) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'This order was complete',
      );
    }
    existOrder.shipmentStatus = status;
    await existOrder.save();
  }

  async customerCompleteOrder(username: string, id: string): Promise<void> {
    const existCustomer = await this.customerService.getCustomerByUsername(
      username,
    );
    const existOrder = await this.findOneByCondition({
      fkCustomer: { pkCustomer: existCustomer.pkCustomer },
      pkOrder: id,
    });
    if (!existOrder) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        'Customer is not exist',
      );
    }
    if (existOrder.shipmentStatus !== ShipmentStatus.TRANSPORTING) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `This order was ${existOrder.shipmentStatus}`,
      );
    }
    existOrder.shipmentStatus = ShipmentStatus.COMPLETE;
    existOrder.status = OrderStatus.COMPLETE;
    await existOrder.save();
  }

  async saveOrder(order: Order): Promise<void> {
    await this.repository.save(order);
  }

  async cancelOrder(orderId: string, username: string): Promise<void> {
    const existOrder = await this.customerGetDetails(username, orderId);
    if (existOrder.shipmentStatus !== ShipmentStatus.PREPAIRING) {
      throw new AppHttpException(
        HttpStatus.BAD_REQUEST,
        `This order was ${existOrder.shipmentStatus}`,
      );
    }
    if (existOrder.paymentStatus === PaymentStatus.PAID) {
      await this.paymentService.refund(existOrder);
      existOrder.paymentStatus = PaymentStatus.REFUND;
    }
    existOrder.paymentStatus = PaymentStatus.REFUND;
    existOrder.shipmentStatus = ShipmentStatus.FAILURE;
    existOrder.status = OrderStatus.CANCEL;
    await this.dataSource.transaction(async (entityManager) => {
      const products = await this.orderProductService.getOrderProductByOrder(
        existOrder.pkOrder,
      );
      const returnQuantityPromise = products.map((item) => {
        return this.productModelService.returnQuantity(
          item.fkProductModel.pkProductModel,
          item.quantity,
        );
      });
      await Promise.all(returnQuantityPromise);
      await entityManager.save(existOrder);
    });
  }
}
