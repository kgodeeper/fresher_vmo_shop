import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './configs/database.config';
import { AccountModule } from './modules/accounts/account.module';
import { AuthModule } from './modules/auths/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from './configs/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'src/configs/.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: databaseConfig,
    }),
    AccountModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
