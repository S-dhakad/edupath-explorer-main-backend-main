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
exports.WithdrawalSchema = exports.Withdrawal = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const app_constants_1 = require("../../common/constants/app.constants");
let Withdrawal = class Withdrawal {
};
exports.Withdrawal = Withdrawal;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Withdrawal.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Withdrawal.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: app_constants_1.WithdrawalStatus, default: app_constants_1.WithdrawalStatus.PENDING }),
    __metadata("design:type", String)
], Withdrawal.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['upi', 'bank', 'paypal'], required: true }),
    __metadata("design:type", String)
], Withdrawal.prototype, "method", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Withdrawal.prototype, "accountHolderName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Withdrawal.prototype, "bankName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Withdrawal.prototype, "accountNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Withdrawal.prototype, "ifscCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Withdrawal.prototype, "upiId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Withdrawal.prototype, "paypalEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Withdrawal.prototype, "adminNote", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Withdrawal.prototype, "paidAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Withdrawal.prototype, "processedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'razorpayx' }),
    __metadata("design:type", String)
], Withdrawal.prototype, "payoutProvider", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Withdrawal.prototype, "razorpayContactId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Withdrawal.prototype, "razorpayFundAccountId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Withdrawal.prototype, "razorpayPayoutId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Withdrawal.prototype, "payoutProviderStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Withdrawal.prototype, "payoutError", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Withdrawal.prototype, "payoutInitiatedAt", void 0);
exports.Withdrawal = Withdrawal = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'withdrawals' })
], Withdrawal);
exports.WithdrawalSchema = mongoose_1.SchemaFactory.createForClass(Withdrawal);
exports.WithdrawalSchema.index({ userId: 1, createdAt: -1 });
//# sourceMappingURL=withdrawal.schema.js.map