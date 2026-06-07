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
exports.MarketingToolSchema = exports.MarketingTool = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let MarketingTool = class MarketingTool {
};
exports.MarketingTool = MarketingTool;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], MarketingTool.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], MarketingTool.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'image', trim: true }),
    __metadata("design:type", String)
], MarketingTool.prototype, "icon", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], MarketingTool.prototype, "assetCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], MarketingTool.prototype, "downloadUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], MarketingTool.prototype, "previewUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'from-primary/15 to-transparent border-primary/20', trim: true }),
    __metadata("design:type", String)
], MarketingTool.prototype, "tone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], MarketingTool.prototype, "order", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], MarketingTool.prototype, "active", void 0);
exports.MarketingTool = MarketingTool = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'marketingTools' })
], MarketingTool);
exports.MarketingToolSchema = mongoose_1.SchemaFactory.createForClass(MarketingTool);
//# sourceMappingURL=marketing-tool.schema.js.map