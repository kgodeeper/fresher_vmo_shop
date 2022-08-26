import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { commonStatus } from 'src/commons/enum.common';
import { uuidRegex } from 'src/utils/regex.util';

export class ProductValidator {
  @ApiProperty()
  @JoiSchema(Joi.string().required())
  name: string;

  @ApiProperty()
  @JoiSchema(Joi.number().min(0).required())
  importPrice: number;

  @ApiProperty()
  @JoiSchema(Joi.number().min(0).required())
  exportPrice: number;

  @ApiProperty()
  @JoiSchema(Joi.number().min(0))
  weight: number;

  @ApiProperty()
  @JoiSchema(Joi.string())
  desciption: string;

  @ApiProperty()
  @JoiSchema(Joi.string().pattern(uuidRegex).required())
  category: string;

  @ApiProperty()
  @JoiSchema(Joi.string().pattern(uuidRegex).required())
  suplier: string;
}

export class StatusValidator {
  @ApiProperty()
  @JoiSchema(Joi.string().valid(commonStatus.ACTIVE, commonStatus.INACTIVE))
  status: string;
}

export class ProductIdValidator {
  @ApiProperty()
  @JoiSchema(Joi.string().pattern(uuidRegex).required())
  productId: string;
}

export class UpdateProductValidator {
  @ApiProperty()
  @JoiSchema(Joi.string())
  name: string;

  @ApiProperty()
  @JoiSchema(Joi.number().min(0))
  importPrice: number;

  @ApiProperty()
  @JoiSchema(Joi.number().min(0))
  exportPrice: number;

  @ApiProperty()
  @JoiSchema(Joi.number().min(0))
  weight: number;

  @ApiProperty()
  @JoiSchema(Joi.string())
  desciption: string;

  @ApiProperty()
  @JoiSchema(Joi.string().pattern(uuidRegex))
  category: string;

  @ApiProperty()
  @JoiSchema(Joi.string().pattern(uuidRegex))
  suplier: string;
}
