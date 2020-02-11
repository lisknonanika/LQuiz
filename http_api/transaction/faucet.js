const cryptography = require("@liskhq/lisk-cryptography");
const config = require("../../config");
const myUtils = require("../../utility");
const request = require("../../utility/request");
const FaucetTransaction = require("../../transaction/99_faucet_transaction");

module.exports.validator = async(req) => {
    let errors = [];

    // ----------------------------
    // Passphrase Field Check
    // ----------------------------
    if (!req.body.passphrase) {
        errors.push("Passphrase is required");
        return errors;
    }

    // ----------------------------
    // Passphrase Check
    // ----------------------------
    try {
        req.body.address = cryptography.getAddressFromPassphrase(req.body.passphrase);
    } catch (err) {
        errors.push("Incorrect passphrase");
        return errors;
    }

    // ----------------------------
    // Get Address Info
    // ----------------------------
    const acounts = await request({
        method: "GET",
        url: `${config.liskapiurl}/api/accounts?address=${req.body.address}`,
        json: true
    });

    if (acounts.data && acounts.data.length > 0) {
        // ----------------------------
        // Balance Check
        // ----------------------------
        if (+myUtils.div(acounts.data[0].balance, 10 ** 7) >= 10) {
            errors.push("Must be less than 10LSK");
            return errors;
        }

        // ----------------------------
        // Second Passphrase Field Check
        // ----------------------------
        if (acounts.data[0].secondPublicKey) {
            if (!req.body.secondPassphrase) {
                errors.push("Second Passphrase is required");
                return errors;
            }
            try {
                const keys = cryptography.getPrivateAndPublicKeyFromPassphrase(req.body.secondPassphrase);
                if (acounts.data[0].secondPublicKey !== keys.publicKey) {
                    errors.push("Incorrect second passphrase");
                    return errors;
                }
            } catch (err) {
                errors.push("Incorrect second passphrase");
                return errors;
            }
        }
    }

    return errors;
}

module.exports.createTransaction = (req) => {
    const param = {
        fee: "0",
        recipientId: req.body.address,
        timestamp: myUtils.getTimestamp()
    }

    const tx = new FaucetTransaction(param);
    if (req.body.secondPassphrase) {
        tx.sign(req.body.passphrase, req.body.secondPassphrase);
    } else {
        tx.sign(req.body.passphrase);
    }
    return tx;
}
