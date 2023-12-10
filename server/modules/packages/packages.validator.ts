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
    }).custom((data) => {
      const hasContent = data.Content !== undefined && data.Content !== "";
      const hasURL = data.URL !== undefined && data.URL !== "";

      if ((hasContent && hasURL) || (!hasContent && !hasURL)) {
        throw new Error("Either Content or URL must be set, but not both.");
      }

      return data;
    }),
  }),
};

const packageQueryValidation = Joi.object().keys({
  Name: Joi.string().required(),
  Version: Joi.string().optional(),
});

export const getPackagesValidation = {
  body: Joi.array().items(packageQueryValidation),
};

export const getPackageRatingValidation = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

export const getAllPackagesValidation = {
  query: Joi.object().keys({
    limit: Joi.number().optional(),
    offset: Joi.number().optional(),
  }),
};
