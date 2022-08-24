import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { accountRole } from 'src/commons/enum.common';
import { uuidRegex } from 'src/utils/regex.util';

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

export class AddAccountValidator {
  @JoiSchema(Joi.string().email().required())
  email: string;

  @JoiSchema(
    Joi.string().valid(
      accountRole.CUSTOMER,
      accountRole.STAFF,
      accountRole.SUPERUSER,
    ),
  )
  role: accountRole;
}

export class PKAccountValidator {
  @JoiSchema(Joi.string().pattern(uuidRegex).required())
  account: string;
}

export class ChangeRoleValidator {
  @JoiSchema(
    Joi.string()
      .valid(accountRole.CUSTOMER, accountRole.STAFF, accountRole.SUPERUSER)
      .required(),
  )
  role: string;

  @JoiSchema(Joi.string().pattern(uuidRegex).required())
  account: string;
}
