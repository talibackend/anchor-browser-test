import { AnalyzePagePayloadDto } from "../dtos/worker";
import browserPool from "../config/browser-pool";
import { Book } from "../models/Book";
import { Job } from "../models/Job";
import { sequelize } from "../config/database";
import { openRequest } from "../utils/network";
import { getAuthorFromCover, getSummaryAndRelevanceScore } from "./openai.service";
import env from "../config/env";
import { job_statuses, kafka_topics, log_levels, messages, request_methods } from "../utils/consts";
import { log } from "../utils/logger";
import { publishMessageToTopic } from "../utils/kafka";

export const analyzeBookPageService = async (payload: AnalyzePagePayloadDto): Promise<void> => {
    let { main_job_id, link, number_of_attempts, progress_weight } = payload;
    const timeout = 1000 * 60 * 2;

    let job = await Job.findOne({ where: { id: main_job_id } });

    if (!job) {
        throw messages.JOB_NOT_FOUND;
    }

    if (number_of_attempts >= env.MAX_JOB_RETRIES) {
        // Failure of at least one job means the entire job was partially completed.
        await Job.update({ status : job_statuses.partially_completed }, { where : { id : job.id } });
        return;
    }

    try {
        let page = await browserPool.newPage();
        await page.goto(link, { waitUntil: 'networkidle0', timeout });

        let title = (await page.$eval('title', (title: any) => { return title.innerText })).split("|")[0].trim();
        let desc = await page.$eval('div#tab-description > div.woocommerce-tabs--description-content', (description: any) => { return description.innerText });
        let prices = await page.$$eval('span.woocommerce-Price-amount > bdi', (prices: any) => { return prices.map((price: any) => { return price.innerText }) });
        let cover = await page.$eval('img.wp-post-image', (img: any) => { return img.src });
        let discounted_price = Number(prices[0].substring(1));
        let original_price = Number(prices[1].substring(1));
        let discount_amount = original_price - discounted_price;
        let discount_percent = Number(((discount_amount / original_price) * 100).toPrecision(2));
        let { author, summary, relevance_score } = await getSummaryAndRelevanceScore(desc, job.theme);
        let value_score = Number((relevance_score / original_price).toPrecision(2));

        await page.close();

        if (author == "N/A") {
            author = await getAuthorFromCover(cover)
        }

        let bookPayload = {
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
            await openRequest(request_methods.post, env.MAKE_WEBHOOK_URL, bookPayload);

            await Book.create(bookPayload, { transaction });

            // Need to most updated version of the job
            let currentJob = await Job.findOne({ where: { id: job.id }, transaction }) as Job;
            let newPercent = currentJob.percent_done + progress_weight;
            if(newPercent >= 100){
                currentJob.status = job_statuses.completed;
            }
            currentJob.percent_done = newPercent;
            await currentJob.save({ transaction });
        });
    } catch (error: any) {
        log(log_levels.error, `Error analyzing book page for job ${main_job_id} link ${link}: ${error.message}`);
    }

    number_of_attempts += 1;
    await publishMessageToTopic(kafka_topics.scrape_book_jobs, { main_job_id, link, number_of_attempts, progress_weight });
}