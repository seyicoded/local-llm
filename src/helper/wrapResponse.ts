import { Response } from 'express'
export const WrapperResponse = (
    type: "success"|"error",
    data: {
        status: "failed"|"success",
        message: string,
        payload?: object
    },
    res: Response)=>{
    res.status( (type == "success") ? 200 : 500 ).json(data)
}