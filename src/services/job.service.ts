import { Job } from "../models/Job";
import { job_statuses, kafka_topics, log_levels, messages } from "../utils/consts";
import { StatusCodes } from "http-status-codes";
import { log } from "../utils/logger";
import { ListJobBooksDto, ScrapeDto, SingleIdDto } from "../dtos/job";
import { ResponseType } from "../dtos/api";
import { deduplicateArray, pauseExecution, replaceAll } from "../utils/general";
import { Book } from "../models/Book";
import { publishMessageToTopic } from "../utils/kafka";
import browserPool from "../config/browser-pool";

export const listJobBooksService = async (payload : ListJobBooksDto) : Promise<ResponseType> =>{
    let { id, limit, offset } = payload;

    let books = await Book.findAll({ where : { job_id : id }, limit, offset });
    let total_count = await Book.count({ where : { job_id : id } });
    let total_pages = Math.ceil(total_count / limit);

    if(offset > 0){
        offset = offset / limit;
    }

    return { ok : true, message : messages.OK, status : StatusCodes.OK, body : { books, total_count, total_pages, limit, offset } };
}

export const getJobByIdService = async (payload : SingleIdDto) : Promise<ResponseType> =>{
    const job = await Job.findOne({ where : { id : payload.id } });

    if(!job){
        throw { ok : false, message : messages.NOT_FOUND, status : StatusCodes.NOT_FOUND };
    }

    return { ok : true, message : messages.OK, status : StatusCodes.OK, body : { job } };
}

export const scrapeService = async (payload: ScrapeDto): Promise<ResponseType> => {
    const { theme } = payload;
    const job = await Job.create({ theme });
    scrapeJob(job);
    return { ok: true, message: messages.OK, status: StatusCodes.OK, body : { job } }
}

export const scrapeJob = async (job: Job): Promise<void> => {
    try {
        let url = `https://bookdp.com.au/?s=${replaceAll(job.theme.toLowerCase(), " ", "+")}&post_type=product`;
        const timeout = 1000 * 60 * 2; // 2 minutes

        let page = await browserPool.newPage();
        await page.goto(url, { waitUntil: 'networkidle0', timeout });
        await page.evaluate(() => { window.scrollTo(0, document.body.scrollHeight); });
        await pauseExecution(1000);
        await page.waitForNetworkIdle({ idleTime: 5000, timeout });

        let links: Array<string> = await page.$$eval('div.product-inner > div.product-thumbnail > a', (links: any) => { return links.map((link: any) => { return link.href }) });
        links = deduplicateArray(links);

        let percent_per_page = 100 / links.length;

        await page.close();  

        for(let i = 0; i < links.length; i++){
            let link = links[i];
            try{
                publishMessageToTopic(kafka_topics.scrape_book_jobs, { main_job_id: job.id, link, number_of_attempts : 0, progress_weight : percent_per_page });
            }catch(error : any){
                log(log_levels.error, `Failed to publish message for link ${link}: ${error.message} on job ${job.id}`);
                continue;
            }
        }
    } catch (error: any) {
        console.log("Error in scrapeJob:", error);
        await Job.update({ status: job_statuses.failed }, { where: { id: job.id } });
        log(log_levels.error, error);
        return
    }
}