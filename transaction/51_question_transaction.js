const { BaseTransaction, TransactionError, utils } = require('@liskhq/lisk-transactions');
const myutils = require('../utility');

class QuestionTransaction extends BaseTransaction {

    static get TYPE () {
        return 51;
    }

    static get FEE () {
        return 0;
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
     *     reward: [String]
     *     exp: Number,
     *     other: {
     *         str: String,
     *         url: String
     *     }
     * }
     */
    validateAsset() {
        const errors = [];
        
        // ----------------------------
        // Quiz Field Check
        // ----------------------------
        if (!this.asset.quiz) {
            errors.push(new TransactionError('Required parameter "asset.quiz" is not found', this.id));
        }

        // ----------------------------
        // Question Field Check
        // ----------------------------
        else if (!myutils.checkUtil.checkBytesLength(this.asset.quiz.question, 1, 256)) {
            errors.push(
                new TransactionError(
                    'Invalid "asset.quiz.question" defined on transaction',
                    this.id,
                    '.asset.quiz.question',
                    this.asset.quiz.question,
                    'Must be in the range 1-256 bytes',
                )
            );
        }

        // ----------------------------
        // Answer Field Check
        // ----------------------------
        else if (!myutils.checkUtil.checkBytesLength(this.asset.quiz.answer, 64, 64)) {
            errors.push(
                new TransactionError(
                    'Invalid "asset.quiz.answer" defined on transaction',
                    this.id,
                    '.asset.quiz.answer',
                    this.asset.quiz.answer,
                    'Must be a SHA-256 hash',
                )
            );
        }

        // ----------------------------
        // EXP Field Check
        // ----------------------------
        else if (!myutils.checkUtil.checkNumber(this.asset.quiz.exp, myutils.getTimestamp())) {
            errors.push(
                new TransactionError(
                    'Invalid "asset.asset.quiz.exp" defined on transaction',
                    this.id,
                    '.asset.asset.quiz.exp',
                    this.asset.quiz.exp,
                    'Must be a future date',
                )
            );
        }

        // ----------------------------
        // Reward Field Check
        // ----------------------------
        else if (!Array.isArray(this.asset.quiz.reward) || this.asset.quiz.reward.length === 0 ||
            !myutils.checkUtil.checkNumber(this.asset.quiz.reward, '1', utils.convertLSKToBeddows('100'))) {
            errors.push(
                new TransactionError(
                    'Invalid "asset.asset.quiz.reward" defined on transaction',
                    this.id,
                    '.asset.asset.quiz.reward',
                    this.asset.quiz.reward,
                    `Must be in the range of ${utils.convertBeddowsToLSK('1')}-100 LSQ (Array)`,
                )
            );
        }

        // ----------------------------
        // Fee Check
        // ----------------------------
        else if (this.fee <= 0 || myutils.getSummary(this.asset.quiz.reward) !== this.fee.toString()) {
            errors.push(
                new TransactionError(
                    'Invalid "fee" defined on transaction',
                    this.id,
                    '.asset.asset.quiz.other.str',
                    this.fee.toString(),
                    'Must be equal to the total reward',
                )
            );
        }

        // ----------------------------
        // Other Field Check
        // ----------------------------
        else if (!this.asset.quiz.other) {
            return errors;
        }

        // ----------------------------
        // String Field Check
        // ----------------------------
        else if (this.asset.quiz.other.str && !myutils.checkUtil.checkBytesLength(this.asset.quiz.other.str, 0, 256)) {
            errors.push(
                new TransactionError(
                    'Invalid "asset.asset.quiz.other.str" defined on transaction',
                    this.id,
                    '.asset.asset.quiz.other.str',
                    this.asset.quiz.other.str,
                    'Must be in the range 0-256 bytes',
                )
            );
        }
        
        // ----------------------------
        // URL Field Check
        // ----------------------------
        else if (this.asset.quiz.other.url && !myutils.checkUtil.checkUrl(this.asset.quiz.other.url)) {
            errors.push(
                new TransactionError(
                    'Invalid "asset.asset.quiz.other.url" defined on transaction',
                    this.id,
                    '.asset.asset.quiz.other.url',
                    this.asset.quiz.other.url,
                    'Must be a valid URL',
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