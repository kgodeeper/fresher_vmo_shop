import { ApiProperty, ApiQuery } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { UUID_REGEX } from '../../utils/regex.util';
import * as Message from '../../commons/string.common';
import { PhoneOs } from '../../commons/enum.common';

export class AddProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @Matches(UUID_REGEX, { message: Message.ValidatorMessage.UUID_NOT_VALID })
  category: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(UUID_REGEX, { message: Message.ValidatorMessage.UUID_NOT_VALID })
  suplier: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  importPrice: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  exportPrice: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsNumberString()
  weight: string;

  @ApiProperty({ required: true, type: 'string', format: 'binary' })
  @IsOptional()
  avatar: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  barcode: string;

  @ApiProperty()
  @IsEnum(PhoneOs)
  os: PhoneOs;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  screen: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  battery: string;

  @ApiProperty({
    required: false,
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  @IsOptional()
  photos: string[];
}

export class getProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @ApiProperty()
  @IsOptional()
  @IsNumberString()
  limit: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sort: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  filter: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  range: string;
}

export class UpdateProductDto {
  @ApiProperty()
  @Matches(UUID_REGEX, { message: Message.ValidatorMessage.UUID_NOT_VALID })
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(UUID_REGEX, { message: Message.ValidatorMessage.UUID_NOT_VALID })
  category: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(UUID_REGEX, { message: Message.ValidatorMessage.UUID_NOT_VALID })
  suplier: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  importPrice: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  exportPrice: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  weight: string;

  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  avatar: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  barcode: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(PhoneOs)
  os: PhoneOs;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  screen: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  battery: string;
}
