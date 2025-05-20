import winston from 'winston';
import path from 'path';
import { log_levels } from '../utils/consts';

export const logger = winston.createLogger({
    transports : []
});

logger.add(new winston.transports.File({ filename : path.resolve(__dirname, '../../logs/info.log'), level : log_levels.info }));
logger.add(new winston.transports.File({ filename : path.resolve(__dirname, '../../logs/error.log'), level : log_levels.error }));
logger.add(new winston.transports.File({ filename : path.resolve(__dirname, '../../logs/warn.log'), level : log_levels.warn }));

if(process.env.NODE_ENV != 'production'){
    logger.add(new winston.transports.Console());
}