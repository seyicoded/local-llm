import express, { Request, Response} from 'express';
import Joi from 'joi';
import db from '../../models';
import { WrapperResponse } from '../helper/wrapResponse';
import bcryptjs from 'bcryptjs'
import 'dotenv/config'
import { generateOtp } from '../generic/functions';
import { sendMail } from '../generic/sendMail';
import { generateOtpMailTemplate } from '../templates/mails/otp';
import { generateSmsUseCase, sendSMS } from '../generic/termii';
import {Op} from 'sequelize'
import { USER_ROLE, USER_STATUS } from '../config/constants/enum/auth';
import moment from 'moment'

var jwt = require('jsonwebtoken');

type createUser = {
    email: string;
    username: string;
    phone: string;
    dob: string;
    gender: string;
    password: string;
    refer_by_username?: string;
}

const createUserScheme = {
    email: Joi.string().required().label("Email"),
    password: Joi.string().required().label("Password"),
    username: Joi.string().required().label("username"),
    phone: Joi.string().required().label("phone"),
    dob: Joi.string().required().label("dob"),
    gender: Joi.string().required().label("gender"),
    country: Joi.string().optional().label("country"),
    refer_by_username: Joi.string().optional().label("refer_by_username"),
}

type loginUser = {
    email: string;
    password: string;
}

const loginUserScheme = {
    email: Joi.string().required().label("Email"),
    password: Joi.string().required().label("Password"),
}

type changePassword = {
    email: string;
    password: string;
    resetPasswordToken: string;
}

const changePasswordScheme = {
    email: Joi.string().required().label("Email"),
    password: Joi.string().required().label("Password"),
    resetPasswordToken: Joi.string().required().label("Token"),
}

export const requestEmailOtpController = async (request: Request, response: Response)=>{
    const {error, value} = Joi.object({
        email: Joi.string().email().required().label("Email"),
    }).validate(request.body)

    if(error){
        return WrapperResponse("error", {
            message: error.message,
            status: "failed"
        }, response)
    }

    // if( (await userExist(value.email)).exist ){
    if(false){
        // account already exist
        return WrapperResponse("error", {
            message: "Account already exist",
            status: "failed"
        }, response)
    }

    // generate otp and send
    const otp = await generateOtp(6);
    const mailHTML = generateOtpMailTemplate(otp);

    const resetPasswordToken = jwt.sign({
        time: moment().add(20, 'minutes'),
        email: value.email
    }, process.env.JWT_SECRET);

    await sendMail({
        subject: 'OviJoy Registration OTP',
        to: value.email,
        html: mailHTML,
    });


    return WrapperResponse("success", {
        message: "OTP SENT",
        status: "success",
        payload: {
            otp,
            resetPasswordToken
        }
    }, response)
}
