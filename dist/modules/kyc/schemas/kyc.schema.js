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
exports.KycSchema = exports.Kyc = exports.KycStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var KycStatus;
(function (KycStatus) {
    KycStatus["PENDING"] = "PENDING";
    KycStatus["APPROVED"] = "APPROVED";
    KycStatus["REJECTED"] = "REJECTED";
})(KycStatus || (exports.KycStatus = KycStatus = {}));
let Kyc = class Kyc {
};
exports.Kyc = Kyc;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Kyc.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Kyc.prototype, "aadharNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Kyc.prototype, "panNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Kyc.prototype, "aadharImage", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Kyc.prototype, "panImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Kyc.prototype, "bankName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Kyc.prototype, "accountNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Kyc.prototype, "ifscCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Kyc.prototype, "accountHolderName", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: KycStatus,
        default: KycStatus.PENDING,
    }),
    __metadata("design:type", String)
], Kyc.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Kyc.prototype, "adminNote", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Kyc.prototype, "razorpayContactId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Kyc.prototype, "razorpayFundAccountId", void 0);
exports.Kyc = Kyc = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Kyc);
exports.KycSchema = mongoose_1.SchemaFactory.createForClass(Kyc);
//# sourceMappingURL=kyc.schema.js.map