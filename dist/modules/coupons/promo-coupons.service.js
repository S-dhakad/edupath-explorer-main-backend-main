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
exports.PromoCouponsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const promo_coupon_schema_1 = require("./promo-coupon.schema");
let PromoCouponsService = class PromoCouponsService {
    constructor(model) {
        this.model = model;
    }
    findAll() {
        return this.model.find().sort({ createdAt: -1 }).lean();
    }
    async create(dto) {
        const code = dto.code?.trim()?.toUpperCase();
        if (!code)
            throw new common_1.BadRequestException('Coupon code is required');
        const exists = await this.model.findOne({ code }).lean();
        if (exists)
            throw new common_1.BadRequestException('Coupon code already exists');
        const doc = await this.model.create({
            code,
            discountType: dto.discountType || 'percentage',
            discountValue: dto.discountValue ?? 0,
            minPurchase: dto.minPurchase ?? 0,
            maxUsage: dto.maxUsage ?? 0,
            usedCount: 0,
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
            active: dto.active !== false,
        });
        return doc.toObject();
    }
    async update(id, dto) {
        const doc = await this.model.findById(id).exec();
        if (!doc)
            throw new common_1.NotFoundException('Coupon not found');
        if (dto.code) {
            const code = dto.code.trim().toUpperCase();
            const dup = await this.model.findOne({ code, _id: { $ne: id } }).lean();
            if (dup)
                throw new common_1.BadRequestException('Coupon code already exists');
            doc.code = code;
        }
        if (dto.discountType)
            doc.discountType = dto.discountType;
        if (dto.discountValue != null)
            doc.discountValue = dto.discountValue;
        if (dto.minPurchase != null)
            doc.minPurchase = dto.minPurchase;
        if (dto.maxUsage != null)
            doc.maxUsage = dto.maxUsage;
        if (dto.expiresAt !== undefined)
            doc.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;
        if (dto.active != null)
            doc.active = dto.active;
        await doc.save();
        return doc.toObject();
    }
    async remove(id) {
        const res = await this.model.findByIdAndDelete(id).exec();
        if (!res)
            throw new common_1.NotFoundException('Coupon not found');
        return { deleted: true };
    }
    async computeDiscount(code, subtotal) {
        const upper = code?.trim()?.toUpperCase();
        if (!upper)
            return null;
        const coupon = await this.model.findOne({ code: upper, active: true }).lean();
        if (!coupon)
            return null;
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            throw new common_1.BadRequestException('This promo coupon has expired');
        }
        if (coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage) {
            throw new common_1.BadRequestException('This promo coupon has reached its usage limit');
        }
        if (subtotal < (coupon.minPurchase ?? 0)) {
            throw new common_1.BadRequestException(`Minimum purchase ₹${coupon.minPurchase} required for this coupon`);
        }
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
        }
        else {
            discountAmount = Math.min(subtotal, Math.round(coupon.discountValue));
        }
        discountAmount = Math.max(0, Math.min(subtotal, discountAmount));
        const finalSubtotal = Math.max(0, subtotal - discountAmount);
        const label = coupon.discountType === 'percentage'
            ? `${coupon.discountValue}% off`
            : `₹${coupon.discountValue} off`;
        return {
            kind: 'admin_coupon',
            code: upper,
            discountAmount,
            finalSubtotal,
            label,
        };
    }
    async incrementUsage(code) {
        const upper = code?.trim()?.toUpperCase();
        if (!upper)
            return;
        await this.model.updateOne({ code: upper }, { $inc: { usedCount: 1 } }).exec();
    }
};
exports.PromoCouponsService = PromoCouponsService;
exports.PromoCouponsService = PromoCouponsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(promo_coupon_schema_1.PromoCoupon.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PromoCouponsService);
//# sourceMappingURL=promo-coupons.service.js.map