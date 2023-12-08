import Joi from "joi";

export const register = {
  body: Joi.object().keys({
    User: Joi.object().keys({
      name: Joi.string().alphanum().min(3).required(),
      isAdmin: Joi.boolean().required(),
    }),
    Secret: Joi.object().keys({
      password: Joi.string()
        .min(8)
        .regex(/(?=.*[a-z])/)
        .regex(/(?=.*[A-Z])/)
        .regex(/(?=.*[0-9])/)
        .regex(/(?=.*[!@#$%^&*])/)
        .required(),
    }),
  }),
};

export const authentication = {
  body: Joi.object().keys({
    User: Joi.object().keys({
      name: Joi.string().required(),
      isAdmin: Joi.boolean().required(),
    }),
    Secret: Joi.object().keys({
      password: Joi.string().required(),
    }),
  }),
};
