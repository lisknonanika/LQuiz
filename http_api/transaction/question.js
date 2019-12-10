const { utils } = require('@liskhq/lisk-transactions');
const BigNum = require('@liskhq/bignum');
const crypto = require('crypto');
const myutility = require('../../utility')
const QuestionTransaction = require('../../transaction/51_question_transaction');

module.exports.validator = (req) => {
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
    // EXP Field Check
    // ----------------------------
    if (!myutility.checkUtil.checkNumber(req.body.exp, 14)) {
        errors.push('A exp must be a number greater than or equal to 14');
    }

    // ----------------------------
    // Reward Field Check
    // ----------------------------
    if (!Array.isArray(req.body.reward) || req.body.reward.length === 0) {
        errors.push('A reward must be in the range of 0.1-100 LSQ');
    } else {
        let reward = []
        for (r of req.body.reward) reward.push(utils.convertLSKToBeddows(r));
        if(!myutility.checkUtil.checkNumber(reward, QuestionTransaction.FEE, utils.convertLSKToBeddows('100'))) {
            errors.push('A reward must be in the range of 0.1-100 LSQ');
        }
    }

    // ----------------------------
    // Other Field Check
    // ----------------------------
    if (!req.body.other) return errors;

    // ----------------------------
    // String Field Check
    // ----------------------------
    if (req.body.other.str && !myutility.checkUtil.checkBytesLength(req.body.other.str, 0, 256)) {
        errors.push('A other str must be in the range 0-256 bytes');
    }
    
    // ----------------------------
    // URL Field Check
    // ----------------------------
    else if (req.body.other.url && !myutility.checkUtil.checkUrl(req.body.other.url)) {
        errors.push('A URL must be a valid URL');
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
        recipientId: "",
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
    param.asset.quiz.exp = myutility.getTimestamp(req.body.exp);

    // Set other
    if (req.body.other && req.body.other.str) param.asset.quiz.other.str = req.body.other.str;
    if (req.body.other && req.body.other.url) param.asset.quiz.other.url = req.body.other.url;

    // Set fee
    param.fee = new BigNum(myutility.getSummary(param.asset.quiz.reward)).add(new BigNum(QuestionTransaction.FEE)).toString();

    // Set recipientId
    param.recipientId = '8273455169423958419L';

    // Set timestamp
    param.timestamp = myutility.getTimestamp();

    let tx = new QuestionTransaction(param);
    tx.sign('robust swift grocery peasant forget share enable convince deputy road keep cheap');

    return tx;
}
