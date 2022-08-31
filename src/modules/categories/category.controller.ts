import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IPaginate } from '../../utils/interface.util';
import { UuidDto } from '../../commons/dto.common';
import { Role } from '../../commons/enum.common';
import { RequireRoles } from '../../decorators/bind-role.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { AddCategoryDto } from './category.dto';
import { Category } from './category.entity';
import { CategoryService } from './category.service';

@Controller('categories')
@ApiTags('Categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}
  @ApiOkResponse({
    description: 'Add category success',
  })
  @ApiBadRequestResponse({
    description: 'Add category failure',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'banner'],
      properties: {
        name: { type: 'string' },
        banner: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER)
  @UseInterceptors(FileInterceptor('banner'))
  async addCategory(
    @Body() body: AddCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    return this.categoryService.addCategory(body, file);
  }

  @ApiOkResponse({
    description: 'Update category success',
  })
  @ApiBadRequestResponse({
    description: 'Update category failure',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        banner: {
          type: 'string',
          format: 'binary',
        },
        name: {
          type: 'string',
        },
      },
    },
  })
  @Patch(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.SUPERUSER, Role.STAFF)
  @UseInterceptors(FileInterceptor('banner'))
  async updateCategory(
    @Body() body: { name: string },
    @Param() params: UuidDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    return this.categoryService.updateCategory(params.id, body.name, file);
  }

  @ApiOkResponse({
    description: 'swap category success',
  })
  @ApiBadRequestResponse({
    description: 'swap category failure',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
  })
  @Patch('swap/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  async swapCategoryPosition(@Param() params: UuidDto, @Body() body: UuidDto) {
    return this.categoryService.swapPosition(params.id, body.id);
  }

  @ApiOkResponse({
    description: 'Remove category success',
  })
  @ApiBadRequestResponse({
    description: 'Removecategory failure',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthornized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
  })
  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @RequireRoles(Role.STAFF, Role.SUPERUSER)
  async removeCategory(@Param() params: UuidDto): Promise<void> {
    return this.categoryService.removeCategory(params.id);
  }

  @Get('active/:page')
  async getActiveCategory(
    @Param('page', new ParseIntPipe()) page: number,
  ): Promise<IPaginate<Category>> {
    return this.categoryService.getActiveCategory(page);
  }
}
