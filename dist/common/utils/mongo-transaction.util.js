"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReplicaSetTransactionError = isReplicaSetTransactionError;
exports.runOptionalTransaction = runOptionalTransaction;
function isReplicaSetTransactionError(err) {
    const msg = err instanceof Error ? err.message : String(err);
    return (msg.includes('Transaction numbers are only allowed') ||
        msg.includes('replica set member or mongos'));
}
async function runOptionalTransaction(connection, fn) {
    const session = await connection.startSession();
    try {
        return await session.withTransaction(() => fn(session));
    }
    catch (err) {
        if (!isReplicaSetTransactionError(err))
            throw err;
        return fn(undefined);
    }
    finally {
        await session.endSession();
    }
}
//# sourceMappingURL=mongo-transaction.util.js.map