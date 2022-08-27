import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { commonStatus } from 'src/commons/enum.common';

export class CategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEnum(commonStatus)
  @IsNotEmpty()
  status: commonStatus;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsEnum(commonStatus)
  @IsOptional()
  status: commonStatus;
}
