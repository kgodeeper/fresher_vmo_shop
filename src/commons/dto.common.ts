import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
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

export class GetResourceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  page: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  limit: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sort: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  filter: string;
}
