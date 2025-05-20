import { logger } from '../config/logger';
import { log_levels } from './consts';

export const log = (level : log_levels, message : any) : void =>{
    logger.log(level, { timestamp : new Date(), message : message })
}