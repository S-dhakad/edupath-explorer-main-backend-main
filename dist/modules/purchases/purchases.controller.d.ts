import { PurchasesService } from './purchases.service';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    create(purchase: Partial<any>, req: any): Promise<import("./purchase.schema").Purchase>;
    findByUser(req: any): Promise<import("./purchase.schema").Purchase[]>;
    findByCoupon(coupon: string): Promise<import("./purchase.schema").Purchase[]>;
}
