import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { customerGender } from 'src/commons/enum.common';

export class CustomerValidator {
  @JoiSchema(Joi.string().alphanum())
  fullname: string;

  @JoiSchema(Joi.date())
  dob: string;

  @JoiSchema(
    Joi.string().valid(
      customerGender.MALE,
      customerGender.FEMALE,
      customerGender.OTHER,
    ),
  )
  gender: string;
}
