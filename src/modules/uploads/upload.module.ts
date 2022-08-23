import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { UploadService } from './upload.service';

@Module({
  exports: [CloudinaryProvider, UploadService],
  providers: [CloudinaryProvider, UploadService],
})
export class UploadModule {}
