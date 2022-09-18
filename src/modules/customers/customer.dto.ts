import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, Matches } from 'class-validator';
import { Gender } from '../../commons/enum.common';
import { FULLNAME_REGEX } from '../../utils/regex.util';
import * as Message from '../../commons/string.common';

export class UpdateCustomerInformationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(FULLNAME_REGEX, {
    message: Message.ValidatorMessage.FULLNAME_NOT_VALID,
  })
  fullname: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender, { message: Message.ValidatorMessage.GENDER_NOT_VALID })
  gender: Gender;

  @ApiProperty({
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dob: string;
}
