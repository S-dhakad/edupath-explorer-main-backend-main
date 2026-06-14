"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovedMembershipGuard = void 0;
const common_1 = require("@nestjs/common");
const plan_sales_service_1 = require("./plan-sales.service");
const app_constants_1 = require("../../common/constants/app.constants");
let ApprovedMembershipGuard = class ApprovedMembershipGuard {
    constructor(planSales) {
        this.planSales = planSales;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        if (!user?._id)
            throw new common_1.ForbiddenException();
        if (user.role === app_constants_1.UserRole.ADMIN)
            return true;
        await this.planSales.assertApprovedMembership(user._id.toString());
        return true;
    }
};
exports.ApprovedMembershipGuard = ApprovedMembershipGuard;
exports.ApprovedMembershipGuard = ApprovedMembershipGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [plan_sales_service_1.PlanSalesService])
], ApprovedMembershipGuard);
//# sourceMappingURL=approved-membership.guard.js.map