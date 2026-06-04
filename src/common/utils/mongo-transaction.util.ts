import { ClientSession, Connection } from 'mongoose';

/** True when MongoDB is standalone (local dev) and multi-doc transactions are unavailable. */
export function isReplicaSetTransactionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('Transaction numbers are only allowed') ||
    msg.includes('replica set member or mongos')
  );
}

/**
 * Runs `fn` inside a MongoDB transaction when the deployment supports it (replica set / mongos).
 * On standalone MongoDB (typical local dev), runs `fn` without a session instead.
 */
export async function runOptionalTransaction<T>(
  connection: Connection,
  fn: (session: ClientSession | undefined) => Promise<T>,
): Promise<T> {
  const session = await connection.startSession();
  try {
    return await session.withTransaction(() => fn(session));
  } catch (err) {
    if (!isReplicaSetTransactionError(err)) throw err;
    return fn(undefined);
  } finally {
    await session.endSession();
  }
}
