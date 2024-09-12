const mongoose = require('mongoose');

const User = require('./user-model'); 

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    messageType: {
        type: String,
        required: true,
        enum:["text","file"]
    },
    content: {
        type: String,
        required: ()=>{
            return this.messageType==="text"
        },
    },
    file: {
        type: String,
        required: ()=>{
            return this.messageType==="file"
        },
    },
    deliveredAt: {
        type: Date,
        default: null,
    },
    readAt: {
        type: Date,
        default: null,
    },
    timeStamp:{
        type:Date,
        default:Date.now
    }
});

const MessageModel = mongoose.model('Message', messageSchema);
module.exports = MessageModel;
