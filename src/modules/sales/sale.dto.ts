import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumberString } from 'class-validator';

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
