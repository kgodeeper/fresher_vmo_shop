import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
} from 'class-validator';

export class AddSaleDto {
  @ApiProperty({
    default: new Date(),
  })
  @IsNotEmpty()
  @IsDateString()
  begin: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  duration: string;
}

export class GetFutureDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  page: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  limit: string;
}
