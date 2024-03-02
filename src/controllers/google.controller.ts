import { Request, Response } from "express";
import { WrapperResponse } from "../helper/wrapResponse";
import { google } from 'googleapis';
import {GoogleAuth, OAuth2Client} from 'google-auth-library';
import "dotenv/config"
// const {GoogleAuth} = require('google-auth-library');
// const {google} = require('googleapis');

export const getGoogleAuth = async (request: Request|any, response: Response)=>{
    
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

const getoAuth2Client = ()=>{
    const r = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_SECRET_KEY,
        "http://localhost:4500/auth/google/callback"
    );
    return r;
}

export const getGoogleToken = async (request: Request|any, response: Response)=>{
    
    const {code} = request.body;
    
    const oAuth2Client = getoAuth2Client();

    const __token = await oAuth2Client.getToken(code);

    return WrapperResponse("success", {
        message: "Linked Fetched Successfully",
        status: "success",
        payload: {
            data: __token
        }
    }, response)
}

export const getGoogleMails = async (request: Request|any, response: Response)=>{
    
    const {userRefreshToken} = request.body;
    
    const auth = getoAuth2Client();

    auth.setCredentials({ refresh_token: userRefreshToken });

    const gmail = google.gmail({version: 'v1', auth});
    // const mess = await gmail.users.messages.list();
    const mess = await gmail.users.messages.list({
        userId: 'me'
    });

    return WrapperResponse("success", {
        message: "Linked Fetched Successfully",
        status: "success",
        payload: {
            data: mess
        }
    }, response)
}
