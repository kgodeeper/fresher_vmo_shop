import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppJwtService {
  constructor(private jwtService: JwtService) {}

  async signToken(payload: object, expiresIn: number): Promise<string> {
    return this.jwtService.signAsync(payload, { expiresIn });
  }

  async verifyToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      secret: new ConfigService().get<string>('SECRETSTR'),
    });
  }
}
