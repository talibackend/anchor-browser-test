import Joi from 'joi';
import { ObjectSchema } from 'joi';
import { 
    ScrapeDto
} from '../../dtos/job';
import validator from '../validator';

export const scrapeValidation = (body: any) : ScrapeDto => {
    const schema : ObjectSchema = Joi.object({
        search_string: Joi.string().required()
    });

    return validator(schema, body);
}