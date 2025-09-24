const mongoose = require('mongoose')

const Expense = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
   
    amount: {
        type: Number,
        required: true
    },
    
    positive:{

        type:Boolean,
        required:true

    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})


module.exports = mongoose.model('Expense', Expense)