const { utils } = require("@liskhq/lisk-transactions");
const cryptography = require("@liskhq/lisk-cryptography");
const crypto = require("crypto");
const myUtils = require("../../utility");
const { checkUtil, request } = require("../../utility");
const QuestionTransaction = require("../../transaction/51_question_transaction");

module.exports.validator = async(req) => {
    let errors = [];
    
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
        url: `http://127.0.0.1:4000/api/accounts?address=${address}`,
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
    let param = {
        asset: {
            quiz: {
                question: "",
                answer: "",
                reward: "0",
                num: 1,
                url: "",
                valid: true
            }
        },
        fee: "0",
        recipientId: "",
        timestamp: 0
    }

    // Set question
    param.asset.quiz.question = req.body.question;
    
    // Set answer
    param.asset.quiz.answer = crypto.createHash("sha256").update(req.body.answer, "utf8").digest("hex");

    // Set reward
    param.asset.quiz.reward = utils.convertLSKToBeddows(req.body.reward);
    
    // Set num of people
    if(req.body.num) param.asset.quiz.num = req.body.num;

    // Set url
    if (req.body.url) param.asset.quiz.url = req.body.url;

    // Set fee
    param.fee = myUtils.add(myUtils.mul(param.asset.quiz.reward, param.asset.quiz.num), QuestionTransaction.FEE);

    // Set recipientId
    param.recipientId = req.body.address;

    // Set timestamp
    param.timestamp = myUtils.getTimestamp();

    let tx = new QuestionTransaction(param);
    if (req.body.secondPassphrase) {
        tx.sign(req.body.passphrase, req.body.secondPassphrase);
    } else {
        tx.sign(req.body.passphrase);
    }
    return tx;
}
