import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RoleGuard } from '../../guards/role.guard';
import { AuthGuard } from '../../guards/auth.guard';
import { AddProductModelDto, UpdateProductModelDto } from './model.dto';
import { ProductModelService } from './model.service';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { Role } from '../../commons/enum.common';

@Controller('models')
@ApiTags('Models')
@ApiOkResponse()
@ApiBadRequestResponse()
export class ProductModelController {
  constructor(private productModelService: ProductModelService) {}

  @ApiBearerAuth()
  @Post()
  @ApiConsumes('application/x-www-form-urlencoded')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER, Role.SUPERUSER)
  async addProductModel(@Body() body: AddProductModelDto): Promise<void> {
    return this.productModelService.addProductModel(body);
  }

  @ApiBearerAuth()
  @Put()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER, Role.SUPERUSER)
  @ApiConsumes('application/x-www-form-urlencoded')
  async updateProductModel(@Body() body: UpdateProductModelDto): Promise<void> {
    return this.productModelService.updateProductModel(body.modelId, body);
  }

  @ApiBearerAuth()
  @Patch('status/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.CUSTOMER, Role.SUPERUSER)
  async changeModelStatus(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.productModelService.changeModelStatus(id);
  }
}
