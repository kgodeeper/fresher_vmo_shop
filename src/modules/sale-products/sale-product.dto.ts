import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumberString,
  Matches,
} from 'class-validator';
import { UUID_REGEX } from '../../utils/regex.util';

export class AddSaleProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @Matches(UUID_REGEX)
  product: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(UUID_REGEX)
  sale: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  total: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  discount: string;
}
