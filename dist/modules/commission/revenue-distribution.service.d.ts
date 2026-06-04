import { Connection, Model } from 'mongoose';
import { PurchaseDocument } from '../purchases/purchase.schema';
import { CommissionDocument } from './schemas/commission.schema';
import { UserDocument } from '../users/user.schema';
import { WalletRepository } from '../wallet/wallet.repository';
import { SettingsService } from '../settings/settings.service';
import { CourseDocument } from '../courses/course.schema';
import { PlanSaleDocument } from '../plan-sales/plan-sale.schema';
export declare class RevenueDistributionService {
    private readonly connection;
    private readonly purchaseModel;
    private readonly planSaleModel;
    private readonly commissionModel;
    private readonly userModel;
    private readonly walletRepo;
    private readonly settingsService;
    private readonly logger;
    constructor(connection: Connection, purchaseModel: Model<PurchaseDocument>, planSaleModel: Model<PlanSaleDocument>, commissionModel: Model<CommissionDocument>, userModel: Model<UserDocument>, walletRepo: WalletRepository, settingsService: SettingsService);
    distributePurchase(purchase: PurchaseDocument, course: CourseDocument, couponOwner: UserDocument): Promise<void>;
    distributePlanSale(sale: PlanSaleDocument, amount: number, seller: UserDocument): Promise<void>;
    distributePlatformOnly(purchase: PurchaseDocument): Promise<void>;
}
