import { Request, Response } from 'express';
import { log } from '../utils/logger';
import { scrapeValidation, singleIdValidation, listJobBooksValidation } from '../utils/validations/job.validation';
import { scrapeService, getJobByIdService, listJobBooksService } from '../services/job.service';
import { log_levels } from '../utils/consts';

export default {
    getJobBooks : async (req : Request, res : Response) : Promise<Response> =>{
        const { ip, url, params, query } = req;

        try {
            const payload = listJobBooksValidation({...query, ...params});
            const service = await listJobBooksService(payload);
            return res.status(service.status).json({ ...service });
        } catch (error: any) {
            log(log_levels.error, { error, ip, url });
            return res.status(error.status).json({ ...error });
        }
    },
    getJob : async (req : Request, res : Response) : Promise<Response> =>{
        const { ip, url, params } = req;

        try {
            const payload = singleIdValidation(params);
            const service = await getJobByIdService(payload);
            return res.status(service.status).json({ ...service });
        } catch (error: any) {
            log(log_levels.error, { error, ip, url });
            return res.status(error.status).json({ ...error });
        }
    },
    scrape : async (req : Request, res : Response) : Promise<Response> =>{
        const { ip, url, body } = req;

        try {
            const payload = scrapeValidation(body);
            const service = await scrapeService(payload);
            return res.status(service.status).json({ ...service });
        } catch (error: any) {
            log(log_levels.error, { error, ip, url });
            return res.status(error.status).json({ ...error });
        }
    }
}