const express = require("express");
const { SearchContacts, getContacts } = require("../controllers/contact-controller");
const verifyToken = require("../middleware/auth-middleware");
const Router = express.Router();

Router.post("/search",verifyToken, SearchContacts);
Router.get("/get-ALL-ContactDMList",verifyToken,getContacts);
module.exports = Router;
