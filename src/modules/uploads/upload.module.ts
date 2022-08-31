import { Module } from '@nestjs/common';
import { CloudinaryProvider } from '../../configs/upload.config';
import { UploadService } from './upload.service';

@Module({
  exports: [CloudinaryProvider, UploadService],
  providers: [CloudinaryProvider, UploadService],
})
export class UploadModule {}
