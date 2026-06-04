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
exports.PlanSaleSchema = exports.PlanSale = exports.PlanSaleStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var PlanSaleStatus;
(function (PlanSaleStatus) {
    PlanSaleStatus["PENDING_PAYMENT"] = "pending_payment";
    PlanSaleStatus["PAID"] = "paid";
})(PlanSaleStatus || (exports.PlanSaleStatus = PlanSaleStatus = {}));
let PlanSale = class PlanSale {
};
exports.PlanSale = PlanSale;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PlanSale.prototype, "sellerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PlanSale.prototype, "buyerUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Plan', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PlanSale.prototype, "planId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlanSale.prototype, "fullName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, lowercase: true }),
    __metadata("design:type", String)
], PlanSale.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PlanSale.prototype, "age", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], PlanSale.prototype, "dateOfBirth", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlanSale.prototype, "contactNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlanSale.prototype, "promoCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: PlanSaleStatus, default: PlanSaleStatus.PENDING_PAYMENT }),
    __metadata("design:type", String)
], PlanSale.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlanSale.prototype, "adminNote", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Payment', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PlanSale.prototype, "paymentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], PlanSale.prototype, "commissionsDistributed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ select: false }),
    __metadata("design:type", String)
], PlanSale.prototype, "buyerTempPassword", void 0);
exports.PlanSale = PlanSale = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'plan_sales' })
], PlanSale);
exports.PlanSaleSchema = mongoose_1.SchemaFactory.createForClass(PlanSale);
exports.PlanSaleSchema.index({ sellerId: 1, createdAt: -1 });
exports.PlanSaleSchema.index({ status: 1, createdAt: -1 });
exports.PlanSaleSchema.index({ paymentId: 1 });
//# sourceMappingURL=plan-sale.schema.js.map