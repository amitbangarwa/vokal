/**
 * Created by amit on 03/06/17.
 */
const jwt = require('jsonwebtoken');

const APP_SECRET = 'dd8as7d7a8d7as8d78as';

module.exports = {
    signToken: (user, callback) => {
        callback(jwt.sign({id: user.id, role: 'user'}, APP_SECRET));
    },
    verifyToken: (token, callback) => {
        jwt.verify(token, APP_SECRET, (err, decoded) => {
            callback(err, decoded)
        });
    }
};