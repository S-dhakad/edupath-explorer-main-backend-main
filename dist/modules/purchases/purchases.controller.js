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
exports.PurchasesController = void 0;
const common_1 = require("@nestjs/common");
const purchases_service_1 = require("./purchases.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PurchasesController = class PurchasesController {
    constructor(purchasesService) {
        this.purchasesService = purchasesService;
    }
    async create(purchase, req) {
        return this.purchasesService.create({
            ...purchase,
            buyerId: req.user._id.toString(),
        });
    }
    async findByUser(req) {
        return this.purchasesService.findByUser(req.user._id.toString());
    }
    async findByCoupon(coupon) {
        return this.purchasesService.findByCoupon(coupon);
    }
};
exports.PurchasesController = PurchasesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PurchasesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PurchasesController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)('coupon/:coupon'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('coupon')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchasesController.prototype, "findByCoupon", null);
exports.PurchasesController = PurchasesController = __decorate([
    (0, common_1.Controller)('purchases'),
    __metadata("design:paramtypes", [purchases_service_1.PurchasesService])
], PurchasesController);
//# sourceMappingURL=purchases.controller.js.map