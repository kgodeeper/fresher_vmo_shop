import { Module } from '@nestjs/common';
import { PictureService } from './picture.service';

@Module({
  imports: [],
  exports: [PictureService],
  providers: [PictureService],
  controllers: [],
})
export class PictureModule {}
