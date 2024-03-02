import { Request, Response } from "express";
import Joi from "joi";
import db from "../../models";
import { WrapperResponse } from "../helper/wrapResponse";
import { USER_ROLE } from "../config/constants/enum/auth";
import { upgradeUserToAccessGiveaway } from "../generic/functions";
// import formidable from 'formidable'
const formidable = require('formidable');


export const updateProfileImageController = async (request: Request|any, response: Response)=>{
    try{

        const data = request.body;

        const _path = __dirname + '/../../uploads/profiles';
        const form = formidable({ 
            multiples: true,
            uploadDir: _path,
         });
        
        form.parse(request, async (err, fields, files) => {
            if (err) {
                return WrapperResponse("error", {
                    message: "Error",
                    status: "failed"
                }, response)
              return;
            }

            const {newFilename, mimetype: fileType} = files.image;

            // create file
            const __user = (request.user);
            const _user = await db.users.update({
                picture: `uploads/profiles/${newFilename}`,
            }, 
            {
                where: {
                    id: __user.id
                }
            })

            return WrapperResponse("success", {
                message: "Updated Successfully",
                status: "success",
            }, response)
            
        });
        
    }catch(e){
        return WrapperResponse("error", {
            message: "Error",
            status: "failed"
        }, response)
    }
}

export const getProfileController = async (request: Request|any, response: Response)=>{
    try{
        let _user = await db.users.findOne(
        {
            where: {
                id: request.user.id
            }
        })

        if(_user.role == USER_ROLE.USER){
            await upgradeUserToAccessGiveaway(_user)

            _user = await db.users.findOne(
            {
                where: {
                    id: request.user.id
                }
            })
        }

        return WrapperResponse("success", {
            message: "Fetched Successfully",
            status: "success",
            payload: _user
        }, response)
        
    }catch(e){
        return WrapperResponse("error", {
            message: "Error",
            status: "failed"
        }, response)
    }
}

export const updateProfileController = async (request: Request|any, response: Response)=>{
    try{
        const user = request.user;

        const {error, value} = Joi.object({
            first_name: Joi.any().required().label("first name"),
            last_name: Joi.any().required().label("last name"),
            username: Joi.any().required().label("user name"),
        }).validate(request.body)

        if(error){
            return WrapperResponse("error", {
                message: error.message,
                status: "failed"
            }, response)
        }

        // update information
        await db.users.update({
            ...value
        }, 
        {
            where: {
                id: user.id
            }
        })

        return WrapperResponse("success", {
            message: "Updated Successfully",
            status: "success"
        }, response)
        
    }catch(e){
        return WrapperResponse("error", {
            message: "Error",
            status: "failed"
        }, response)
    }
}