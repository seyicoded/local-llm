import { Request, Response } from "express";
import Joi from "joi";
import db from "../../models";
import { WrapperResponse } from "../helper/wrapResponse";

const STATUS = {
    PENDING: 0,
    ACTIVE: 1
}

type createGroup = {
    title: string;
    num_user: string;
    target: string;
    frequency: string;
    start: string;
    amount: string;
}

const createGroupScheme = {
    title: Joi.string().required().label("Title"),
    num_user: Joi.string().optional().default(5).label("Number of Users"),
    target: Joi.string().required().label("Target"),
    frequency: Joi.string().required().label("Frequency"),
    amount: Joi.string().required().label("Amount"),
    start: Joi.string().required().label("Start"),
}

type inviteGroup = {
    email: string;
    id: string|number;
}

const inviteGroupScheme = {
    email: Joi.string().required().label("Email"),
    id: Joi.any().required().label("Id"),
}

type alterInvitation = {
    action: "join"|"decline";
    id: string|number;
}

const alterInvitationScheme = {
    action: Joi.string().required().label("Action"),
    id: Joi.any().required().label("Id"),
}

export const createGroup = async (request: Request|any, response: Response)=>{
    const data: createGroup = request.body;
    
    // validate 
    const {error, value} = Joi.object(createGroupScheme).validate(data)

    if(error){
        return WrapperResponse("error", {
            message: error.message,
            status: "failed"
        }, response)
    }

    // confirm number of user
    if(parseInt(value.num_user) > 5){
        value.num_user = 5
    }

    // create group
    const group = await db.groups.create({
        ...value,
        userId: request?.user?.id
    })

    if(!group){
        return WrapperResponse("error", {
            message: "Error creating group",
            status: "failed"
        }, response)
    }

    // 
    // console.log(group)

    return WrapperResponse("success", {
        message: "Group Created Successfully",
        status: "success",
        payload: group
    }, response)
}

export const inviteGroup = async (request: Request|any, response: Response)=>{
    const data: inviteGroup = request.body;
    
    // validate 
    const {error, value} = Joi.object(inviteGroupScheme).validate(data)

    if(error){
        return WrapperResponse("error", {
            message: error.message,
            status: "failed"
        }, response)
    }

    // check if email exist
    const user = await db.users.findOne({
        where: {
            email: value.email
        }
    });

    if(!user){
        return WrapperResponse("error", {
            message: "User doesn't exist",
            status: "failed"
        }, response)
    }

    // check if user is already invited
    const _user = await db.usergroup.findOne({
        where: {
            groupId: value.id,
            userId: user.id,
        }
    });

    if(_user){
        return WrapperResponse("error", {
            message: "User already invited",
            status: "failed"
        }, response)
    }

    // invite user
    const usergroup = await db.usergroup.create({
        groupId: value.id,
        userId: user.id,
        status: STATUS.PENDING
    })

    return WrapperResponse("success", {
        message: "User invited Successfully",
        status: "success"
    }, response)
}

export const myCreatedGroup = async (request: Request|any, response: Response)=>{

    const groups = await db.groups.findAll({
        where: {
            userId: request.user.id
        }
    });

    return WrapperResponse("success", {
        message: "User invited Successfully",
        status: "success",
        payload: groups
    }, response)
}

export const viewInvitation = async (request: Request|any, response: Response)=>{
    const usergroups = await db.usergroup.findAll({
        where: {
            userId: request.user.id,
            status: STATUS.PENDING
        },
        include: [db.groups]
    });

    return WrapperResponse("success", {
        message: "Invitation List Gotten Successfully",
        status: "success",
        payload: usergroups
    }, response)
}

export const alterInvitation = async (request: Request|any, response: Response)=>{
    const data: alterInvitation = request.body;
    
    // validate 
    const {error, value} = Joi.object(alterInvitationScheme).validate(data)

    if(error){
        return WrapperResponse("error", {
            message: error.message,
            status: "failed"
        }, response)
    }

    if(value.action == "join"){
        const usergroup = await (db.usergroup).update({
            status: STATUS.ACTIVE
        },{
            where: {
                id: value.id
            }
        })

        return WrapperResponse("success", {
            message: "Invitation Accepted Successfully",
            status: "success"
        }, response)
    }else{
        // run delete function on id
        await (db.usergroup).destory({
            where: {
                id: value.id
            }
        })

        return WrapperResponse("success", {
            message: "Invitation Declined Successfully",
            status: "success",
        }, response)
    }
}