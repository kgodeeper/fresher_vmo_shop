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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'src/configs/.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: databaseConfig,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
