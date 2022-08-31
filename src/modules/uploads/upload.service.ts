import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}
  async uploadImage(
    file: Express.Multer.File,
    destination: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (!file.mimetype.includes('image'))
      throw new BadRequestException('File extension is not allowed');
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        {
          folder: `${this.configService.get<string>(
            'UPLOAD_BASE_FOLDER',
          )}/${destination}`,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      Readable.from(file.buffer).pipe(upload);
    });
  }

  async uploadToCloudinary(
    file: Express.Multer.File,
    destination: string,
  ): Promise<any> {
    return this.uploadImage(file, destination).catch((error) => {
      if (error instanceof BadRequestException) throw error;
      else throw new BadRequestException('Upload file fail');
    });
  }

  async removeFromCloudinary(url: string, destination: string): Promise<void> {
    v2.uploader.destroy(
      `${this.configService.get<string>(
        'UPLOAD_BASE_FOLDER',
      )}/${destination}/${url}`,
    );
  }
}
