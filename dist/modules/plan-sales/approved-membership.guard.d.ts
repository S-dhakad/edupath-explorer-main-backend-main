import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PlanSalesService } from './plan-sales.service';
export declare class ApprovedMembershipGuard implements CanActivate {
    private readonly planSales;
    constructor(planSales: PlanSalesService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
