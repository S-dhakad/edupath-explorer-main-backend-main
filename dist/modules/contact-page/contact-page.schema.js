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
exports.ContactPageSchema = exports.ContactPage = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let ContactPage = class ContactPage {
};
exports.ContactPage = ContactPage;
__decorate([
    (0, mongoose_1.Prop)({ unique: true, default: 'default' }),
    __metadata("design:type", String)
], ContactPage.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Contact us' }),
    __metadata("design:type", String)
], ContactPage.prototype, "badgeText", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "Let's build your" }),
    __metadata("design:type", String)
], ContactPage.prototype, "headingPrefix", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'next growth' }),
    __metadata("design:type", String)
], ContactPage.prototype, "headingHighlight", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'plan' }),
    __metadata("design:type", String)
], ContactPage.prototype, "headingSuffix", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], ContactPage.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'hello@StartSuccess.app' }),
    __metadata("design:type", String)
], ContactPage.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '+91 98765 43210' }),
    __metadata("design:type", String)
], ContactPage.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Bengaluru, India' }),
    __metadata("design:type", String)
], ContactPage.prototype, "office", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Average response time: under 24 hours' }),
    __metadata("design:type", String)
], ContactPage.prototype, "responseTimeText", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Visit FAQ' }),
    __metadata("design:type", String)
], ContactPage.prototype, "faqButtonLabel", void 0);
exports.ContactPage = ContactPage = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'contactPage' })
], ContactPage);
exports.ContactPageSchema = mongoose_1.SchemaFactory.createForClass(ContactPage);
//# sourceMappingURL=contact-page.schema.js.map