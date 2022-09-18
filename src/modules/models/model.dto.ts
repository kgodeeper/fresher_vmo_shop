import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { UUID_REGEX } from '../../utils/regex.util';
import * as Message from '../../commons/string.common';

export class AddProductModelDto {
  @ApiProperty()
  @Matches(UUID_REGEX, { message: Message.ValidatorMessage.UUID_NOT_VALID })
  product: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  memory: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  color: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  quantityInStock: string;
}

export class UpdateProductModelDto {
  @ApiProperty()
  @Matches(UUID_REGEX, { message: Message.ValidatorMessage.UUID_NOT_VALID })
  modelId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  memory: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  color: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  quantityInStock: string;
}
