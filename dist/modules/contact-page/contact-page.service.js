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
exports.ContactPageService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const contact_page_schema_1 = require("./contact-page.schema");
const contact_page_defaults_1 = require("./contact-page.defaults");
let ContactPageService = class ContactPageService {
    constructor(model) {
        this.model = model;
    }
    async ensureDefault() {
        const existing = await this.model.findOne({ key: 'default' }).lean();
        if (existing)
            return existing;
        return this.model.create(contact_page_defaults_1.DEFAULT_CONTACT_PAGE);
    }
    async getPublic() {
        const doc = await this.ensureDefault();
        return this.toPayload(doc);
    }
    async getAdmin() {
        const doc = await this.ensureDefault();
        return doc;
    }
    async update(patch) {
        const { key, _id, ...rest } = patch;
        const doc = await this.model
            .findOneAndUpdate({ key: 'default' }, { $set: rest }, { new: true, upsert: true })
            .lean();
        return this.toPayload(doc);
    }
    toPayload(doc) {
        return {
            badgeText: doc.badgeText ?? contact_page_defaults_1.DEFAULT_CONTACT_PAGE.badgeText,
            headingPrefix: doc.headingPrefix ?? contact_page_defaults_1.DEFAULT_CONTACT_PAGE.headingPrefix,
            headingHighlight: doc.headingHighlight ?? contact_page_defaults_1.DEFAULT_CONTACT_PAGE.headingHighlight,
            headingSuffix: doc.headingSuffix ?? contact_page_defaults_1.DEFAULT_CONTACT_PAGE.headingSuffix,
            description: doc.description ?? contact_page_defaults_1.DEFAULT_CONTACT_PAGE.description,
            email: doc.email ?? contact_page_defaults_1.DEFAULT_CONTACT_PAGE.email,
            phone: doc.phone ?? contact_page_defaults_1.DEFAULT_CONTACT_PAGE.phone,
            office: doc.office ?? contact_page_defaults_1.DEFAULT_CONTACT_PAGE.office,
            responseTimeText: doc.responseTimeText ?? contact_page_defaults_1.DEFAULT_CONTACT_PAGE.responseTimeText,
            faqButtonLabel: doc.faqButtonLabel ?? contact_page_defaults_1.DEFAULT_CONTACT_PAGE.faqButtonLabel,
        };
    }
};
exports.ContactPageService = ContactPageService;
exports.ContactPageService = ContactPageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(contact_page_schema_1.ContactPage.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ContactPageService);
//# sourceMappingURL=contact-page.service.js.map