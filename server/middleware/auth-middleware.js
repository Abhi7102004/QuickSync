const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.jwtToken;
    if (!token) {
        return res.status(401).send('Authentication is required');
    }
    try {
        const { userId } = jwt.verify(token, process.env.JWT_TOKEN);
        req.userId = userId;
        next();
    } catch (err) {
        return res.status(401).send('Invalid token');
    }
};

module.exports = verifyToken;
