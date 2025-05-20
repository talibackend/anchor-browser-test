import { log_levels, messages, request_methods } from "./consts";
import { log } from '../utils/logger';
import { StatusCodes } from "http-status-codes";
import fetch from "node-fetch";


export const openRequest = async (method : request_methods, url : string, body : any, additionalHeaders={}, isContentJson = true) => {
    const controller = new AbortController();
    const { signal } = controller;
    const options : any = {
        method,
        signal
    };
    if(body){
        options.body = JSON.stringify(body);
    }
    options.headers = {
        ...additionalHeaders
    };

    if(isContentJson){
        options.headers['Content-Type'] = 'application/json';
    }

    let timeout = setTimeout(()=>{ controller.abort(); return messages.NETWORK_ERROR }, 60000);
    try{
        log(log_levels.info, { message : { url, options } });
        const request = await fetch(url, options);
        // Changed to text only for the sake of make.com
        const response = await request.text();
        log(log_levels.info, { message : { response } });
        clearTimeout(timeout);
        return response;
    }catch(error){
        clearTimeout(timeout);
        log(log_levels.error, { message : { error } });
        throw { ok : false, message : messages.NETWORK_ERROR, status : StatusCodes.INTERNAL_SERVER_ERROR };
    }
}
