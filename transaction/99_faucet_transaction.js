const { BaseTransaction, TransactionError, constants } = require("@liskhq/lisk-transactions");
const myUtils = require("../utility");

class FaucetTransaction extends BaseTransaction {

    static get TYPE () {
        return 99;
    }

    static get FEE () {
        return 0;
    };

    async prepare(store) {
        await store.account.cache([
            {
                address: this.recipientId,
            },
        ]);
    }

    validateAsset() {
        return [];
    }

    applyAsset(store) {
        const errors = [];
        const recipient = store.account.getOrDefault(this.recipientId);
        const afterBalance = myUtils.add(recipient.balance, (10 ** 8) * 100);
        if (afterBalance > constants.MAX_TRANSACTION_AMOUNT) {
            errors.push(new TransactionError("Invalid balance", this.id));
            return errors;
        }
        const newObj = { ...recipient, balance: afterBalance.toString() };
        store.account.set(recipient.address, newObj);
        return [];
    }

    undoAsset(store) {
        const recipient = store.account.get(this.recipientId);
        if (recipient) {
            const afterBalance = myUtils.sub(recipient.balance, (10 ** 8) * 100);
            const oldObj = { ...recipient, balance: afterBalance.toString() };
            store.account.set(recipient.address, oldObj);
        }
        return [];
    }
}

module.exports = FaucetTransaction;