import { PlansService } from './plans.service';
export declare class PlansController {
    private readonly plansService;
    constructor(plansService: PlansService);
    create(plan: Partial<any>): Promise<import("./plan.schema").Plan>;
    findAll(active?: string): Promise<import("./plan.schema").Plan[]>;
    findOne(id: string): Promise<import("./plan.schema").Plan>;
}
