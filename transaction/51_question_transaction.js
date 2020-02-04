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
            {
                address: this.recipientId,
            },
        ]);
    }

    /**
     * quiz: {
     *     question: String,
     *     answer: String,
     *     reward: String
     *     num: Number,
     *     url: String,
     *     valid: Boolean
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
                    "Invalid 'asset.quiz.reward' defined on transaction",
                    this.id,
                    ".asset.quiz.reward",
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
                    "Invalid 'asset.quiz.num' defined on transaction",
                    this.id,
                    ".asset.quiz.num",
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
                    "Invalid 'asset.quiz.url' defined on transaction",
                    this.id,
                    ".asset.quiz.url",
                    this.asset.quiz.url,
                    "Must be a valid URL",
                )
            );
        }

        // ----------------------------
        // Amount Check
        // ----------------------------
        else if (this.amount <= 0 || myUtils.mul(this.asset.quiz.reward, this.asset.quiz.num) !== this.amount.toString()) {
            errors.push(
                new TransactionError(
                    "Invalid 'amount' defined on transaction",
                    this.id,
                    ".amount",
                    this.fee.toString(),
                    "Must be equal to the reward * num",
                )
            );
        }
        return errors;
    }

    applyAsset(store) {
        const errors = [];

        // ----------------------------
        // Update Sender
        // ----------------------------
        const sender = store.account.get(this.senderId);
        if (!sender) {
            errors.push(new TransactionError("Not initialized address", this.id));
            return errors;
        }
        const afterBalance = myUtils.sub(sender.balance, this.amount);
        if (+afterBalance < 0) {
            errors.push(new TransactionError("Not enough balance", this.id));
            return errors;
        }
        store.account.set(sender.address, { ...sender, balance: afterBalance, asset: { quiz: this.asset.quiz } });

        // ----------------------------
        // Balance recipient burn
        // ----------------------------
        const recipient = store.account.getOrDefault(this.recipientId);
        store.account.set(recipient.address, { ...recipient, balance: "0" });
        return errors;
    }

    undoAsset(store) {
        const sender = store.account.get(this.senderId);
        if (sender) {
            const afterBalance = myUtils.add(sender.balance, this.amount);
            if (afterBalance > constants.MAX_TRANSACTION_AMOUNT) {
                errors.push(new TransactionError("Invalid amount", this.id));
                return errors;
            }
            if (+afterBalance < 0) afterBalance = "0";
            store.account.set(sender.address, { ...sender, balance: afterBalance, asset: null });
        }
        return [];
    }
}

module.exports = QuestionTransaction;