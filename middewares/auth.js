const prisma = require('../db/prisma')
require('@dotenvx/dotenvx').config();
const jwt = require('jsonwebtoken');
//TODO:some security improvments:
//1.gonna add refresh token and access token later on(after front end done)
//2.token versioning
//3.useing coockie headers instead of just sending with json and then storing in localstorage in frontend
//4.look at this link:
// https://security.stackexchange.com/questions/177162/is-it-safe-to-implement-jwt-auth-with-cookies-token-versioning-and-no-refresh
exports.authenticateToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Just check if user exists
        const userExists = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true }
        });

        if (!userExists) {
            return res.status(401).json({ error: 'User no longer exists' });
        }

        req.user = decoded; // Contains id and role
        // console.log('user:', req.user)
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        console.error(err);
        res.status(500).json({ error: 'Authentication error' });
    }
};
exports.roleRequired = (...allowdRoles) => {
    return (req, res, next) => {
        if (!allowdRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'not accesiable with this role'
            })
        }
        next();
    }
}

