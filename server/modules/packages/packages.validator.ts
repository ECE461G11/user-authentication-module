import Joi from "joi";

export const createPackageValidation = {
  body: Joi.object().keys({
    metadata: Joi.object({
      Name: Joi.string().required(),
      Version: Joi.string().optional(),
      ID: Joi.string().optional(),
    }),
    data: Joi.object({
      Content: Joi.string().optional(),
      URL: Joi.string().optional(),
      JSProgram: Joi.string().optional(),
    }),
  }),
};

export const getPackagesValidation = {
  body: Joi.object().keys({
    offset: Joi.string().optional(),
  }),
};
