import { Body, Controller, Post, Session, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserBound } from '../../decorators/bind-user.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { getAccessDto, LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auths')
@ApiTags('Auths')
@ApiOkResponse()
@ApiBadRequestResponse()
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('register')
  async userRegister(@Body() body: RegisterDto) {
    return this.authService.userRegister(body);
  }

  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('login')
  async userLogin(@Body() body: LoginDto, @Session() session: any) {
    return this.authService.userLogin(body, session);
  }

  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('refresh')
  async getAccessToken(
    @Body() body: getAccessDto,
    @Session() session: any,
  ): Promise<{ accessToken: string }> {
    return this.authService.getAccessToken(body.refreshToken, session);
  }

  @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(
    @UserBound() username: string,
    @Session() session: any,
  ): Promise<void> {
    return this.authService.logout(username, session.sessionId);
  }
}
