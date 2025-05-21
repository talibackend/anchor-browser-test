import Joi from 'joi';
import { ObjectSchema } from 'joi';
import { 
    ListJobBooksDto,
    ScrapeDto,
    SingleIdDto
} from '../../dtos/job';
import validator from '../validator';

export const scrapeValidation = (body: any) : ScrapeDto => {
    const schema : ObjectSchema = Joi.object({
        theme : Joi.string().required()
    });

    return validator(schema, body);
}

export const singleIdValidation = (body : any) : SingleIdDto =>{
    const schema : ObjectSchema = Joi.object({
        id : Joi.number().required()
    });

    return validator(schema, body);
}

export const listJobBooksValidation = (body : any) : ListJobBooksDto =>{
    const schema : ObjectSchema = Joi.object({
        id : Joi.number().required(),
        offset : Joi.number().optional().default(0),
        limit : Joi.number().optional().default(10)
    });

    let values = validator(schema, body);

    if(values.offset > 0){
        values.offset = values.offset * values.limit;
    }

    return values;
}