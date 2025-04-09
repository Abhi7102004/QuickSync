const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const socketSetup = require("./socket");
const cors = require("cors");
require("dotenv").config();
const mongooseConnection = require("./config/mongoose-connection");
const port = process.env.PORT;
const authRoute = require("./routes/auth-route");
const contactRoute = require("./routes/contact-route");
const messageRoute = require("./routes/message-route");
const channelRoute = require("./routes/channel-route");

app.use(
  cors({
    origin: [process.env.ORIGIN, "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoute);
app.use("/api/contacts", contactRoute);
app.use("/api/messages", messageRoute);
app.use("/api/channels", channelRoute);

const server = app.listen(port, () => {
  console.log(`Server is running on Port ${port}`);
});

socketSetup(server);
