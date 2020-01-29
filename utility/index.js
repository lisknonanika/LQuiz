const BigNum = require("@liskhq/bignum");
const { configDevnet } = require("../config");
const checkUtil = require("./check");
const request = require("./request");

module.exports = {
    checkUtil,
    request
}

module.exports.getTimestamp = (d) => {
    if (typeof d !== "number") d = 0;
    let now = new Date();
    now.setDate(now.getDate() + d);
    const millisSinceEpoc = now.getTime() - Date.parse(configDevnet.app.genesisConfig.EPOCH_TIME);
    const inSeconds = ((millisSinceEpoc) / 1000).toFixed(0);
    return parseInt(inSeconds);
}

module.exports.add = (val1, val2) => {
    if (!checkUtil.checkNumber(val1) || !checkUtil.checkNumber(val2)) return undefined;
    return new BigNum(val1).add(new BigNum(val2)).toString();
}

module.exports.sub = (val1, val2) => {
    if (!checkUtil.checkNumber(val1) || !checkUtil.checkNumber(val2)) return undefined;
    return new BigNum(val1).sub(new BigNum(val2)).toString();
}

module.exports.mul = (val1, val2) => {
    if (!checkUtil.checkNumber(val1) || !checkUtil.checkNumber(val2)) return undefined;
    return new BigNum(val1).mul(new BigNum(val2)).toString();
}

module.exports.div = (val1, val2) => {
    if (!checkUtil.checkNumber(val1) || !checkUtil.checkNumber(val2)) return undefined;
    return new BigNum(val1).div(new BigNum(val2)).toString();
}