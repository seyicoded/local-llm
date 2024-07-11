// @ts-nocheck
import { Request, Response } from "express";
import { WrapperResponse } from "../helper/wrapResponse";
import { google } from 'googleapis';
import {GoogleAuth, OAuth2Client} from 'google-auth-library';
import "dotenv/config";
import axios from "axios";
import { transactionFilter, transactionFilterSecond } from "../helper/mail.filter";
import {SpacesServiceClient, ConferenceRecordsServiceClient} from '@google-apps/meet'
import { toBeSummarized } from "../constant/summary-raw";
import moment from "moment";

const chalk = require('chalk');

var striptags = require('striptags');
const { convert } = require('html-to-text');
var base64 = require('base-64');
// const {GoogleAuth} = require('google-auth-library');
// const {google} = require('googleapis');

console.log = (...r)=>{
    process.stdout.write(chalk.keyword('orange').blue(r.toString() + '\n'));
};

console.log("reach")

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const getGoogleAuth = async (request: Request|any, response: Response)=>{
    
    const oAuth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_SECRET_KEY,
        "http://localhost:4500/auth/google/callback"
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/meetings.space.created', 'https://www.googleapis.com/auth/drive.readonly'],
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

export const getGoogleCalendar = async (request: Request|any, response: Response) =>{
    const {userRefreshToken} = request.body;

    const auth = getoAuth2Client();

    auth.setCredentials({ refresh_token: userRefreshToken });

    const calendar = google.calendar({version: 'v3', auth});
    // const mess = await gmail.users.messages.list();
    const mess = await calendar.events.list({
        calendarId: "primary",
        timeMin: moment().isoWeekday(-7).toDate().toISOString(),
        maxResults: 180,
        singleEvents: true,
        orderBy: 'startTime',
    });


    // return mess;
    return WrapperResponse("success", {
        message: "Data Fetched Successfully",
        status: "success",
        payload: {
            data: mess
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
        // q: "in:INBOX after:2024/02/26 before:2024/03/04"
        // q: "in:INBOX after:2024/02/20 before:2024/03/04"
        q: "in:INBOX after:2024/03/01 before:2024/03/02"
        // q: "in:INBOX after:2024/03/04 before:2024/03/05"
        // fields: "snippet"
    });

    const mails = [];
    const options = {
        wordwrap: 130,
    };

    // console.log(mess.data.messages.length);
    // process.exit(0);

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

    const mails: any = await getGoogleMailsRaw(request, response);

    console.log(mails.length, "for all")

    const filteredFinance = await filterForFinance(mails);

    console.log(filteredFinance.length, "for filteredFinance")
    // process.exit(0);
    // remove later
    // return WrapperResponse("success", {
    //     message: "Linked Fetched Successfully",
    //     status: "success",
    //     payload: {
    //         data: filteredFinance
    //         // data: mess
    //     }
    // }, response);

    const myMails = filteredFinance || [];
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
                        //     "content": `generate data extremely summarized to just one line only with title for each (note: summary must not exceed 1 line, avoid duplication/repetition, make it also extremely short and only return the most important logically): 
                            
                        //     Here is the data to summarize: ${myTranscriptData}
                        //     `
    
                        // },
                        {
                            "role": "user",
                            "content": `generate data extremely summarized to just one line only with title for each (note: summary must not exceed 1 line, avoid duplication/repetition, make it also extremely short and only return the most important logically, also only billing amount from actual transaction shouldn't be ignored while a cumulative costing sum of related items should be provided, make every category shorten please): 
                            
                            Here is the data to summarize: ${filterString(myTranscriptData)}.

                            after logical summary has been done, please format the response into this format below only:

                            x total bank transfers with a total of $XXX credit and debit
                            x recharge transactions from xxx, xxx
                            Outcoming/Debit Alert: $XXX, from xxx, xxx
                            Incoming/Credit Alert: $XXX, from xxx, xxx
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
            console.log(error?.response?.data);
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
                        "content": `generate data extremely summarized with title for each (note: avoid duplication/repetition, make the total response also extremely short and only return the most important logically, also only billing amount from actual transaction shouldn't be ignored while a cumulative costing sum of related items should be provided, make every category shorten please): 
                        
                        Here is the data to summarize: ${filterString(partSummarySum)}.

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
        console.log(error?.response?.data);
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

const filterString = (inputString) => {
    const allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()-=_+[]{}\\|\"':;,./<>?`~ ";
    return inputString
      .split('')
      .filter(char => allowedChars.includes(char))
      .join('');
}

const filterForFinance = async (mails: any[])=>{
    // first filter
    let arr = mails.filter(mail => {
        // transactionFilter.split()
        let transactionFilterArr = transactionFilter.split(",").map(item => item.trim()).find(item =>{
            return mail.title.includes(item)
        });

        let __r = (transactionFilterArr != undefined);
        // if(__r){
        //     if(transactionFilterArr == 'account'){
        //         console.log(mail.title)
        //     }
        // }
        return __r;
    });

    // second filter
    arr = arr.filter(mail => {
        // transactionFilter.split()
        let transactionFilterArr = transactionFilterSecond.split(",").map(item => item.trim()).find(item =>{
            return mail.title.includes(item)
        });

        let __r = (transactionFilterArr != undefined);
        if(__r){
            // console.log(transactionFilterArr)
            if(transactionFilterArr == 'account'){
                // console.log(mail.title)
            }
        }
        return __r;
    });

    // third, filter otp
    arr = arr.filter(mail => {
        // transactionFilter.split()
        let transactionFilterArr = "otp".split(",").map(item => item.trim()).find(item =>{
            return (!mail.title.toLowerCase().includes(item))
        });
        let __r = (transactionFilterArr != undefined);
        return __r;
    });


    return arr;
}


export const createMeetingSpace = async (request: Request|any, response: Response) =>{
    const {userRefreshToken, space} = request.body;

    const auth = getoAuth2Client();

    auth.setCredentials({ refresh_token: userRefreshToken });

    // Instantiates a client
    const meetClient = new SpacesServiceClient({authClient: auth});

    const mySpace = await meetClient.createSpace({});

    console.log("....", mySpace)

    return response.send(mySpace);
}

export const getMeetingSpace = async (request: Request|any, response: Response) =>{
    const {userRefreshToken, space} = request.body;

    const auth = getoAuth2Client();

    auth.setCredentials({ refresh_token: userRefreshToken });

    // Instantiates a client
    const meetClient = new SpacesServiceClient({authClient: auth});

    const mySpace = await meetClient.getSpace({
        // name: "spaces/9GUGBewaRdQB"
        name: space
    });

    console.log("....", mySpace)

    return response.send(mySpace);
}

export const getMeetingConference = async (request: Request|any, response: Response) =>{
    const {userRefreshToken} = request.body;

    const auth = getoAuth2Client();

    auth.setCredentials({ refresh_token: userRefreshToken });

    // Instantiates a client
    const meetClient = new ConferenceRecordsServiceClient({authClient: auth});

    const myConference = await meetClient.listConferenceRecords();

    console.log("....", myConference)

    return response.send(myConference);
}

export const getMeetingConferenceParticipant = async (request: Request|any, response: Response) =>{
    const {userRefreshToken, conference_record} = request.body;

    const auth = getoAuth2Client();

    auth.setCredentials({ refresh_token: userRefreshToken });

    // Instantiates a client
    const meetClient = new ConferenceRecordsServiceClient({authClient: auth});

    const myConference = await meetClient.listParticipants({
        parent: `${conference_record}`
    });

    console.log("....", myConference)

    return response.send(myConference);
}

export const getMeetingConferenceTranscript = async (request: Request|any, response: Response) =>{
    const {userRefreshToken, conference_record} = request.body;

    const auth = getoAuth2Client();

    auth.setCredentials({ refresh_token: userRefreshToken });

    // Instantiates a client
    const meetClient = new ConferenceRecordsServiceClient({authClient: auth});

    const myConference = await meetClient.listTranscripts({
        parent: `${conference_record}`
    });

    console.log("....", myConference)

    return response.send(myConference);
}

export const getSummarydata = async (request: Request|any, response: Response) =>{
    try {
        // const {data} = request.body;
    
        const myTranscriptData = ((toBeSummarized?.data || []).map(item => {
            return `${item?.speaker}: ${(item?.words || [])?.map(__i => __i?.text)}.`
        })).join(' ');
    
        console.log('before AIData', myTranscriptData.length);
        // using ai to analyse
        const AIData  = await axios({
            url: 'https://api.openai.com/v1/chat/completions',
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            data: {
                // "model": (myTranscriptData.length < 4097) ? 'gpt-3.5-turbo' : "gpt-4-turbo",
                "model": (myTranscriptData.length < 4097) ? 'gpt-3.5-turbo' : "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "user",
                        // "content": `generate detailed participant summary content and detailed action items from the following data context, note that summary content and action items should both start with {started} and both end with {ended} independently. data is: ${((myTranscriptData.length > 16250)) ? myTranscriptData.substring(0, 16250) : myTranscriptData}`
                        "content": `using the template below, all results must be in bullet points except TL;DR.
                        MEETING INFO
                        TL;DR:
                        [Provide a brief summary or key takeaway of the meeting, highlighting the most significant discussions and outcomes.]
                        SUMMARY:
                        Bullet points descriptive meeting summaries, capturing discussions, decisions, and significant comments in a narrative style.
                        KEY TOPICS:
                        [Percentage] - [Topic]
                        Add more as necessary...
                        KEY DECISIONS:
                        [Decision]: [Concise description]
                        Add more as necessary...
                        BLOCKERS:
                        [Topic]: [Description]
                        - @Name(s)
                        Add more as necessary…
                        ACTION ITEMS:
                        [Action items]: [Concise description] - @ Name(s)
                        Add more as necessary…
                        
                        Summarise the data provided below: ${myTranscriptData}`
                    }
                ],
                "temperature": 0.2
            }
        });
    
        return response.send(AIData?.data?.choices[0]?.message.content);
        
    } catch (error) {
        console.log(error)
        console.log(JSON.stringify(error?.response?.data))
        return response.send({error});
    }
}