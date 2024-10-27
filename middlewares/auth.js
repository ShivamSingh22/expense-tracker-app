const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, 'eferfefRandomTokenSecretKey');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
};

module.exports = { authenticate };
