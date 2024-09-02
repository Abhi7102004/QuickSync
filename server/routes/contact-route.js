const express = require("express");
const { SearchContacts } = require("../controllers/contact-controller");
const verifyToken = require("../middleware/auth-middleware");
const Router = express.Router();

Router.post("/search",verifyToken, SearchContacts);
module.exports = Router;
