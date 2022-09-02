import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { UUID_REGEX } from '../../utils/regex.util';

export class AddProductModelDto {
  @ApiProperty()
  @Matches(UUID_REGEX)
  product: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  memory: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  screen: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  os: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  color: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  quantityInStock: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  battery: string;
}
