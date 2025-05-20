import express, { Router, Request, Response } from 'express';

const routes : Router = express.Router();

routes.post('/scrape', 
    
    /**
        #swagger.description = 'Create Account'
        #swagger.parameters['body'] = { in: 'body', schema: { $ref : '#/definitions/CreateAccountPayload' } }
     */
);

export default routes;