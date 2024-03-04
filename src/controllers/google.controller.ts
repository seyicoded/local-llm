import { Request, Response } from "express";
import { WrapperResponse } from "../helper/wrapResponse";
import { google } from 'googleapis';
import {GoogleAuth, OAuth2Client} from 'google-auth-library';
import "dotenv/config";

var striptags = require('striptags');
const { convert } = require('html-to-text');
var base64 = require('base-64');
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
        userId: 'me',
        // q: "in:inbox after:2014/02/26 before:2014/03/04"
        q: "in:INBOX after:2024/02/26 before:2024/03/04"
        // fields: "snippet"
    });

    const mails = [];
    const options = {
        wordwrap: 130,
    };

    for (let i = 0; i < mess.data.messages.length; i++) {
        const element = mess.data.messages[i];
        
        const message = await gmail.users.messages.get({
            id: element.id,
            userId: 'me',
        });

        // mails.push(message.data)
        mails.push({
            title: message.data.snippet,
            date: message.data.internalDate,
            threadId: message.data.threadId,
            // bodyMain: message.data.payload.body.data,
            // bodyMain: convert(striptags(base64.decode((message?.data?.payload?.body?.data || "").replace(/-/g, '+').replace(/_/g, '/'))), options),
            // bodyPart: (message?.data?.payload?.parts || []).map((item) => convert(striptags(base64.decode((item?.body.data || "").replace(/-/g, '+').replace(/_/g, '/'))), options))
            bodyMain: processString(convert((base64.decode((message?.data?.payload?.body?.data || "").replace(/-/g, '+').replace(/_/g, '/'))), options)),
            bodyPart: (message?.data?.payload?.parts || []).map((item) => processString(convert((base64.decode((item?.body.data || "").replace(/-/g, '+').replace(/_/g, '/'))), options)))
        })

    }

    console.log("....")

    return WrapperResponse("success", {
        message: "Linked Fetched Successfully",
        status: "success",
        payload: {
            data: mails
            // data: mess
        }
    }, response)
}

const getGoogleMailsSummary = async(request: Request|any, response: Response)=>{
    const mails: any = await getGoogleMails(request, response);

    if(mails.status != "success"){

    }

    const myMails = mails.payload.data;

    return WrapperResponse("success", {
        message: "Linked Fetched Successfully",
        status: "success",
        payload: {
            data: myMails
            // data: mess
        }
    }, response);
}

const processString = (message: string)=>{
    // Regular expression to match URLs starting with http:// or https://
    var urlRegex = /(https?:\/\/[^\s]+)/g;

    // Replace the matched URLs with an empty string
    var cleanedMessage = message.replace(urlRegex, '');
    cleanedMessage = replaceAll(cleanedMessage, " ÍÂ", "");
    cleanedMessage = replaceAll(cleanedMessage, "  ÍÂ", "");
    cleanedMessage = replaceAll(cleanedMessage, "Í", "");
    cleanedMessage = replaceAll(cleanedMessage, "-", "");
    cleanedMessage = replaceAll(cleanedMessage, "\n\n", "");
    cleanedMessage = replaceAll(cleanedMessage, "\\n\\n", "");
    cleanedMessage = replaceAll(cleanedMessage, "\n", "");
    cleanedMessage = replaceAll(cleanedMessage, "\\n", "");
    cleanedMessage = replaceAll(cleanedMessage, "\'", "");
    cleanedMessage = replaceAll(cleanedMessage, "\\'", "");
    cleanedMessage = replaceAll(cleanedMessage, "Â", "");
    cleanedMessage = replaceAll(cleanedMessage, "â", "");

    return cleanedMessage;
}

const replaceAll = (inputStr: string, oldSubstring: string, newSubstring: string) => {
    // Use regular expression with global flag to replace all occurrences
    const regex = new RegExp(oldSubstring, 'g');
    return inputStr.replace(regex, newSubstring);
  }