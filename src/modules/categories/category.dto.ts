import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { UUID_REGEX } from 'src/utils/regex.util';

export class AddCategoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  banner: string;
}

export class updateCategoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  banner: string;
}
