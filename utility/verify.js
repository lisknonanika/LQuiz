var jwt = require('jsonwebtoken');
var { api_config } = require('../config');

module.exports = (req, res, next) => {
    const token = (req.session && req.session.token) || req.headers['x-access-token'];
    if (!token) return res.status(403).send({success: false, messages: ['Invalid Token']});

    jwt.verify(token, api_config.secret, (error, decoded) => {
        if (error) return res.status(403).send({success: false, messages: ['Invalid Token']});
        req.decoded = decoded;
        next();
    });
}