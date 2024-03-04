import { Request, Response } from "express";
import { WrapperResponse } from "../helper/wrapResponse";
import { google } from 'googleapis';
import {GoogleAuth, OAuth2Client} from 'google-auth-library';
import "dotenv/config";
import axios from "axios";

var striptags = require('striptags');
const { convert } = require('html-to-text');
var base64 = require('base-64');
// const {GoogleAuth} = require('google-auth-library');
// const {google} = require('googleapis');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

type myMailsProps = {
    title: string,
    date: string,
    threadId: string,
    bodyMain: string,
    bodyPart: string[],
}
const fetchRawSummaryAI = async (myMails: myMailsProps[])=>{
    let myTranscriptData = "";
    
    myMails.map(({bodyMain, title, bodyPart})=>{
        myTranscriptData += title;
        if(bodyMain.length != 0){
            myTranscriptData += bodyMain;
            myTranscriptData += "\n";
        }

        bodyPart.map((partText)=>{
            myTranscriptData += partText;
            myTranscriptData += "\n";
        })

    });

    console.log('before AIData');
    // using ai to analyse
    const AIData  = await axios({
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        data: {
            "model": (myTranscriptData.length < 4097) ? 'gpt-3.5-turbo' : "gpt-3.5-turbo-16k-0613",
            "messages": [
                {
                    "role": "user",
                    "content": `generate data extrememly summarized in this pattern: “Give me a summary of last week” 
                    I will give you a breakdown of your calendar
                    
                    Meetings
                    You had 8 meetings 
                    You accepted 5, declined 1, 2 with no response
                    Last week Thursday you had “Meeting title” with Idris & Seyi
                    You discussed (summary of meeting)
                    On Mon 24th, you went to “Location in meeting” for “Meeting title”
                    
                    I can also check your email without invading your privacy
                    Privacy & safety is important to us with end-to-end encryption and your summary is only visible to you
                    You can set a password for future email summaries
                    
                    Gmail
                    Here’s a summary of your email broken down into categories
                    48 receipts, with a total of $XXX from Careem, Talabat & more
                    Food: $XXX, Software: $XX, Insurance $X
                    🧾 5 invoices from Github, Figma, Bing & more
                    Paid 3, 1 invoice is due next week, 0 overdue
                    🤑 12 bank transfers with a total of $XXX
                    Outgoing: $XXX
                    Incoming: $XXX
                    ✈️ 2 travel itinerary
                    Upcoming flight to Amsterdam next week Monday
                    💼 5 new jobs listing from Linkedin, Indeed and +3 more
                    ✉️ 2 emails sent are still unread
                    29 documents were shared with you via G Drive, Notion +27
                    Firstname Lastname shared “File title”
                    🎨 117 Comments on files from Figma, G Doc / Slides & more
                    Figma comments on “Project title” from “Firstname  Lastname” and 10 others
                    Firstname Lastname: Change design title 
                    359 Direct messages on Slack, Linkedin, Teams & more
                    Linkedin: 120 direct messages 
                    Slack: 56 messages on 35 channels
                    Teams: 9 files were shared with you
                    1,985 notifications from Facebook, Instagram, twitter & more
                    217 vouchers worth $XXX from Asos, Gucci, Zara & more`
                },
                {
                    "role": "user",
                    "content": `here's the data ${((myTranscriptData.length > 16250)) ? myTranscriptData.substring(0, 16250) : myTranscriptData}`
                },
            ],
            "temperature": 0.2
        }
    });

    return AIData?.data;
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