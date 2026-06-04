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
exports.LandingPricingSchema = exports.LandingPricing = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const PricingTierSchema = {
    id: { type: String, required: true },
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    price: { type: Number, required: true },
    period: { type: String, required: true },
    features: { type: [String], default: [] },
    highlight: { type: Boolean, default: false },
    badge: { type: String },
    chip: { type: String, required: true },
    savings: { type: String, required: true },
    description: { type: String, required: true },
    accent: { type: String, required: true },
    courseIds: { type: [String], default: [] },
};
const CompareRowSchema = {
    label: { type: String, required: true },
    cells: { type: [String], default: [] },
};
let LandingPricing = class LandingPricing {
};
exports.LandingPricing = LandingPricing;
__decorate([
    (0, mongoose_1.Prop)({ unique: true, default: 'default' }),
    __metadata("design:type", String)
], LandingPricing.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [PricingTierSchema], default: [] }),
    __metadata("design:type", Array)
], LandingPricing.prototype, "tiers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [CompareRowSchema], default: [] }),
    __metadata("design:type", Array)
], LandingPricing.prototype, "compareRows", void 0);
exports.LandingPricing = LandingPricing = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'landingPricing' })
], LandingPricing);
exports.LandingPricingSchema = mongoose_1.SchemaFactory.createForClass(LandingPricing);
//# sourceMappingURL=landing-pricing.schema.js.map