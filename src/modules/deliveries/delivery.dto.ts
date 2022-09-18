import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import * as Regex from '../../utils/regex.util';
import * as Message from '../../commons/string.common';

export class AddDeliveryDto {
  @ApiProperty()
  @Matches(Regex.PHONE_REGEX, {
    message: Message.ValidatorMessage.PHONE_NOT_VALID,
  })
  phone: string;

  @ApiProperty()
  @Matches(Regex.FULLNAME_REGEX, {
    message: Message.ValidatorMessage.FULLNAME_NOT_VALID,
  })
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
  @Matches(Regex.UUID_REGEX, {
    message: Message.ValidatorMessage.UUID_NOT_VALID,
  })
  deliveryID: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(Regex.PHONE_REGEX, {
    message: Message.ValidatorMessage.PHONE_NOT_VALID,
  })
  phone: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(Regex.FULLNAME_REGEX, {
    message: Message.ValidatorMessage.FULLNAME_NOT_VALID,
  })
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
