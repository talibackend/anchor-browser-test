import OpenAI from "openai";
import env from "../config/env";
import { OpenAIEnrichmentDto } from "../dtos/job";
import { imageUrlToBase64 } from "../utils/general";

const openai = new OpenAI({
  apiKey: env.OPEN_AI_API_KEY,
});

export const getAuthorFromCover = async (url : string) : Promise<string> =>{
    let base64Image = await imageUrlToBase64(url);
    const prompt = "You are a author(s) name extractor that analyses book covers and extracts the author(s) name only, the image is sent in base64 format.";

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages : [
            {
                role: 'system',
                content: prompt
            },
            {
                role : 'system',
                content : 'In a case where you are not sure who the author(s) is, return N/A'
            },
            {
                role : 'user',
                content : [
                    {
                        type : "image_url",
                        image_url : { url : `${base64Image}`}  
                    }
                ]
            }
        ]
    });

    return response.choices[0].message.content?.trim() as string
}

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
                role : 'system',
                content : 'When you are not able to return auto, return N/A'
            },
            {
                role: 'user',
                content: `Summarize this \n\n${desc}\n\nand return the relevance score of the description to the keyword "${keyword}" on a scale of 0-100.`
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