import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required : true
    },
    email: {
        type: String,
        required : true
    },
    mobileNumber : {
        type: String,
        required : true
    },
    password: {
        type:String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp:{
        type: String,
        required : false
    },
    otpExpires : {
        type: Date,
        required : false
    },
    
});

export default mongoose.model('User', userSchema);