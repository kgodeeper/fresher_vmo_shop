import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddCouponDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  discount: string;

  @ApiProperty({
    default: new Date(),
  })
  @IsNotEmpty()
  @IsDateString()
  begin: string;

  @ApiProperty({
    default: new Date(),
  })
  @IsNotEmpty()
  @IsDateString()
  end: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  total: string;
}
