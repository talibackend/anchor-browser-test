import express, { Router, Request, Response } from 'express';
import controller from '../controllers/job.controller';

const routes : Router = express.Router();

routes.post('/scrape', 
    controller.scrape
    /**
        #swagger.description = 'Scrape Theme'
        #swagger.parameters['body'] = { in: 'body', schema: { $ref : '#/definitions/ScrapePayload' } }
        #swagger.responses[200] = { in: 'body', schema: { $ref : '#/definitions/GetJobResponse' } }
     */
);

routes.get('/:id', 
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