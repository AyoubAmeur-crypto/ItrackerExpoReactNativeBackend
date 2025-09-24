const mongoose = require("mongoose")

const User = new mongoose.Schema({

    firstName:{
        type:String,
        required:true,

    },
    lastName:{

        type:String,
        required:true
    },
    email:{

        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        select:false
        
    },
   
    isVerified:{

        type:Boolean,
        default:false

    },

    plan:{

        type:String,
        enum:['free','pro'],
        default:'free'

    },




    expenses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Expense'
        }
    ],
    
    loginHistory:[{

          date:{
            type:Date,
            default:Date.now

        },
        ip:{

            type:String
        }

        
    }],
   
},{timestamps:true})


module.exports = mongoose.model('User',User)