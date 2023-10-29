import Joi from 'joi';

export const register = {
  body: Joi.object().keys({
    username: 
      Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    password: Joi.string().required(),
    role: Joi.string().valid('admin', 'user', 'guest').required()
  })
};

export const login = {
  body: Joi.object().keys({
    username: 
      Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    password: Joi.string().required()
  })
};