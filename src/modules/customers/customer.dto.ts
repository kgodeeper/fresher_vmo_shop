import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Gender } from '../../commons/enum.common';
import { FULLNAME_REGEX } from '../../utils/regex.util';

export class UpdateCustomerInformationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(FULLNAME_REGEX)
  fullname: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dob: string;
}
