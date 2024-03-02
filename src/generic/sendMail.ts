import nodemailer from 'nodemailer'
import "dotenv/config"

export const sendMail = async (props: {
    to: string;
    subject: string;
    html: string;
}) => {
    let transporter = nodemailer.createTransport({
    host: process.env.SMTP_CONFIG_HOST,
    port: process.env.SMTP_CONFIG_PORT,
    secure: (process.env.SMTP_CONFIG_SECURE == 'yes') ? true : false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_CONFIG_USERNAME, // generated ethereal user
        pass: process.env.SMTP_CONFIG_PASSWORD, // generated ethereal password
    },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
    from: `"${process.env.SMTP_EMAIL_FROM_NAME}" <${process.env.SMTP_EMAIL_FROM}>`, // sender address
    to: props.to, // list of receivers
    subject: props.subject, // Subject line
    text: props.html, // plain text body
    html: props.html, // html body
    });

    console.log("Message sent: %s", info.messageId);
}