import { WalletService } from './wallet.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    me(user: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/wallet.schema").WalletDocument, {}, {}> & import("./schemas/wallet.schema").Wallet & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    txs(user: any, q: PaginationQueryDto): Promise<{
        items: (import("mongoose").FlattenMaps<import("./schemas/wallet-transaction.schema").WalletTransactionDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
