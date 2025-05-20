import { Job } from "../models/Job";
import { messages } from "../utils/consts";
import { StatusCodes } from "http-status-codes";
import { log } from "../utils/logger";
import { ScrapeDto } from "../dtos/job";
import { ResponseType } from "../dtos/api";

export const scrapeService = async (payload: ScrapeDto) : Promise<ResponseType> => {
    return { ok : true, message : messages.OK, status : StatusCodes.OK }
}
