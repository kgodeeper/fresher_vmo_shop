import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { categoryStatus } from 'src/commons/enum.common';

export class CategoryValidator {
  @JoiSchema(Joi.string().required())
  name: string;

  @JoiSchema(Joi.string().valid(categoryStatus.ACTIVE, categoryStatus.INACTIVE))
  status: string;
}

export class UpdateCategoryValidator {
  @JoiSchema(Joi.string())
  name: string;

  @JoiSchema(Joi.string().valid(categoryStatus.ACTIVE, categoryStatus.INACTIVE))
  status: string;
}
