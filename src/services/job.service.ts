import { Job } from "../models/Job";
import { job_statuses, log_levels, messages, request_methods } from "../utils/consts";
import { StatusCodes } from "http-status-codes";
import { log } from "../utils/logger";
import { ScrapeDto } from "../dtos/job";
import { ResponseType } from "../dtos/api";
import { deduplicateArray, pauseExecution, replaceAll } from "../utils/general";
import { openRequest } from "../utils/network";
import { getSummaryAndRelevanceScore } from "./openai.service";
import puppeteer from "puppeteer";
import { Book } from "../models/Book";
import env from "../config/env";
import { sequelize } from "../config/database";

export const scrapeService = async (payload: ScrapeDto): Promise<ResponseType> => {
    const { search_string } = payload;
    const job = await Job.create({ search_string });
    scrapeJob(job);
    return { ok: true, message: messages.OK, status: StatusCodes.OK }
}

export const scrapeJob = async (job: Job): Promise<void> => {
    let url = `https://bookdp.com.au/?s=${replaceAll(job.search_string.toLowerCase(), " ", "+")}&post_type=product`;
    const timeout = 1000 * 60 * 2; // 1 minutes

    let browser = await puppeteer.launch({ headless: false, timeout });
    let page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout });
    await page.evaluate(() => { window.scrollTo(0, document.body.scrollHeight); });
    await pauseExecution(1000);
    await page.waitForNetworkIdle({ idleTime: 5000, timeout });

    let links: Array<string> = await page.$$eval('a', (links: any) => { return links.map((link: any) => { return link.href }) });
    links = deduplicateArray(links.filter((link: string) => link.startsWith("https://bookdp.com.au/products/")));


    const analyzeBookPage = async (link: string): Promise<void> => {
        try {
            return sequelize.transaction(async (transaction: any) => {
                let page = await browser.newPage();
                await page.goto(link, { waitUntil: 'networkidle0', timeout });

                let title = (await page.$eval('title', (title: any) => { return title.innerText })).split("|")[0].trim();
                let desc = await page.$eval('div#tab-description > div.woocommerce-tabs--description-content', (description: any) => { return description.innerText });
                let prices = await page.$$eval('span.woocommerce-Price-amount > bdi', (prices: any) => { return prices.map((price: any) => { return price.innerText }) });
                let discounted_price = Number(prices[0].substring(1));
                let original_price = Number(prices[1].substring(1));
                let discount_amount = original_price - discounted_price;
                let discount_percent = Number(((discount_amount / original_price) * 100).toPrecision(2));
                let { author, summary, relevance_score } = await getSummaryAndRelevanceScore(desc, job.search_string);
                let value_score = Number(((relevance_score * (100 - discount_percent)) / 100).toPrecision(2));

                await page.close();

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

                await openRequest(request_methods.post, env.MAKE_WEBHOOK_URL, payload);

                await Book.create(payload, { transaction });
                let currentJob = await Job.findOne({ where: { id: job.id }, transaction }) as Job;
                currentJob.progress = currentJob.progress + percent_per_page;
                await currentJob.save({ transaction });
            });
        } catch (error: any) {
            log(log_levels.error, {error});
            return;
        }
    }


    let percent_per_page = Math.ceil(100 / links.length);
    let promises : Array<Promise<void>> = [];

    // Use concurrency to trade off space for speed(O(1) time O(n) space)
    for(let i = 0; i < links.length; i++){
        promises.push(analyzeBookPage(links[i]));
    }

    await Promise.all(promises);
    await Job.update({ status : job_statuses.completed }, { where : { id : job.id } });
    await browser.close();
}