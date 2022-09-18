import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ServiceUtil } from '../../utils/service.utils';
import { DataSource, Repository } from 'typeorm';
import { OrderProduct } from './order-product.entity';
import { ProductService } from '../products/product.service';
import { OrderService } from '../orders/order.service';

@Injectable()
export class OrderProductService extends ServiceUtil<
  OrderProduct,
  Repository<OrderProduct>
> {
  constructor(private dataSource: DataSource) {
    super(dataSource.getRepository(OrderProduct));
  }

  async getOrderProductByOrder(orderId: string) {
    return this.repository
      .createQueryBuilder('order_product')
      .where('"fkOrder" = :orderId', { orderId })
      .leftJoinAndSelect('order_product.fkProductModel', 'model')
      .getMany();
  }
}
