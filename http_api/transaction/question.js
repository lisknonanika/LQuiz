const { utils } = require("@liskhq/lisk-transactions");
const cryptography = require("@liskhq/lisk-cryptography");
const crypto = require("crypto");
const config = require("../../config");
const myUtils = require("../../utility");
const { checkUtil, request } = require("../../utility");
const QuestionTransaction = require("../../transaction/51_question_transaction");

module.exports.validator = async(req) => {
    let errors = [];

    if (req.body.question) req.body.question = req.body.question.trim();
    if (req.body.answer) req.body.answer = req.body.answer.trim().toUpperCase();
    if (req.body.reward) req.body.reward = req.body.reward.trim();
    if (req.body.num) req.body.num = req.body.num.trim();
    if (req.body.url) req.body.url = req.body.url.trim();
    if (req.body.address) req.body.address = req.body.address.trim();
    if (req.body.passphrase) req.body.passphrase = req.body.passphrase.trim();
    if (req.body.secondPassphrase) req.body.secondPassphrase = req.body.secondPassphrase.trim();
    
    // ----------------------------
    // Question Field Check
    // ----------------------------
    if (!checkUtil.checkBytesLength(req.body.question, 1, 256)) {
        errors.push("A question must be in the range 1-256 bytes");
    }

    // ----------------------------
    // Answer Field Check
    // ----------------------------
    if (!checkUtil.checkBytesLength(req.body.answer, 1, 256)) {
        errors.push("A answer must be in the range 1-256 bytes");
    }

    // ----------------------------
    // Reward Field Check
    // ----------------------------
    if(!checkUtil.checkNumber(req.body.reward, utils.convertBeddowsToLSK("1"), "100")) {
        errors.push(`A reward must be in the range of ${utils.convertBeddowsToLSK("1")} to 100 LSK`);
    }

    // ----------------------------
    // Number of people Field Check
    // ----------------------------
    if(req.body.num && !checkUtil.checkNumber(req.body.num, "1", "100")) {
        errors.push(`A num must be in the range of 1 to 100`);
    }

    // ----------------------------
    // URL Field Check
    // ----------------------------
    if (req.body.url && !checkUtil.checkUrl(req.body.url)) {
        errors.push("A URL must be a valid URL");
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
    // Address Check
    // ----------------------------
    const acounts = await request({
        method: "GET",
        url: `${config.liskapiurl}/api/accounts?address=${address}`,
        json: true
    });
    if (!acounts.data || acounts.data.length === 0) {
        errors.push("Not initialized address");
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
 * asset: {
 *     quiz: {
 *         question: String,
 *         answer: String,
 *         reward: String,
 *         num: Number,
 *         url: String,
 *         valid: Boolean
 *     }
 * },
 * fee: String,
 * recipientId: String,
 * timestamp: Number
 */
module.exports.createTransaction = (req) => {
    const param = {
        asset: {
            quiz: {
                question: req.body.question,
                answer: crypto.createHash("sha256").update(req.body.answer, "utf8").digest("hex"),
                reward: utils.convertLSKToBeddows(req.body.reward),
                num: req.body.num? req.body.num: 1,
                url: req.body.url? req.body.url: "",
                valid: true
            }
        },
        amount: "0",
        fee: QuestionTransaction.FEE,
        recipientId: "0L",
        timestamp: myUtils.getTimestamp()
    }
    param.amount = myUtils.mul(param.asset.quiz.reward, param.asset.quiz.num);
    
    const tx = new QuestionTransaction(param);
    if (req.body.secondPassphrase) {
        tx.sign(req.body.passphrase, req.body.secondPassphrase);
    } else {
        tx.sign(req.body.passphrase);
    }
    return tx;
}
