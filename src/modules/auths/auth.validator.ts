import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class LoginValidator {
  @JoiSchema(Joi.string().min(6).required())
  account: string;

  @JoiSchema(Joi.string().min(8).required())
  password: string;
}

export class RegisterValidator {
  @JoiSchema(Joi.string().pattern(new RegExp('[a-zA-Z0-9]{6,}$')).required())
  username: string;

  @JoiSchema(
    Joi.string()
      .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$'))
      .required(),
  )
  password: string;

  @JoiSchema(Joi.string().email())
  email: string;
}
