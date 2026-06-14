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
exports.ContactInquirySchema = exports.ContactInquiry = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let ContactInquiry = class ContactInquiry {
};
exports.ContactInquiry = ContactInquiry;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ContactInquiry.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ContactInquiry.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], ContactInquiry.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ContactInquiry.prototype, "topic", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ContactInquiry.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'new', enum: ['new', 'read', 'archived'] }),
    __metadata("design:type", String)
], ContactInquiry.prototype, "status", void 0);
exports.ContactInquiry = ContactInquiry = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'contactInquiries' })
], ContactInquiry);
exports.ContactInquirySchema = mongoose_1.SchemaFactory.createForClass(ContactInquiry);
//# sourceMappingURL=contact-inquiry.schema.js.map