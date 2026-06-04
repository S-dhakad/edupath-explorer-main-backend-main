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
exports.PlatformSettingsSchema = exports.PlatformSettings = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const app_constants_1 = require("../../../common/constants/app.constants");
let PlatformSettings = class PlatformSettings {
};
exports.PlatformSettings = PlatformSettings;
__decorate([
    (0, mongoose_1.Prop)({ unique: true, default: 'global' }),
    __metadata("design:type", String)
], PlatformSettings.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: app_constants_1.DEFAULT_COUPON_OWNER_PCT }),
    __metadata("design:type", Number)
], PlatformSettings.prototype, "couponOwnerPercent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: app_constants_1.DEFAULT_PLATFORM_PCT }),
    __metadata("design:type", Number)
], PlatformSettings.prototype, "platformPercent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: app_constants_1.DEFAULT_DIRECT_PARENT_PCT }),
    __metadata("design:type", Number)
], PlatformSettings.prototype, "directParentPercent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: app_constants_1.DEFAULT_MEMBER_PROMO_BUYER_DISCOUNT_PCT }),
    __metadata("design:type", Number)
], PlatformSettings.prototype, "memberPromoBuyerDiscountPercent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], PlatformSettings.prototype, "fraudBlockSelfReferral", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], PlatformSettings.prototype, "fraudBlockCouponOwnerPurchase", void 0);
exports.PlatformSettings = PlatformSettings = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'settings' })
], PlatformSettings);
exports.PlatformSettingsSchema = mongoose_1.SchemaFactory.createForClass(PlatformSettings);
//# sourceMappingURL=platform-settings.schema.js.map