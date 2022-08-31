import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { UUID_REGEX } from '../../utils/regex.util';

export class AddProductDto {
  @IsNotEmpty()
  @Matches(UUID_REGEX)
  category: string;

  @IsNotEmpty()
  @Matches(UUID_REGEX)
  suplier: string;
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumberString()
  importPrice: string;

  @IsNotEmpty()
  @IsNumberString()
  exportPrice: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumberString()
  weight: string;
}
