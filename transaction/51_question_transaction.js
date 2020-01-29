const { BaseTransaction, TransactionError, utils } = require("@liskhq/lisk-transactions");
const myUtils = require("../utility");

class QuestionTransaction extends BaseTransaction {

    static get TYPE () {
        return 51;
    }

    static get FEE () {
        return `${10 ** 7}`;
    };

    async prepare(store) {
        await store.account.cache([
            {
                address: this.senderId,
            },
        ]);
    }

    validateFee() {
        return undefined;
    }

    /**
     * quiz: {
     *     question: String,
     *     answer: String,
     *     reward: String
     *     num: Number,
     *     url: String
     * }
     */
    validateAsset() {
        const errors = [];
        
        // ----------------------------
        // Quiz Field Check
        // ----------------------------
        if (!this.asset.quiz) {
            errors.push(new TransactionError("Required parameter 'asset.quiz' is not found", this.id));
        }

        // ----------------------------
        // Question Field Check
        // ----------------------------
        else if (!myUtils.checkUtil.checkBytesLength(this.asset.quiz.question, 1, 256)) {
            errors.push(
                new TransactionError(
                    "Invalid 'asset.quiz.question' defined on transaction",
                    this.id,
                    ".asset.quiz.question",
                    this.asset.quiz.question,
                    "Must be in the range 1-256 bytes",
                )
            );
        }

        // ----------------------------
        // Answer Field Check
        // ----------------------------
        else if (!myUtils.checkUtil.checkBytesLength(this.asset.quiz.answer, 64, 64)) {
            errors.push(
                new TransactionError(
                    "Invalid 'asset.quiz.answer' defined on transaction",
                    this.id,
                    ".asset.quiz.answer",
                    this.asset.quiz.answer,
                    "Must be a SHA-256 hash",
                )
            );
        }

        // ----------------------------
        // Reward Field Check
        // ----------------------------
        else if (!myUtils.checkUtil.checkNumber(this.asset.quiz.reward, "1", utils.convertLSKToBeddows("100"))) {
            errors.push(
                new TransactionError(
                    "Invalid 'asset.asset.quiz.reward' defined on transaction",
                    this.id,
                    ".asset.asset.quiz.reward",
                    this.asset.quiz.reward,
                    `Must be in the range of ${utils.convertBeddowsToLSK("1")} to 100 LSK`,
                )
            );
        }

        // ----------------------------
        // Number of people Field Check
        // ----------------------------
        else if (!myUtils.checkUtil.checkNumber(this.asset.quiz.num, "1", "100")) {
            errors.push(
                new TransactionError(
                    "Invalid 'asset.asset.quiz.num' defined on transaction",
                    this.id,
                    ".asset.asset.quiz.num",
                    this.asset.quiz.num,
                    "Must be in the range of 1 to 100 LSQ (Array)",
                )
            );
        }
        
        // ----------------------------
        // URL Field Check
        // ----------------------------
        else if (this.asset.quiz.url && !myUtils.checkUtil.checkUrl(this.asset.quiz.url)) {
            errors.push(
                new TransactionError(
                    "Invalid 'asset.asset.quiz.url' defined on transaction",
                    this.id,
                    ".asset.asset.quiz.url",
                    this.asset.quiz.url,
                    "Must be a valid URL",
                )
            );
        }

        // ----------------------------
        // Fee Check
        // ----------------------------
        else if (this.fee <= 0 ||
            myUtils.add(myUtils.mul(this.asset.quiz.reward, this.asset.quiz.num), QuestionTransaction.FEE) !== this.fee.toString()) {
            errors.push(
                new TransactionError(
                    "Invalid 'fee' defined on transaction",
                    this.id,
                    ".fee",
                    this.fee.toString(),
                    "Must be equal to the reward * num",
                )
            );
        }
        return errors;
    }

    applyAsset(store) {
        const sender = store.account.get(this.senderId);
        const newObj = { ...sender, asset: { quiz: this.asset.quiz } };
        store.account.set(sender.address, newObj);
        return [];
    }

    undoAsset(store) {
        const sender = store.account.get(this.senderId);
        const oldObj = { ...sender, asset: null };
        store.account.set(sender.address, oldObj);
        return [];
    }
}

module.exports = QuestionTransaction;