import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './account.controller';
import { Account } from './account.entity';
import { AccountService } from './account.service';

@Module({
  providers: [AccountService],
  imports: [TypeOrmModule.forFeature([Account])],
  controllers: [UserController],
  exports: [AccountService],
})
export class AccountModule {}
