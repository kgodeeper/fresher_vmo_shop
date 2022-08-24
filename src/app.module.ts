import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './configs/database.config';
import { AccountModule } from './modules/accounts/account.module';
import { AuthModule } from './modules/auths/auth.module';
import { SessionModule } from 'nestjs-session';
import { CustomerModule } from './modules/customers/customer.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DeliveryModule } from './modules/deliveries/delivery.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'src/configs/.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: databaseConfig,
    }),
    MulterModule.register({
      storage: memoryStorage(),
    }),
    SessionModule.forRoot({
      session: {
        secret: new ConfigService().get<string>('SECRETSTR'),
        resave: false,
        saveUninitialized: false,
      },
    }),
    CustomerModule,
    AccountModule,
    AuthModule,
    DeliveryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
