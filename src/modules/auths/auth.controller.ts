import {
  Body,
  Controller,
  Get,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
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

  @UseGuards(AuthGuard)
  @Get('')
  async checkAuth(): Promise<void> {
    return;
  }

  @Post('refresh')
  async getAccessToken(
    @Body() body: getAccessDto,
    @Session() session: any,
  ): Promise<{ accessToken: string }> {
    return this.authService.getAccessToken(body.refreshToken, session);
  }
}
