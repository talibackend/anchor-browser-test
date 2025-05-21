import express, { Router, Request, Response } from 'express';
import controller from '../controllers/job.controller';
import { rateLimit } from 'express-rate-limit';

export const defaultRateLimit = rateLimit({
    windowMs : 1 * 60 * 1000,
    max : 1,
    message : 'Too many requests, please try again later.'
});

const routes : Router = express.Router();

routes.post('/scrape', 
    defaultRateLimit,
    controller.scrape
    /**
        #swagger.description = 'Scrape Theme'
        #swagger.parameters['body'] = { in: 'body', schema: { $ref : '#/definitions/ScrapePayload' } }
        #swagger.responses[200] = { in: 'body', schema: { $ref : '#/definitions/GetJobResponse' } }
     */
);

routes.get('/status/:id', 
    controller.getJob
    /**
        #swagger.description = 'Get Job by ID'
        #swagger.responses[200] = { in: 'body', schema: { $ref : '#/definitions/GetJobResponse' } }
    */
);

routes.get('/results/:id',
    controller.getJobBooks
    /**
        #swagger.description = 'Get Job by ID'
        #swagger.parameters["offset"] = { in : 'query', type : 'number' }
        #swagger.parameters["limit"] = { in : 'query', type : 'number' }
        #swagger.responses[200] = { in: 'body', schema: { $ref : '#/definitions/ListJobBooksResponse' } }
    */
);

export default routes;