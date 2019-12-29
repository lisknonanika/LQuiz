const { utils } = require('@liskhq/lisk-transactions');
const cryptography = require('@liskhq/lisk-cryptography');
const crypto = require('crypto');
const myutility = require('../../utility')
const request = require('../../request');
const QuestionTransaction = require('../../transaction/51_question_transaction');

module.exports.validator = async(req) => {
    let errors = [];
    
    // ----------------------------
    // Question Field Check
    // ----------------------------
    if (!myutility.checkUtil.checkBytesLength(req.body.question, 1, 256)) {
        errors.push('A question must be in the range 1-256 bytes');
    }

    // ----------------------------
    // Answer Field Check
    // ----------------------------
    if (!myutility.checkUtil.checkBytesLength(req.body.answer, 1, 256)) {
        errors.push('A answer must be in the range 1-256 bytes');
    }

    // ----------------------------
    // Reward Field Check
    // ----------------------------
    if (!Array.isArray(req.body.reward) || req.body.reward.length === 0) {
        errors.push('A reward must be in the range of 0.1-100 LSQ');
    } else {
        let reward = []
        for (r of req.body.reward) reward.push(utils.convertLSKToBeddows(r));
        if(!myutility.checkUtil.checkNumber(reward, '1', utils.convertLSKToBeddows('100'))) {
            errors.push(`A reward must be in the range of ${utils.convertBeddowsToLSK('1')}-100 LSQ`);
        }
    }

    // ----------------------------
    // Other Str Field Check
    // ----------------------------
    if (req.body.other && req.body.other.str && !myutility.checkUtil.checkBytesLength(req.body.other.str, 0, 256)) {
        errors.push('A other str must be in the range 0-256 bytes');
    }

    // ----------------------------
    // Other URL Field Check
    // ----------------------------
    if (req.body.other && req.body.other.url && !myutility.checkUtil.checkUrl(req.body.other.url)) {
        errors.push('A URL must be a valid URL');
    }

    // ----------------------------
    // Passphrase Field Check
    // ----------------------------
    if (!req.body.passphrase) {
        errors.push('Passphrase is required');
        return errors;
    }

    // ----------------------------
    // Passphrase Check
    // ----------------------------
    let address = "";
    try {
        address = cryptography.getAddressFromPassphrase(req.body.passphrase);
        if (address !== req.decoded.address) {
            errors.push('Incorrect passphrase');
            return errors;
        }
    } catch (err) {
        errors.push('Incorrect passphrase');
        return errors;
    }

    // ----------------------------
    // Address Check
    // ----------------------------
    const acounts = await request({
        method: 'GET',
        url: `http://127.0.0.1:4000/api/accounts?address=${address}`,
        json: true
    });
    if (!acounts.data || acounts.data.length === 0) {
        errors.push('Not initialized address');
        return errors;
    }
    
    // ----------------------------
    // Second Passphrase Field Check
    // ----------------------------
    if (acounts.data[0].secondPublicKey) {
        if (!req.body.secondPassphrase) {
            errors.push('Second Passphrase is required');
            return errors;
        }
        try {
            const keys = cryptography.getPrivateAndPublicKeyFromPassphrase(req.body.secondPassphrase);
            if (acounts.data[0].secondPublicKey !== keys.publicKey) {
                errors.push('Incorrect second passphrase');
                return errors;
            }
        } catch (err) {
            errors.push('Incorrect second passphrase');
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
 *         reward: [String],
 *         exp: Number,
 *         other: {
 *             str: String,
 *             url: String
 *         }
 *     }
 * },
 * fee: String,
 * recipientId: String,
 * timestamp: Number
 */
module.exports.createTransaction = (req) => {
    let param = {
        asset: {
            quiz: {
                question: "",
                answer: "",
                reward: [],
                exp: 0,
                other: {
                    str: "",
                    url: ""
                }
            }
        },
        fee: "0",
        recipientId: "0L",
        timestamp: 0
    }

    // Set question
    param.asset.quiz.question = req.body.question;
    
    // Set answer
    param.asset.quiz.answer = crypto.createHash('sha256').update(req.body.answer, 'utf8').digest('hex');

    // Set reward
    param.asset.quiz.reward = [];
    for (r of req.body.reward) param.asset.quiz.reward.push(utils.convertLSKToBeddows(r));
    
    // Set exp
    if (!req.body.exp) param.asset.quiz.exp = myutility.getTimestamp(14);
    else param.asset.quiz.exp = myutility.getTimestamp(req.body.exp);

    // Set other
    if (req.body.other && req.body.other.str) param.asset.quiz.other.str = req.body.other.str;
    if (req.body.other && req.body.other.url) param.asset.quiz.other.url = req.body.other.url;

    // Set fee
    param.fee = myutility.getSummary(param.asset.quiz.reward);

    // Set timestamp
    param.timestamp = myutility.getTimestamp();

    let tx = new QuestionTransaction(param);
    if (req.body.secondPassphrase) {
        tx.sign(req.body.passphrase, req.body.secondPassphrase);
    } else {
        tx.sign(req.body.passphrase);
    }
    return tx;
}
