const { BaseTransaction, TransactionError, constants } = require('@liskhq/lisk-transactions');
const BigNum = require('@liskhq/bignum');
const myutils = require('../utility');

class AnswerTransaction extends BaseTransaction {

    static get TYPE () {
        return 52;
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

        store.entities.Transaction.addFilter('target_id', 'FILTER_TYPE_CUSTOM', {
            condition: 'trs.asset @> \'{ "data": "${target_id:value}" }\'::jsonb',
        });

        await store.transaction.cache([
            {
                id: this.asset.data
            },
            {
                target_id: this.asset.data
            }
        ]);
    }

    /**
     * data: String,
     * quiz: {
     *     answer: String
     * }
     */
    validateAsset() {
        const errors = [];
        
        // ----------------------------
        // Data Field Check
        // ----------------------------
        if (!this.asset.data) {
            errors.push(new TransactionError('Required parameter "asset.data" is not found', this.id));
        }
        
        // ----------------------------
        // Quiz Field Check
        // ----------------------------
        else if (!this.asset.quiz) {
            errors.push(new TransactionError('Required parameter "asset.quiz" is not found', this.id));
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
        return errors;
    }

    applyAsset(store) {
        const errors = [];
        if (!store.transaction.data || store.transaction.data.length === 0) {
            errors.push(new TransactionError('Question Transaction Not Found.', this.id));
            return errors;
        }
        
        const questionTransaction = store.transaction.get(this.asset.data);
        if (!questionTransaction) {
            errors.push(new TransactionError('Question Transaction Not Found.', this.id));
            return errors;
        }
        if (questionTransaction.senderId !== this.senderId) {
            errors.push(new TransactionError('Can not answer own question.', this.id));
            return errors;
        }
        if (questionTransaction.asset.quiz.answer !== this.asset.quiz.answer) {
            errors.push(new TransactionError('Answer missmatch.', this.id));
            return errors;
        }

        const sameTypeTransactions = store.transaction.data.filter(tx => tx.type === AnswerTransaction.TYPE && tx.asset.data === this.asset.data);
        if (sameTypeTransactions.filter(tx => tx.senderId === this.senderId).length > 0) {
            errors.push(new TransactionError('This question has already been answered.', this.id));
            return errors;
        }
        if (sameTypeTransactions.length >= questionTransaction.asset.quiz.reward.length) {
            errors.push(new TransactionError('This question has reached the maximum number of answers.', this.id));
            return errors;
        }
        
        const reward = questionTransaction.asset.quiz.reward[sameTypeTransactions.length];
        if (!reward) {
            errors.push(new errors_1.TransactionError('Invalid reward', this.id));
            return errors;
        }

        const sender = store.account.get(this.senderId);
        
        const afterBalance = new BigNum(sender.balance).add(new BigNum(reward));
        if (afterBalance.gt(constants.MAX_TRANSACTION_AMOUNT)) {
            errors.push(new errors_1.TransactionError('Invalid reward', this.id));
            return errors;
        }

        const asset = {
            data: this.asset.data,
            quiz: {
                answer: this.asset.quiz.answer,
                reward: reward
            }
        }
        const newObj = { ...sender, balance: afterBalance.toString(), asset: asset };
        store.account.set(sender.address, newObj);
        return [];
    }

    undoAsset(store) {
        const sender = store.account.get(this.senderId);
        const afterBalance = new BigNum(sender.balance).sub(new BigNum(this.asset.quiz.reward));
        const oldObj = { ...sender, balance: afterBalance.toString(), asset: null };
        store.account.set(sender.address, oldObj);
        return [];
    }
}

module.exports = AnswerTransaction;