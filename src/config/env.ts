import * as Joi from "joi";
import validator from "../utils/validator";

const env = () => {
  const schema: Joi.ObjectSchema = Joi.object({
    APP_NAME: Joi.string().required(),
    NODE_ENV: Joi.string()
      .valid("development", "staging", "production")
      .required(),
    PORT: Joi.number().required(),

    DB_CONNECTION_STRING: Joi.string().required(),

    OPEN_AI_API_KEY: Joi.string().required(),
    MAKE_WEBHOOK_URL: Joi.string().required(),

  }).unknown(true);

  return validator(schema, process.env);
};

export default env();
