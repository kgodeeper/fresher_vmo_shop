import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { uuidRegex } from 'src/utils/regex.util';

export class DeliveryValidator {
  @JoiSchema(Joi.string().required().pattern(new RegExp('\\d{10,11}')))
  phone: string;

  @JoiSchema(Joi.string().required().pattern(new RegExp('[a-zA-Z ]{6,}$')))
  receiver: string;

  @JoiSchema(Joi.string().required())
  homeAddress: string;

  @JoiSchema(Joi.string().required())
  district: string;

  @JoiSchema(Joi.string().required())
  province: string;
}

export class UpdateDeliveryValidator {
  @JoiSchema(Joi.string().pattern(uuidRegex).required())
  pkAddress: string;

  @JoiSchema(Joi.string().pattern(new RegExp('\\d{10,11}')))
  phone: string;

  @JoiSchema(Joi.string().pattern(new RegExp('[a-zA-Z ]{6,}$')))
  receiver: string;

  @JoiSchema(Joi.string())
  homeAddress: string;

  @JoiSchema(Joi.string())
  district: string;

  @JoiSchema(Joi.string())
  province: string;
}
