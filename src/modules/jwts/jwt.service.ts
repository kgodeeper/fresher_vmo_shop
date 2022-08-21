import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JWTService {
  constructor(private jwtService: JwtService) {}
  async generateToken(payload: object, options: object): Promise<string> {
    return await this.jwtService.signAsync(payload, options);
  }
}
