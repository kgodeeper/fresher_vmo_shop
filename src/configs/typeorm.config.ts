import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DBHOST'),
      port: this.configService.get<number>('DBPORT'),
      username: this.configService.get<string>('DBUSER'),
      password: this.configService.get<string>('DBPASS'),
      database: this.configService.get<string>('DBNAME'),
      entities: [`${__dirname}/../**/**/*.entity{.ts,.js}`],
      synchronize: true,
    };
  }
}
