import express, { Request, Response} from 'express';
import { WrapperResponse } from '../helper/wrapResponse';
import 'dotenv/config'
import { processChatCompletion } from '../services/ai.service';

export const chatCompletion = async (request: Request, response: Response)=>{
    try {
        const res = await processChatCompletion(request?.body);
        return WrapperResponse("success", {
            message: "Processed",
            status: "success",
            payload: {
                res
            }
        }, response);
        
    } catch (error) {
        throw new (error);
    }
}
