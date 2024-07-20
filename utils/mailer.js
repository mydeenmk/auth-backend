import nodemailer from 'nodemailer'
import dotenv from 'dotenv';

dotenv.config();

let transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user : process.env.MAIL_ID,
        pass : process.env.MAIL_PASS
    }
});
console.log("transport" ,  process.env.MAIL_ID ,process.env.MAIL_PASS )
const sendEmail = async  (to,subject,text) => {
    debugger
    const mailOption = {
        from : process.env.MAIL_ID,
        to  ,
        subject  ,
        text 
    };
     transport.sendMail(mailOption, (error,info) => {
            if(error){
                console.log(error);
            }else {
                console.log('Email sent to' + info.response);
            }
    });
};

export default sendEmail;