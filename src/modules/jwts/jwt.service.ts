import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JWTService {
  constructor(private jwtService: JwtService) {}
  async generateToken(payload: object, options: object): Promise<string> {
    return this.jwtService.signAsync(payload, options);
  }
  async verifyToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      secret: new ConfigService().get<string>('SECRETSTR'),
    });
  }
}
