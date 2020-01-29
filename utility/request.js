const request = require("request");

module.exports = (options) => {
    return new Promise((resolve, reject) => {
        request(options, (error, res, body) => {
            if (!error && res.statusCode == 200) resolve(body);
            else reject(!error? body: error);
        });
    });
}