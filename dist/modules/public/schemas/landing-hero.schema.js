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
exports.LandingHeroSchema = exports.LandingHero = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const SlideSchema = {
    eyebrow: { type: String, required: true },
    title: { type: String, required: true },
    highlight: { type: String, required: true },
    suffix: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    videoUrl: { type: String },
};
const VisualMetaSchema = {
    chip: { type: String, required: true },
    metricLabel: { type: String, required: true },
    metricValue: { type: String, required: true },
    metricHint: { type: String, required: true },
};
const StatCardSchema = {
    key: { type: String, required: true },
    value: { type: Number, required: true },
    suffix: { type: String, required: true },
    label: { type: String, required: true },
};
const OfferSchema = {
    id: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    cta: { type: String, required: true },
    tone: { type: String, enum: ['primary', 'accent', 'dark'], required: true },
};
let LandingHero = class LandingHero {
};
exports.LandingHero = LandingHero;
__decorate([
    (0, mongoose_1.Prop)({ unique: true, default: 'default' }),
    __metadata("design:type", String)
], LandingHero.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [SlideSchema], default: [] }),
    __metadata("design:type", Array)
], LandingHero.prototype, "slides", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], LandingHero.prototype, "trustPills", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'New cohorts every Monday' }),
    __metadata("design:type", String)
], LandingHero.prototype, "announcementBadge", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [VisualMetaSchema], default: [] }),
    __metadata("design:type", Array)
], LandingHero.prototype, "visualMeta", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '₹500 / referral' }),
    __metadata("design:type", String)
], LandingHero.prototype, "referralBonusLabel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [StatCardSchema], default: [] }),
    __metadata("design:type", Array)
], LandingHero.prototype, "statCards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [OfferSchema], default: [] }),
    __metadata("design:type", Array)
], LandingHero.prototype, "offers", void 0);
exports.LandingHero = LandingHero = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'landingHero' })
], LandingHero);
exports.LandingHeroSchema = mongoose_1.SchemaFactory.createForClass(LandingHero);
//# sourceMappingURL=landing-hero.schema.js.map