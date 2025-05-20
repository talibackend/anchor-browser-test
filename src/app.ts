import dotenv from 'dotenv';
dotenv.config();
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { sequelize } from './config/database';
import { log } from './utils/logger';
import { log_levels, messages } from './utils/consts';
import env from "./config/env";
import { StatusCodes } from 'http-status-codes';
import swaggerUi from "swagger-ui-express";
import swaggerFile from "../swagger-output-004weg24867t345rfubgb56661.json";

import { scrapeJob } from './services/job.service';

import jobRoutes from './routes/job.routes';
import { Job } from './models/Job';

const app: Express = express();

// Important middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Db Init and Sync
sequelize
  .sync({ alter: true })
  .then(async () => {
    log(log_levels.info, messages.DB_CONNECTED);

    app.listen(env.PORT, () => {
      log(log_levels.info, messages.SERVER_STARTED);
    });
  })
  .catch((err) => {
    log(log_levels.error, { message: messages.SERVER_FAILED_TO_START, err });
    process.exit(1);
  });


app.get("/swagger.json", (req: Request, res: Response): void => {
  /*
    #swagger.ignore = true
  */
  return res.download("swagger-output-0044556661.json");
});

app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use('/job',
  jobRoutes
  /* 
    #swagger.tags = ['Job']
    #swagger.responses[200] = {schema: { $ref: '#/definitions/RequestSuccessful' }}  
    #swagger.responses[400] = {schema: { $ref: '#/definitions/BadRequest' }}  
    #swagger.responses[500] = {schema: { $ref: '#/definitions/InternalServerError' }}  
    #swagger.responses[401] = {schema: { $ref: '#/definitions/Unauthorized', ifStatusPresent : true }}  
    #swagger.responses[403] = {schema: { $ref: '#/definitions/Forbidden', ifStatusPresent : true }}  
  */
);

app.use("*", (req: Request, res: Response): Response => {
  /* 
    #swagger.ignore = true
  */
  return res.status(StatusCodes.NOT_FOUND).json({
    ok: false,
    message: messages.NOT_FOUND,
    status: StatusCodes.NOT_FOUND,
  });
});

(async ()=>{
  setTimeout(async ()=>{
    let job = await Job.create({ search_string : "climate change" });
    await scrapeJob(job);
  }, 5000)
})()