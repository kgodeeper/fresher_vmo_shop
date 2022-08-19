import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './configs/database.config';
import { UserModule } from './modules/users/user.module';
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
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
