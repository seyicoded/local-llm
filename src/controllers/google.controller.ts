import { Request, Response } from "express";
import { WrapperResponse } from "../helper/wrapResponse";
import google from 'googleapis';
import {GoogleAuth, OAuth2Client} from 'google-auth-library';
import "dotenv/config"
// const {GoogleAuth} = require('google-auth-library');
// const {google} = require('googleapis');

export const getGoogleAuth = async (request: Request|any, response: Response)=>{
    // validate 
    // const {error, value} = Joi.object(createGroupScheme).validate(data)

    // return WrapperResponse("error", {
    //     message: error.message,
    //     status: "failed"
    // }, response)
    
    // 
    // console.log(group)

    const oAuth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_SECRET_KEY,
        "http://localhost:4500/auth/google/callback"
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
    });

    return WrapperResponse("success", {
        message: "Linked Fetched Successfully",
        status: "success",
        payload: {
            data: authorizeUrl
        }
    }, response)
}
