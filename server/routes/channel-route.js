const express = require("express");
const verifyToken = require("../middleware/auth-middleware");
const { createChannel,getUserChannels, getChannelMessages } = require("../controllers/channel-controller");
const Router = express.Router();

Router.post('/create-channel',verifyToken,createChannel)
Router.get('/get-channels',verifyToken,getUserChannels);
Router.get('/get-channel-messages/:channelId',verifyToken,getChannelMessages)
module.exports=Router