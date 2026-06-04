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
exports.PurchaseSchema = exports.Purchase = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const app_constants_1 = require("../../common/constants/app.constants");
let Purchase = class Purchase {
};
exports.Purchase = Purchase;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Course', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Purchase.prototype, "courseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Purchase.prototype, "buyerId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Purchase.prototype, "couponUsed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Purchase.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'INR' }),
    __metadata("design:type", String)
], Purchase.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: app_constants_1.PaymentStatus, default: app_constants_1.PaymentStatus.PENDING }),
    __metadata("design:type", String)
], Purchase.prototype, "paymentStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Payment', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Purchase.prototype, "paymentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Purchase.prototype, "commissionsDistributed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Purchase.prototype, "courseSnapshot", void 0);
exports.Purchase = Purchase = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'purchases' })
], Purchase);
exports.PurchaseSchema = mongoose_1.SchemaFactory.createForClass(Purchase);
exports.PurchaseSchema.index({ buyerId: 1, courseId: 1 });
exports.PurchaseSchema.index({ couponUsed: 1, createdAt: -1 });
exports.PurchaseSchema.index({ createdAt: -1 });
//# sourceMappingURL=purchase.schema.js.map