import { ClientSession, Connection } from 'mongoose';
export declare function isReplicaSetTransactionError(err: unknown): boolean;
export declare function runOptionalTransaction<T>(connection: Connection, fn: (session: ClientSession | undefined) => Promise<T>): Promise<T>;
