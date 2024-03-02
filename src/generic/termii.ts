import axios from 'axios'
import "dotenv/config"

export const generateSmsUseCase = (otp: string | number) =>{
    return `Your one-time password (OTP) is: ${otp}. Please enter this code to continue action on the app, Thank!`;
}

export const sendSMS = async (prop: {
    to: string;
    sms: string;
}) =>{
    try{
        const payload = {
            api_key: process.env.TERMII_API_KEY,
            from: process.env.TERMII_SENDER,
            channel: process.env.TERMII_CHANNEL,
            to: prop.to,
            sms: prop.sms,
            type: 'plain',
        }
    
        await axios.post(`${process.env.TERMII_BASE_URL}/api/sms/send`, payload);
        return true;
    }catch(e){
        console.log(e)
        return false
    }
    
}