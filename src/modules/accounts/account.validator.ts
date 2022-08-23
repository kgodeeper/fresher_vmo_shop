import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class VerifyValidator {
  @JoiSchema(Joi.string().email().required())
  email: string;

  @JoiSchema(Joi.string().pattern(new RegExp('\\d{5}$')))
  verifyCode: string;
}

export class changePasswordByToken {
  @JoiSchema(Joi.string().required())
  presentToken: string;

  @JoiSchema(
    Joi.string()
      .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$'))
      .required(),
  )
  password: string;
}

export class ChangePasswordValidator {
  @JoiSchema(
    Joi.string()
      .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$'))
      .required(),
  )
  oldPassword: string;

  @JoiSchema(
    Joi.string()
      .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$'))
      .required(),
  )
  newPassword: string;
}
