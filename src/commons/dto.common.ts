import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { UUID_REGEX } from '../utils/regex.util';

export class EmailDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class UuidDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(UUID_REGEX)
  id: string;
}
