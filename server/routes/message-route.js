const express = require("express");
const { getMessages,uploadFiles } = require("../controllers/message-controller");
const verifyToken = require("../middleware/auth-middleware");
const Router = express.Router();

Router.post('/get-messages',verifyToken,getMessages);
Router.post('/upload-files',verifyToken,uploadFiles);

module.exports=Router