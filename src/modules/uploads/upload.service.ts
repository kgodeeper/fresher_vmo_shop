import { BadRequestException, Injectable } from '@nestjs/common';
import { v2, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (!file.mimetype.includes('image'))
      throw new BadRequestException('File extension is not allowed');
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { folder: 'laptop_shop_uploads' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      Readable.from(file.buffer).pipe(upload);
    });
  }

  async uploadToCloudinary(file: Express.Multer.File): Promise<any> {
    return this.uploadImage(file).catch((error) => {
      if (error instanceof BadRequestException) throw error;
      else throw new BadRequestException('Upload file fail');
    });
  }

  async removeFromCloudinary(url: string): Promise<void> {
    v2.uploader.destroy(`laptop_shop_uploads/${url}`);
  }
}
