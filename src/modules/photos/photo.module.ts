import { Module } from '@nestjs/common';
import { UploadModule } from '../uploads/upload.module';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';

@Module({
  imports: [UploadModule],
  exports: [PhotoService],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
