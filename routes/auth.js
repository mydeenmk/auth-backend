import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import sendEmail from '../utils/mailer.js';
import mongoose from 'mongoose';
import otpSchema from '../models/otp.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import  userSchema  from "../models/user.js";

// import bcrypt from 'bcrypt';
const router = express.Router();
const generateotp = () => Math.floor(1000 + Math.random() * 9000).toString();


router.post('/register', async ( req,res) =>
{
    try{
        const { userName, email, mobileNumber, password } = req.body;
        //console.log(`${email} and ${password}`);
    if(!userName || !email || !password) {
        return res.status(400).json({error:'Please enter all the fields'});
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!regex.test(email)){
        return res.status(400).json({error:'invalid email address'});
    }
    const existEmail = await userSchema.findOne({email});
    if(existEmail){
        return res.status(400).json({error:'Email already exist'});
    }
    if(password.length < 8) {
        return res.status(400).json({error:'Password must be atleast 8 charcters'});
    }
    const otp = generateotp();
    const otpExpires = Date.now() + 3000000;
    const isVerified = false;
debugger

const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync(password, salt);
    const user = new userSchema({
        userName,
        email,
        mobileNumber,
        password :hashedPassword,
        isVerified,
        otp,
        otpExpires
    });
   console.log(user);
    user.save();
    debugger
    if(!user.isVerified){
        debugger
        await sendEmail(user.email,'Your OTP',`Your OTP is ${otp}`);
    //res.status(200).json({message:'otp has send to your mail id'});
    res.send({ userId: user._id , user: user,message:'otp has sent to your mail'});
    
    }

  }catch (error) {
    console.log(error);
    res.status(500).json({error:'internel server error'});
  }
    
}
);

// router.get('/' , async(req,res) => {
//     res.send('Hi this is Test');
// });

router.post('/verify-otp/:userId' , async(req,res) => {
    try{
            const {userId} = req.params;
            const {otp} = req.body;
            console.log('Received userId:', userId);
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid user ID' });
              }
            const user = await userSchema.findById(userId);
            if(!user) {
                return res.status(400).json({error:'user not found'});
            }
            if(user.otp !== otp || user.otpExpires < Date.now() ){
                return res.status(400).json({error:'Invalid otp or otp is expired'});
            }
        //     console.log(`${otp}`);
        //    debugger
                user.isVerified = true;
                user.otp = undefined;
                user.otpExpires = undefined;
                await user.save();
                const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET);
                //res.status(200).json({ token });
            return res.status(200).json({message : token});
            
            
    }catch(error){
        res.status(500).json({message:error.message});
    }
});


router.post('/login', async(req,res) =>
    {
        try{

            const {email,password} = req.body;
            //console.log(`${email} and ${password}`);
            const user = await userSchema.findOne({email});
            console.log(user);
            if(!user){
               return res.status(401).json({error:'user not found'});
            }
            const passwordsMatch = bcrypt.compareSync(password, user.password);

         
            if(!passwordsMatch) {
                return res.status(401).json({error:'Invalid password'});
            }
            if(!user.isVerified){
                return res.status(400).json({error:'Email is not verified'});
            }
            // const valid = await bcrypt.compare(password, user.password);
            // console.log(valid);
            // if(!valid){
            //     return res.status(401).json({error:'invalid email or password'});
            // }
            const body = {
                _id: user._id,
                email: user.email,
            }
            const token = jwt.sign({user:body} , process.env.JWT_SECRET);
            res.status(200).json({token, user: body, message : 'successfully loggedin'} );

        }catch(error){
            res.status(500).json({message:'Internel Server Error'});
        }
        
    }
);

router.post('/forgotPassword', async(req,res) => {
    try {
       const { email } = req.body;
       console.log('Request body:', req.body);
       if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
       const user = await userSchema.findOne({email});
       if(!user){
        return res.status(400).json({error:'user not found'});
       }
       const otp = generateotp();
       user.otp = otp;
       user.otpExpires = Date.now() + 300000;
       user.save();
       await sendEmail(email,'Your OTP for password reset',`Your otp is ${otp}`);
       res.send({userId:user._id});
    }catch (error) {
        console.log(error);
        //res.status(500).json({error:'internel server error'});
      }
} );

router.post('/fPassword-otp/:userId' , async(req,res) => {
    try{
            const {userId} = req.params;
            const {otp} = req.body;
            //console.log('Received userId:', userId);
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid user ID' });
              }
            const user = await userSchema.findById(userId);
            // if(!user) {
            //     return res.status(400).json({error:'user not found'});
            // }
            if(user.otp !== otp || user.otpExpires < Date.now() ){
                return res.status(400).json({error:'Invalid otp or otp is expired'});
            }
        //     console.log(`${otp}`);
        //    debugger
                user.isVerified = true;
                user.otp = undefined;
                user.otpExpires = undefined;
                await user.save();
                const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET);
                //res.status(200).json({ token });
             res.send({message : 'OTP is verified create new password' ,token, userId:user._id});
            
            
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

router.post('/resetPassword/:userId', async(req,res) => {
    try{
        const {userId} = req.params;
        const {password, confirmPassword} = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({error:'your password should be match'});
        }
        const user = await userSchema.findById(userId);
        if(!user){
            return res.status(400).json({error: 'please attempt to reset your password'});
        }
        const hashPassword = await bcrypt.hash(password, 10);
        user.password = hashPassword;
        // user.otp = undefined;
        // user.otpExpires = undefined;
        user.save();
        res.status(200).json({message:'new password is created'})
    }catch (error) {
        console.log(error);
        //res.status(500).json({error:'internel server error'});
      }
});


export default router;