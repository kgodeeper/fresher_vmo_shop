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
    AuthModule,
    AccountModule,
    CustomerModule,
    DeliveryModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
