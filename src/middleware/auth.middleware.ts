import { Request, Response, NextFunction} from 'express'
import { WrapperResponse } from '../helper/wrapResponse';
import "dotenv/config"
import { USER_ROLE } from '../config/constants/enum/auth';
import db from '../../models';

var jwt = require('jsonwebtoken');

export const authMiddleWare = async (req: Request|any, res: Response, next: NextFunction)=>{
    if (!req.headers.authorization) {
        return WrapperResponse("error", {
            message: "Authorization Token is Required",
            status: "failed"
        }, res)
    }

    const token = (req.headers.authorization).split(' ')[1];
    // validate jwt
    try{
        var decoded = jwt.verify(token, process.env.JWT_SECRET);
        // req.user = decoded.data;
        req.user = await getUser(decoded.data.id);
    }catch(e){
        return WrapperResponse("error", {
            message: "Authorization Token is Invalid",
            status: "failed"
        }, res)
    }

    next();
}

export const authAdminMiddleWare = async (req: Request|any, res: Response, next: NextFunction)=>{
    if (!req.headers.authorization) {
        return WrapperResponse("error", {
            message: "Authorization Token is Required",
            status: "failed"
        }, res)
    }

    const token = (req.headers.authorization).split(' ')[1];
    // validate jwt
    try{
        var decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await getUser(decoded.data.id);

        if(decoded.data.role !== USER_ROLE.ADMIN){
            return WrapperResponse("error", {
                message: "Authorization Token is Invalid as Admin",
                status: "failed"
            }, res)
        }
    }catch(e){
        return WrapperResponse("error", {
            message: "Authorization Token is Invalid",
            status: "failed"
        }, res)
    }

    next();
}

const getUser = async (id: string|number)=>{
    return db.users.findOne({
        where: {
            id
        }
    })
}