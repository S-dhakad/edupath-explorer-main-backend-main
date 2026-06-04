import { UsersService } from '../users/users.service';
import { Model } from 'mongoose';
import { UserDocument } from '../users/user.schema';
import { CommissionDocument } from '../commission/schemas/commission.schema';
export declare class AffiliateController {
    private readonly usersService;
    private readonly commissionModel;
    private readonly userModel;
    constructor(usersService: UsersService, commissionModel: Model<CommissionDocument>, userModel: Model<UserDocument>);
    tree(user: any, depth?: string): Promise<any>;
    stats(user: any): Promise<{
        directReferrals: number;
        referralListSample: UserDocument[];
        totalCommissionRecorded: any;
    }>;
}
