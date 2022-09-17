import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AppHttpException } from '../../exceptions/http.exception';

@Injectable()
export class AppJwtService {
  constructor(private jwtService: JwtService) {}

  async signToken(payload: object, expiresIn: number): Promise<string> {
    return this.jwtService.signAsync(payload, { expiresIn });
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verifyAsync(token, {
        secret: new ConfigService().get<string>('SECRETSTR'),
      });
    } catch (error) {
      throw new AppHttpException(HttpStatus.BAD_REQUEST, error.message);
    }
  }
}
