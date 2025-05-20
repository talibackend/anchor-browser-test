import OpenAI from "openai";
import env from "../config/env";
import { OpenAIEnrichmentDto } from "../dtos/job";

const openai = new OpenAI({
  apiKey: env.OPEN_AI_API_KEY,
});

export const getSummaryAndRelevanceScore = async (desc : string, keyword : string) : Promise<OpenAIEnrichmentDto> =>{
    const prompt = `You are a text analyzer that analyzes a book's description, provide a 1-2 sentence summary about it, extract the author, and rate the relevance of the description to the given keyword.`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            {
                role: 'system',
                content: prompt
            },
            {
                role: 'system',
                content: `Your response has to be a valid JSON parsable string containing summary, author, and relevance_score.`
            },
            {
                role: 'user',
                content: `Summarize this message\n\n${desc}\n\nand return the relevance score of the description to the keyword "${keyword}" on a scale of 0-100.`
            }
        ],
        temperature: 0.7,
        max_tokens: 200,
    });

    const { summary, relevance_score, author } = JSON.parse(response.choices[0].message.content?.trim() as string);

    return {
        summary,
        relevance_score,
        author
    };
}