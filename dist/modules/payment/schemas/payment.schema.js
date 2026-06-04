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
exports.PaymentSchema = exports.Payment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const app_constants_1 = require("../../../common/constants/app.constants");
let Payment = class Payment {
};
exports.Payment = Payment;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Payment.prototype, "payerUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Course', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Payment.prototype, "courseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Plan', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Payment.prototype, "planId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Payment.prototype, "couponCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'INR' }),
    __metadata("design:type", String)
], Payment.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['stripe', 'razorpay', 'manual'], required: true }),
    __metadata("design:type", String)
], Payment.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: app_constants_1.PaymentStatus, default: app_constants_1.PaymentStatus.PENDING }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Payment.prototype, "externalId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Payment.prototype, "providerPayload", void 0);
exports.Payment = Payment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'payments' })
], Payment);
exports.PaymentSchema = mongoose_1.SchemaFactory.createForClass(Payment);
exports.PaymentSchema.index({ externalId: 1, provider: 1 });
//# sourceMappingURL=payment.schema.js.map