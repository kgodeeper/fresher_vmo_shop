import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import * as Regex from '../../utils/regex.util';

export class AddDeliveryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(Regex.PHONE_REGEX)
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(Regex.FULLNAME_REGEX)
  receiver: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  homeAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  province: string;
}

export class UpdateDeliveryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(Regex.UUID_REGEX)
  deliveryID: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(Regex.PHONE_REGEX)
  phone: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(Regex.FULLNAME_REGEX)
  receiver: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  homeAddress: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  district: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  province: string;
}
