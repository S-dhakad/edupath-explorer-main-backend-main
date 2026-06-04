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
exports.SettingsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const platform_settings_schema_1 = require("./schemas/platform-settings.schema");
const app_constants_1 = require("../../common/constants/app.constants");
let SettingsRepository = class SettingsRepository {
    constructor(model) {
        this.model = model;
    }
    async getGlobal() {
        let doc = await this.model.findOne({ key: 'global' }).exec();
        if (!doc) {
            doc = await this.model.create({
                key: 'global',
                couponOwnerPercent: app_constants_1.DEFAULT_COUPON_OWNER_PCT,
                platformPercent: app_constants_1.DEFAULT_PLATFORM_PCT,
                directParentPercent: app_constants_1.DEFAULT_DIRECT_PARENT_PCT,
                memberPromoBuyerDiscountPercent: app_constants_1.DEFAULT_MEMBER_PROMO_BUYER_DISCOUNT_PCT,
            });
        }
        return doc;
    }
    async updateGlobal(patch) {
        return this.model
            .findOneAndUpdate({ key: 'global' }, { $set: patch }, { new: true, upsert: true })
            .exec();
    }
};
exports.SettingsRepository = SettingsRepository;
exports.SettingsRepository = SettingsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(platform_settings_schema_1.PlatformSettings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SettingsRepository);
//# sourceMappingURL=settings.repository.js.map