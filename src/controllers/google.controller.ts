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

const getGoogleMailsRaw = async (request: Request|any, response: Response) =>{
    const {userRefreshToken} = request.body;

    const auth = getoAuth2Client();

    auth.setCredentials({ refresh_token: userRefreshToken });

    const gmail = google.gmail({version: 'v1', auth});
    // const mess = await gmail.users.messages.list();
    const mess = await gmail.users.messages.list({
        userId: 'me',
        // q: "in:inbox after:2014/02/26 before:2014/03/04"
        q: "in:INBOX after:2024/02/26 before:2024/03/04"
        // q: "in:INBOX after:2024/02/20 before:2024/03/04"
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

    return mails;
}

export const getGoogleMails = async (request: Request|any, response: Response)=>{
    
    const mails = await getGoogleMailsRaw(request, response);

    return WrapperResponse("success", {
        message: "Linked Fetched Successfully",
        status: "success",
        payload: {
            data: mails
            // data: mess
        }
    }, response)
}

export const getGoogleMailsSummary = async(request: Request|any, response: Response)=>{

    console.log("00")
    const mails: any = await getGoogleMailsRaw(request, response);
    console.log("01")

    // if(mails != "success"){
    //     return response.status(500).json("an error occurred");
    // }

    const myMails = mails || [];
    console.log("11")
    const processedData = await fetchRawSummaryAI(myMails);
    console.log("22")

    return WrapperResponse("success", {
        message: "Linked Fetched Successfully",
        status: "success",
        payload: {
            data: processedData
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

    console.log('before AIData', myTranscriptData.length);
    const r = [];

    const myTranscriptDatas = divideString(myTranscriptData, 16250);
    
    for (let i = 0; i < myTranscriptDatas.length; i++) {
        const myTranscriptData = myTranscriptDatas[i];
        
        try {
            // using ai to analyse
            const AIData  = await axios({
                url: 'https://api.openai.com/v1/chat/completions',
                method: 'post',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                data: {
                    // "model": (myTranscriptData.length < 4097) ? 'gpt-3.5-turbo' : "gpt-3.5-turbo-16k-0613",
                    // "model": "gpt-4-vision-preview",
                    "model": "gpt-3.5-turbo-16k-0613",
                    "messages": [
                        // {
                        //     "role": "user",
                        //     "content": `generate data extremely summarized in this pattern: 
                        //     Here's a breakdown
                            
                        //     Meetings
                        //     You had 8 meetings 
                        //     You accepted 5, declined 1, 2 with no response
                        //     Last week Thursday you had “Meeting title” with Idris & Seyi
                        //     You discussed (summary of meeting)
                        //     On Mon 24th, you went to “Location in meeting” for “Meeting title”
                            
                        //     I can also check your email without invading your privacy
                        //     Privacy & safety is important to us with end-to-end encryption and your summary is only visible to you
                        //     You can set a password for future email summaries
                            
                        //     Gmail
                        //     Here’s a summary of your email broken down into categories
                        //     48 receipts, with a total of $XXX from Careem, Talabat & more
                        //     Food: $XXX, Software: $XX, Insurance $X
                        //     🧾 5 invoices from Github, Figma, Bing & more
                        //     Paid 3, 1 invoice is due next week, 0 overdue
                        //     🤑 12 bank transfers with a total of $XXX
                        //     Outgoing: $XXX
                        //     Incoming: $XXX`
                        // },
                        // {
                        //     "role": "user",
                        //     "content": `here's the data ${((myTranscriptData.length > 16250)) ? myTranscriptData.substring(0, 16250) : myTranscriptData}`
                        // },
                        {
                            "role": "user",
                            "content": `generate data extremely summarized to just one line only with title for each (note: summary must not exceed 1 line, avoid duplication/repetition, make it also extremely short and only return the most important logically): 
                            
                            Here is the data to summarize: ${myTranscriptData}
                            `
    
                        },
                        // Here's the data: ${myTranscriptData}
                        // Here's the data: ${((myTranscriptData.length > 16250)) ? myTranscriptData.substring(0, 16250) : myTranscriptData}
                    ],
                    "temperature": 0.2
                }
            });
        
            // return AIData?.data;
            // console.log(AIData?.data?.choices[0].message?.content, "\n");
            r.push(AIData?.data);
            
        } catch (error) {
            return {
                error
            };
        }

    }

    // further process summary 
    let partSummarySum = "";
    for (let i = 0; i < r.length; i++) {
        const part = r[i]?.choices[0]?.message?.content;
        partSummarySum += `${part} `; 
    }

    let ret = null;
    try {
        // using ai to analyse
        const AIData  = await axios({
            url: 'https://api.openai.com/v1/chat/completions',
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            data: {
                "model": "gpt-3.5-turbo-16k-0613",
                "messages": [
                    {
                        "role": "user",
                        "content": `generate data extremely summarized with title for each (note: avoid duplication/repetition, make the total response also extremely short and only return the most important logically): 
                        
                        Here is the data to summarize: ${partSummarySum}.

                        Please categorized the resulting summarized data into relatable groups.
                        `

                    },
                ],
                "temperature": 0.2
            }
        });
    
        // return AIData?.data;
        console.log(AIData?.data?.choices[0].message?.content, "\n");
        ret = AIData?.data;
        
    } catch (error) {
        return {
            error
        };
    }

    return ret;
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

const divideString = (inputStr, maxLength) => {
    const substrings = [];
    
    for (let i = 0; i < inputStr.length; i += maxLength) {
      substrings.push(inputStr.substring(i, i + maxLength));
    }
  
    return substrings;
}