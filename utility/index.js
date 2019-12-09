const BigNum = require('@liskhq/bignum');
const { configDevnet } = require('../config');
const checkUtil = require('./check');

module.exports = {
    checkUtil,
}

module.exports.getTimestamp = (d) => {
    if (typeof d !== 'number') d = 0;
    let now = new Date();
    now.setDate(now.getDate() + d);
    const millisSinceEpoc = now.getTime() - Date.parse(configDevnet.app.genesisConfig.EPOCH_TIME);
    const inSeconds = ((millisSinceEpoc) / 1000).toFixed(0);
    return parseInt(inSeconds);
}

module.exports.getSummary = (val) => {
    let n = 0;
    if (Array.isArray(val)) {
        for (s of val) {
            n = new BigNum(n).add(new BigNum(s));
        }
    }
    return n.toString();
}