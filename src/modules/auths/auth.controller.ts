import { Body, Controller, Post, Session } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { getAccessDto, LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auths')
@ApiTags('Auths')
@ApiOkResponse()
@ApiBadRequestResponse()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async userRegister(@Body() body: RegisterDto) {
    return this.authService.userRegister(body);
  }

  @Post('login')
  async userLogin(@Body() body: LoginDto, @Session() session: any) {
    return this.authService.userLogin(body, session);
  }

  @Post('token')
  async getAccessToken(
    @Body() body: getAccessDto,
    @Session() session: any,
  ): Promise<{ accessToken: string }> {
    return this.authService.getAccessToken(body.refreshToken, session);
  }
}
