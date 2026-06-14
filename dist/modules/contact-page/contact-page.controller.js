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
exports.ContactPageController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const contact_page_service_1 = require("./contact-page.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const submit_contact_inquiry_dto_1 = require("./dto/submit-contact-inquiry.dto");
let ContactPageController = class ContactPageController {
    constructor(svc) {
        this.svc = svc;
    }
    publicGet() {
        return this.svc.getPublic();
    }
    submitInquiry(body) {
        return this.svc.submitInquiry(body);
    }
    adminListInquiries(page, limit) {
        return this.svc.listInquiries({
            page: parseInt(page || '1', 10),
            limit: parseInt(limit || '20', 10),
        });
    }
    adminDeleteInquiry(id) {
        return this.svc.deleteInquiry(id);
    }
    adminGet() {
        return this.svc.getAdmin();
    }
    adminPatch(body) {
        return this.svc.update(body);
    }
};
exports.ContactPageController = ContactPageController;
__decorate([
    (0, common_1.Get)('public/contact-page'),
    (0, throttler_1.SkipThrottle)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContactPageController.prototype, "publicGet", null);
__decorate([
    (0, common_1.Post)('public/contact-inquiry'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_contact_inquiry_dto_1.SubmitContactInquiryDto]),
    __metadata("design:returntype", void 0)
], ContactPageController.prototype, "submitInquiry", null);
__decorate([
    (0, common_1.Get)('admin/contact-inquiries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ContactPageController.prototype, "adminListInquiries", null);
__decorate([
    (0, common_1.Delete)('admin/contact-inquiries/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContactPageController.prototype, "adminDeleteInquiry", null);
__decorate([
    (0, common_1.Get)('admin/contact-page'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContactPageController.prototype, "adminGet", null);
__decorate([
    (0, common_1.Patch)('admin/contact-page'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContactPageController.prototype, "adminPatch", null);
exports.ContactPageController = ContactPageController = __decorate([
    (0, swagger_1.ApiTags)('contact-page'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [contact_page_service_1.ContactPageService])
], ContactPageController);
//# sourceMappingURL=contact-page.controller.js.map