import { Module } from '@nestjs/common';
import { SuplierService } from './suplier.service';

@Module({
  imports: [],
  exports: [SuplierService],
  providers: [SuplierService],
})
export class SuplierModule {}
