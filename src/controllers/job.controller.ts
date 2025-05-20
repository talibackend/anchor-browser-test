import { Request, Response } from 'express';
import { log } from '../utils/logger';
import { scrapeValidation } from '../utils/validations/job.validation';
import {
    scrapeService
} from '../services/job.service';
import { log_levels } from '../utils/consts';

export default {
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