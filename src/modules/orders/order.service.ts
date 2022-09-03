import { HttpStatus, Injectable } from '@nestjs/common';
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
import { Status } from '../../commons/enum.common';

@Injectable()
export class OrderService extends ServiceUtil<Order, Repository<Order>> {
  constructor(
    private dataSource: DataSource,
    private productService: ProductService,
    private customerCouponService: CustomerCouponService,
    private customerService: CustomerService,
    private deliveryService: DeliveryService,
    private productModelService: ProductModelService,
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
     */
    const models: ProductModel[] = [];
    for (let i = 0; i < reduceProducts.length; i++) {
      const existModel = await this.productModelService.checkModel(
        reduceProducts[i],
      );
      models.push(existModel);
    }
    /**
     * check customer coupon id
     */
    let existCustomerCoupon;
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
      order.fkCustomerCoupon = existCustomerCoupon;
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
            Number(reduceProducts[i].quantity)
          ) {
            orderProduct.priceAfterSale =
              Number(product.exportPrice) - Number(flashSale.discount);
            /**
             * reduce flashsale remain quantity
             */
            flashSale.remainQuantity =
              flashSale.remainQuantity - reduceProducts[i].quantity;
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
        await entityManager.save(models[i]);
      }

      /**
       * resolve order information:
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
}
