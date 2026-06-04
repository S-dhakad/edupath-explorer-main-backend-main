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
exports.UserSchema = exports.User = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const app_constants_1 = require("../../common/constants/app.constants");
let User = class User {
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, select: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ unique: true, sparse: true }),
    __metadata("design:type", String)
], User.prototype, "referralCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], User.prototype, "referredBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], User.prototype, "lockedAffiliateCoupon", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: app_constants_1.UserRole, default: app_constants_1.UserRole.USER }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "emailVerified", void 0);
__decorate([
    (0, mongoose_1.Prop)({ select: false }),
    __metadata("design:type", String)
], User.prototype, "emailVerificationToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ select: false }),
    __metadata("design:type", String)
], User.prototype, "passwordResetToken", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "passwordResetExpires", void 0);
__decorate([
    (0, mongoose_1.Prop)({ select: false }),
    __metadata("design:type", String)
], User.prototype, "refreshTokenHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "accountActive", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], User.prototype, "age", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "dateOfBirth", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isBanned", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isVerifiedSeller", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: app_constants_1.AffiliateRank, default: app_constants_1.AffiliateRank.BRONZE }),
    __metadata("design:type", String)
], User.prototype, "rank", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Plan', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], User.prototype, "planId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "activeIncome", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "passiveIncome", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "totalReferralsCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "directReferralsCount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "googleId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "facebookId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "avatarUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ _id: true, timestamps: true, collection: 'users' })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.index({ referredBy: 1 });
//# sourceMappingURL=user.schema.js.map