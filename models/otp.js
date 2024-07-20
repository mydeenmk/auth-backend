import mongoose from "mongoose";

const otpSchema = new mongoose.Schema ( {
    email:{
        type: String,
        required: true
    },
    otp:{
        type: String,
        required: true
    },
    otpExpires : {
        type: Date
    }

});

export default mongoose.model('OTP', otpSchema);