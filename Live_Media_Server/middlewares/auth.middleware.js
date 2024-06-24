const jwt = require('jsonwebtoken');
const dbHandler = require('../db/dbHandler.js'); 
const config = require('../configFile.js');
const queries = require('../utils/queries.js');

//this middleware called before logout to check is user is there or not

const verifyCookieAndJWT = async (req, res , next) => {
    try {
        const cookieHeader = req.headers.cookie;
        if (!cookieHeader) {
            return res.status(403).json({ code: 403, message: 'Unauthorized User' });
        }
        const token = cookieHeader.split('; ').find(cookie => cookie.startsWith('accessToken')).split('=')[1];
        if (!token) {
            return res.status(403).json({ code: 403, message: 'Unauthorized User' });
        }

        const decodedToken = jwt.verify(token, config.ACCESS_TOKEN_SECRET);

        const username = decodedToken?.username;


        const result = await dbHandler.fetchDataParameterized(queries.getUsersData, [username]);

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid Access Token' });
        }

        req.user = user; //as verified that user is verified so  add it in body
        next();
    } catch (error) {
        return res.status(401).json({ message: error?.message || 'Invalid access token' });
    }
};

module.exports = verifyCookieAndJWT

