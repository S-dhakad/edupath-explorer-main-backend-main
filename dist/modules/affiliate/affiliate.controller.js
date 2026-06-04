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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffiliateController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const users_service_1 = require("../users/users.service");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../users/user.schema");
const commission_schema_1 = require("../commission/schemas/commission.schema");
let AffiliateController = class AffiliateController {
    constructor(usersService, commissionModel, userModel) {
        this.usersService = usersService;
        this.commissionModel = commissionModel;
        this.userModel = userModel;
    }
    async tree(user, depth) {
        const d = Math.min(parseInt(depth || '3', 10) || 3, 6);
        return this.usersService.listReferralTree(user._id.toString(), d);
    }
    async stats(user) {
        const uid = new mongoose_2.Types.ObjectId(user._id);
        const [direct, commissionSum] = await Promise.all([
            this.userModel.countDocuments({ referredBy: uid }),
            this.commissionModel.aggregate([
                { $match: { beneficiaryUserId: uid } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);
        const referrals = await this.usersService.getReferrals(user._id.toString());
        return {
            directReferrals: direct,
            referralListSample: referrals.slice(0, 50),
            totalCommissionRecorded: commissionSum[0]?.total || 0,
        };
    }
};
exports.AffiliateController = AffiliateController;
__decorate([
    (0, common_1.Get)('tree'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('depth')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AffiliateController.prototype, "tree", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AffiliateController.prototype, "stats", null);
exports.AffiliateController = AffiliateController = __decorate([
    (0, swagger_1.ApiTags)('affiliate'),
    (0, common_1.Controller)('affiliate'),
    __param(1, (0, mongoose_1.InjectModel)(commission_schema_1.Commission.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        mongoose_2.Model,
        mongoose_2.Model])
], AffiliateController);
//# sourceMappingURL=affiliate.controller.js.map