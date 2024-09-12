const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const socketSetup = require('./socket');
const cors = require('cors');
require('dotenv').config();
const mongooseConnection = require('./config/mongoose-connection');
const port = process.env.PORT || 3000;
const authRoute = require('./routes/auth-route');
const contactRoute = require('./routes/contact-route');
const messageRoute=require('./routes/message-route')

// CORS configuration
app.use(cors({
    origin: process.env.ORIGIN, // Set this to http://localhost:5173
    credentials: true, // Allow credentials (cookies) to be sent
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Allowed HTTP methods
}));

// Middleware setup
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoute);
app.use('/api/contacts', contactRoute);
app.use('/api/messages',messageRoute)
// Start server
const server = app.listen(port, () => {
    console.log(`Server is running on Port ${port}`);
});

// Socket setup
socketSetup(server);
