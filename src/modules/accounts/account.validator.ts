import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
export class VerifyValidator {
  @JoiSchema(Joi.string().email().required())
  email: string;

  @JoiSchema(Joi.string().pattern(new RegExp('\\d{5}$')))
  verifyCode: string;
}
