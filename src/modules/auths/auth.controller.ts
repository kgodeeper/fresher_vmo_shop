import { Body, Controller, Post, Session } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auths')
@ApiTags('Auths')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiExtraModels(RegisterDto)
  @ApiOkResponse({
    description: 'register success, account status is inactive',
  })
  @ApiBadRequestResponse({
    description: 'register fail: account is exist, validate error',
  })
  @Post('register')
  async userRegister(@Body() body: RegisterDto) {
    return this.authService.userRegister(body);
  }

  @ApiExtraModels(LoginDto)
  @ApiOkResponse({
    description: 'Login success, return accessToken and refreshToken',
  })
  @ApiBadRequestResponse({
    description: 'Login failure, validate error',
  })
  @Post('login')
  async userLogin(@Body() body: LoginDto, @Session() session: any) {
    return this.authService.userLogin(body, session);
  }

  @ApiOkResponse({
    description: 'Get token success, return accessToken',
  })
  @ApiBadRequestResponse({
    description: 'Get token failure, invalid refreshToken',
  })
  @ApiBody({
    schema: {
      required: ['refreshToken'],
      properties: {
        refreshToken: { type: 'string' },
      },
    },
  })
  @Post('token')
  async getAccessToken(
    @Body('refreshToken') refreshToken: string,
    @Session() session: any,
  ): Promise<{ accessToken: string }> {
    return this.authService.getAccessToken(refreshToken, session);
  }
}
