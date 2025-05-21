import { Job } from "../models/Job";
import { job_statuses, log_levels, messages, request_methods } from "../utils/consts";
import { StatusCodes } from "http-status-codes";
import { log } from "../utils/logger";
import { ListJobBooksDto, ScrapeDto, SingleIdDto } from "../dtos/job";
import { ResponseType } from "../dtos/api";
import { deduplicateArray, pauseExecution, replaceAll } from "../utils/general";
import { openRequest } from "../utils/network";
import { getAuthorFromCover, getSummaryAndRelevanceScore } from "./openai.service";
import puppeteer from "puppeteer";
import { Book } from "../models/Book";
import env from "../config/env";
import { sequelize } from "../config/database";

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
    const { search_string } = payload;
    const job = await Job.create({ search_string });
    scrapeJob(job);
    return { ok: true, message: messages.OK, status: StatusCodes.OK, body : { job } }
}

export const scrapeJob = async (job: Job): Promise<void> => {
    try {
        let url = `https://bookdp.com.au/?s=${replaceAll(job.search_string.toLowerCase(), " ", "+")}&post_type=product`;
        const timeout = 1000 * 60 * 2; // 1 minutes

        let browser = await puppeteer.launch({ args : ['--no-sandbox'], timeout });
        let page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0', timeout });
        // await page.evaluate(() => { window.scrollTo(0, document.body.scrollHeight); });
        // await pauseExecution(1000);
        // await page.waitForNetworkIdle({ idleTime: 5000, timeout });

        let links: Array<string> = await page.$$eval('a', (links: any) => { return links.map((link: any) => { return link.href }) });
        links = deduplicateArray(links.filter((link: string) => link.startsWith("https://bookdp.com.au/products/")));

        links = links.slice(0, 10);

        const analyzeBookPage = async (link: string): Promise<void> => {
            try {
                let page = await browser.newPage();
                await page.goto(link, { waitUntil: 'networkidle0', timeout });

                let title = (await page.$eval('title', (title: any) => { return title.innerText })).split("|")[0].trim();
                let desc = await page.$eval('div#tab-description > div.woocommerce-tabs--description-content', (description: any) => { return description.innerText });
                let prices = await page.$$eval('span.woocommerce-Price-amount > bdi', (prices: any) => { return prices.map((price: any) => { return price.innerText }) });
                let cover = await page.$eval('img.wp-post-image', (img : any) => { return img.src });
                let discounted_price = Number(prices[0].substring(1));
                let original_price = Number(prices[1].substring(1));
                let discount_amount = original_price - discounted_price;
                let discount_percent = Number(((discount_amount / original_price) * 100).toPrecision(2));
                let { author, summary, relevance_score } = await getSummaryAndRelevanceScore(desc, job.search_string);
                let value_score = Number(((relevance_score * (100 - discount_percent)) / 100).toPrecision(2));

                await page.close();

                if(author == "N/A"){
                    author = await getAuthorFromCover(cover)
                }

                let payload = {
                    job_id: job.id,
                    title,
                    author,
                    desc,
                    summary,
                    current_price: discounted_price,
                    original_price,
                    discount_amount,
                    discount_percent,
                    url: link,
                    relevance_score,
                    value_score
                };

                return await sequelize.transaction(async (transaction: any) => {
                    await openRequest(request_methods.post, env.MAKE_WEBHOOK_URL, payload);

                    await Book.create(payload, { transaction });
                    let currentJob = await Job.findOne({ where: { id: job.id }, transaction }) as Job;
                    currentJob.progress = currentJob.progress + percent_per_page;
                    await currentJob.save({ transaction });
                });
            } catch (error: any) {
                log(log_levels.error, error);
                return;
            }
        }


        let percent_per_page = Math.ceil(100 / links.length);
        let promises: Array<Promise<void>> = [];

        // Used concurrency to trade off space for speed(O(1) time O(n) space)
        for (let i = 0; i < links.length; i++) {
            promises.push(analyzeBookPage(links[i]));
        }

        await Promise.all(promises);
        await Job.update({ status: job_statuses.completed }, { where: { id: job.id } });
        await browser.close();
    } catch (error: any) {
        console.log(error);
        log(log_levels.error, error);
        return
    }
}