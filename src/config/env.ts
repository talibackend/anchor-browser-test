import Joi from "joi";
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

    MAX_INSTANCES_IN_POOL : Joi.number().default(4),
    MAX_OPEN_PAGES_PER_INSTANCE: Joi.number().default(20),

    KAFKA_BROKERS : Joi.string().required(),
    MAX_JOB_RETRIES: Joi.number().default(3),
  }).unknown(true);

  return validator(schema, process.env);
};

export default env();
