const jwt = require('jsonwebtoken');

const jwtToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_TOKEN, { expiresIn: '30d' });
};

module.exports = { jwtToken };