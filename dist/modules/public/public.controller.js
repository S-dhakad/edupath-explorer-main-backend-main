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
exports.LandingAdminController = exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const public_service_1 = require("./public.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const patch_landing_pricing_dto_1 = require("./dto/patch-landing-pricing.dto");
let PublicController = class PublicController {
    constructor(publicService, usersService) {
        this.publicService = publicService;
        this.usersService = usersService;
    }
    hero() {
        return this.publicService.getHeroPayload();
    }
    listCourses() {
        return this.publicService.listPublishedCoursesExplorer();
    }
    courseBySlug(slug) {
        return this.publicService.getCourseBySlug(slug);
    }
    pricingPlans() {
        return this.publicService.getPricingPlansPayload();
    }
    validateReferral(body) {
        return this.usersService.validateReferralCodeForCheckout(body.code);
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)('hero'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "hero", null);
__decorate([
    (0, common_1.Get)('courses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "listCourses", null);
__decorate([
    (0, common_1.Get)('courses/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "courseBySlug", null);
__decorate([
    (0, common_1.Get)('pricing-plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "pricingPlans", null);
__decorate([
    (0, common_1.Post)('validate-referral'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "validateReferral", null);
exports.PublicController = PublicController = __decorate([
    (0, swagger_1.ApiTags)('public'),
    (0, common_1.Controller)('public'),
    (0, throttler_1.SkipThrottle)(),
    __metadata("design:paramtypes", [public_service_1.PublicService,
        users_service_1.UsersService])
], PublicController);
let LandingAdminController = class LandingAdminController {
    constructor(publicService) {
        this.publicService = publicService;
    }
    getPricing() {
        return this.publicService.getPricingPlansPayload();
    }
    patchHero(body) {
        return this.publicService.updateLandingHero(body);
    }
    patchPricing(body) {
        return this.publicService.updateLandingPricing(body);
    }
};
exports.LandingAdminController = LandingAdminController;
__decorate([
    (0, common_1.Get)('pricing'),
    (0, swagger_1.ApiOkResponse)({ description: 'Tiers (features = plan benefits) + compareRows for /plans table' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LandingAdminController.prototype, "getPricing", null);
__decorate([
    (0, common_1.Patch)('hero'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LandingAdminController.prototype, "patchHero", null);
__decorate([
    (0, common_1.Patch)('pricing'),
    (0, swagger_1.ApiBody)({ type: patch_landing_pricing_dto_1.PatchLandingPricingDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [patch_landing_pricing_dto_1.PatchLandingPricingDto]),
    __metadata("design:returntype", void 0)
], LandingAdminController.prototype, "patchPricing", null);
exports.LandingAdminController = LandingAdminController = __decorate([
    (0, swagger_1.ApiTags)('admin-landing'),
    (0, common_1.Controller)('admin/landing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [public_service_1.PublicService])
], LandingAdminController);
//# sourceMappingURL=public.controller.js.map