const isValidNum = (val) => {
    const regex = new RegExp(/^([0-9]{1,3})?$/);
    if (!regex.test(val)) return false;
    return (+val < 1 || +val > 100)
}

const isValidBalance = (val) => {
    const regex = new RegExp(/^([1-9][0-9]{0,3}|0)(\.\d{1,8})?$/);
    if (!regex.test(val)) return false;
    return (+val < 0.00000001 || +val > 100)
}

const isValidUrl = (val) => {
    const regex = new RegExp(/^https?:\/\/.+\..+?$/);
    return regex.test(val);
}

const isValidLength = (val, min, max) => {
    if (!val) val = ""; 
    const len = encodeURI(val).replace(/%../g, "0").length;
    return (min <= len && max >= len)
}
