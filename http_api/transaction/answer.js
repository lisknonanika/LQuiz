const cryptography = require("@liskhq/lisk-cryptography");
const crypto = require("crypto");
const myUtils = require("../../utility");
const { checkUtil, request } = require("../../utility");
const db = require("../db")
const AnswerTransaction = require("../../transaction/52_answer_transaction");

module.exports.validator = async(req) => {
    let errors = [];

    if (req.body.id) req.body.id = req.body.id.trim();
    if (req.body.answer) req.body.answer = req.body.answer.trim().toUpperCase();
    if (req.body.address) req.body.address = req.body.address.trim();
    if (req.body.passphrase) req.body.passphrase = req.body.passphrase.trim();
    if (req.body.secondPassphrase) req.body.secondPassphrase = req.body.secondPassphrase.trim();

    // ----------------------------
    // Id Field Check
    // ----------------------------
    if (!req.body.id) {
        errors.push("ID is required");
    }

    // ----------------------------
    // Answer Field Check
    // ----------------------------
    if (!checkUtil.checkBytesLength(req.body.answer, 1, 256)) {
        errors.push("A answer must be in the range 1-256 bytes");
    }

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
    let address = "";
    try {
        address = cryptography.getAddressFromPassphrase(req.body.passphrase);
        if (address !== req.body.address) {
            errors.push("Incorrect passphrase");
            return errors;
        }
    } catch (err) {
        errors.push("Incorrect passphrase");
        return errors;
    }

    // ----------------------------
    // Question Transaction Check
    // ----------------------------
    let questionTransactions = {};
    try {
        questionTransactions = await request({
            method: "GET",
            url: `http://127.0.0.1:4000/api/transactions?id=${req.body.id}&type=51`,
            json: true
        });
        if (!questionTransactions.data || questionTransactions.data.length === 0) {
            errors.push("Target Question Not Found.");
            return errors;
        }
        if (questionTransactions.data[0].senderId === address) {
            errors.push("Can not answer own question.");
            return errors;
        }
        if (questionTransactions.data[0].asset.quiz.answer !== crypto.createHash("sha256").update(req.body.answer, "utf8").digest("hex")) {
            errors.push("Answer missmatch.");
            return errors;
        }
    } catch (err) {
        errors.push("Target Question Not Found.");
        return errors;
    }
    req.body.reward = questionTransactions.data[0].asset.quiz.reward;

    // ----------------------------
    // Answer Transaction Check
    // ----------------------------
    let answerTransactions = {};
    try {
        answerTransactions = await db.findAnswer({questionId: req.body.id}, 0)
        if (!answerTransactions.success) {
            errors.push("Failed to get answer data");
            return errors;
        }

        if (!answerTransactions.data || answerTransactions.data.length > 0) {
            if (answerTransactions.data.filter(tx => tx.senderId === address).length > 0) {
                errors.push("This question has already been answered.");
                return errors;
            }
            if (answerTransactions.data.length >= questionTransactions.data[0].asset.quiz.num) {
                errors.push("This question has reached the maximum number of answers.");
                return errors;
            }
        }
    } catch (err) {
        // nothing
    }

    // ----------------------------
    // Address Check
    // ----------------------------
    const acounts = await request({
        method: "GET",
        url: `http://127.0.0.1:4000/api/accounts?address=${address}`,
        json: true
    });
    if (!acounts.data || acounts.data.length === 0) {
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
    return errors;
}

/**
 * data: String,
 * asset: {
 *     quiz: {
 *         answer: String,
 *         reward: String
 *     }
 * },
 * fee: String,
 * recipientId: String,
 * timestamp: Number
 */
module.exports.createTransaction = (req) => {
    const param = {
        asset: {
            data: req.body.id,
            quiz: {
                answer: crypto.createHash("sha256").update(req.body.answer, "utf8").digest("hex"),
                reward: req.body.reward
            }
        },
        fee: "0",
        recipientId: req.body.address,
        timestamp: myUtils.getTimestamp()
    }

    const tx = new AnswerTransaction(param);
    if (req.body.secondPassphrase) {
        tx.sign(req.body.passphrase, req.body.secondPassphrase);
    } else {
        tx.sign(req.body.passphrase);
    }
    return tx;
}
