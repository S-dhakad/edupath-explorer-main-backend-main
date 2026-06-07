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
exports.PatchLandingPricingDto = exports.LandingPricingCompareRowDto = exports.LandingPricingTierDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class LandingPricingTierDto {
}
exports.LandingPricingTierDto = LandingPricingTierDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'pro', description: 'Stable slug / id for checkout links' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], LandingPricingTierDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pro Learner' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], LandingPricingTierDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Most popular for serious learners' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(240),
    __metadata("design:type", String)
], LandingPricingTierDto.prototype, "tagline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1499, description: 'Original / MRP price shown with strikethrough' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(99_999_999),
    __metadata("design:type", Number)
], LandingPricingTierDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 999, description: 'Fixed price applied when a member referral promo code is used' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(99_999_999),
    __metadata("design:type", Number)
], LandingPricingTierDto.prototype, "promoPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'month', description: 'Billing label shown after price' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(32),
    __metadata("design:type", String)
], LandingPricingTierDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        description: 'Plan benefits — each string is one bullet on cards and /plans',
        example: ['Access to all 200+ courses', 'Live mentorship sessions'],
    }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!Array.isArray(value))
            return [];
        return value
            .map((x) => (typeof x === 'string' ? x.trim() : String(x ?? '').trim()))
            .filter((s) => s.length > 0);
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Each tier must have at least one plan benefit (feature line)' }),
    (0, class_validator_1.ArrayMaxSize)(40),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(500, { each: true }),
    __metadata("design:type", Array)
], LandingPricingTierDto.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Highlight this column in the UI' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LandingPricingTierDto.prototype, "highlight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Most Popular' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], LandingPricingTierDto.prototype, "badge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '200+ full library' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], LandingPricingTierDto.prototype, "chip", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Save ₹3,000+ vs buying courses' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], LandingPricingTierDto.prototype, "savings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Long tier copy; may contain HTML if your admin uses CKEditor',
        example: '<p>Unlock the full library…</p>',
    }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50_000),
    __metadata("design:type", String)
], LandingPricingTierDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'from-primary/70 via-primary/40 to-transparent',
        description: 'Tailwind gradient fragment for marketing card wash',
    }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], LandingPricingTierDto.prototype, "accent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        description: 'MongoDB course ids included in this plan (full playlist for members)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!Array.isArray(value))
            return [];
        return value.map((x) => String(x ?? '').trim()).filter(Boolean);
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(500),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], LandingPricingTierDto.prototype, "courseIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Show this plan on homepage / public pricing cards (sell flow lists all active plans)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LandingPricingTierDto.prototype, "showOnLanding", void 0);
class LandingPricingCompareRowDto {
}
exports.LandingPricingCompareRowDto = LandingPricingCompareRowDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Course access' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], LandingPricingCompareRowDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        description: 'Must have exactly one string per pricing tier (same order as tiers array)',
    }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!Array.isArray(value))
            return [];
        return value.map((x) => (typeof x === 'string' ? x.trim() : String(x ?? '').trim()));
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(12),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(500, { each: true }),
    __metadata("design:type", Array)
], LandingPricingCompareRowDto.prototype, "cells", void 0);
class PatchLandingPricingDto {
}
exports.PatchLandingPricingDto = PatchLandingPricingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [LandingPricingTierDto], description: 'Replace all tiers when sent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(12),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LandingPricingTierDto),
    __metadata("design:type", Array)
], PatchLandingPricingDto.prototype, "tiers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [LandingPricingCompareRowDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(40),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LandingPricingCompareRowDto),
    __metadata("design:type", Array)
], PatchLandingPricingDto.prototype, "compareRows", void 0);
//# sourceMappingURL=patch-landing-pricing.dto.js.map