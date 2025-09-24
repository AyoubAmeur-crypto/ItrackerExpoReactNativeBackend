const mongoose = require("mongoose")

const OtpToken = new mongoose.Schema({


    email:{

        type:String,
        unique:true
    },
    otpHash:{

        type:String,
        unique:true
    },
    createdAt:{

        type:Date,
        default:Date.now,
        expires:300
        

    }
})


module.exports= mongoose.model("OtpCodeVerification",OtpToken)