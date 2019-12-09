const url = require('url');

module.exports.checkBytesLength = (val, min, max) => {
    if (Array.isArray(val)) {
        for (s of val) {
            if (!this.checkBytesLength(s, min, max)) return false;
        }
        return true;
    }
    if (typeof val !== 'string') return false;

    const l = Buffer.byteLength(val);
    if (typeof min === 'number' && l < min) return false;
    if (typeof max === 'number' && l > max) return false;
    return true;
}

module.exports.checkUrl = (val) => {
    if (Array.isArray(val)) {
        for (s in val) {
            if (!this.checkUrl(s)) return false;
        }
        return true;
    }
    if (typeof val !== 'string') return false;
    const r = url.parse(val);
    return r.protocol && (r.protocol === 'http:' || r.protocol === 'https:');
}

module.exports.checkNumber = (val, min, max) => {
    if (Array.isArray(val)) {
        for (s of val) {
            if (!this.checkNumber(s, min, max)) return false;
        }
        return true;
    }
    if (typeof val !== 'number' && isNaN(+val)) return false;
    if (typeof min === 'number' && +val < min) return false;
    if (typeof max === 'number' && +val > max) return false;
    return true;
}