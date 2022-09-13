import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auths/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './configs/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { SessionModule } from 'nestjs-session';
import { sessionConfig } from './configs/session.config';
import { AccountModule } from './modules/accounts/account.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CustomerModule } from './modules/customers/customer.module';
import { DeliveryModule } from './modules/deliveries/delivery.module';
import { CategoryModule } from './modules/categories/category.module';
import { ProductModule } from './modules/products/product.module';
import { PhotoModule } from './modules/photos/photo.module';
import { ProductModelModule } from './modules/models/model.module';
import { SaleProductModule } from './modules/sale-products/sale-product.module';
import { CouponModule } from './modules/coupons/coupon.module';
import { CustomerCouponModule } from './modules/customer-coupons/customer-coupon.module';
import { OrderModule } from './modules/orders/order.module';
import { SaleModule } from './modules/sales/sale.module';
import { ScheduleModule } from '@nestjs/schedule';
import EmailSchedulingService from './modules/schedules/email-scheduling.service';
import { MailModule } from './modules/mailer/mail.module';
import { CacheSchedulingService } from './modules/schedules/cache-scheduling.service';
import { PaymentModule } from './modules/payments/payment.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
    }),
    ConfigModule.forRoot({
      envFilePath: 'src/configs/.env',
      isGlobal: true,
    }),
    SessionModule.forRootAsync({
      useFactory: async () => await sessionConfig(),
    }),
    MulterModule.register({
      storage: memoryStorage(),
    }),
    ScheduleModule.forRoot(),
    MailModule,
    AuthModule,
    AccountModule,
    CustomerModule,
    DeliveryModule,
    CategoryModule,
    ProductModule,
    PhotoModule,
    ProductModelModule,
    SaleProductModule,
    CouponModule,
    CustomerCouponModule,
    OrderModule,
    SaleModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [EmailSchedulingService, CacheSchedulingService],
})
export class AppModule {}
