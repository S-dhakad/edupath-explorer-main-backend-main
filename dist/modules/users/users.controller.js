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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const multer_1 = require("multer");
const node_crypto_1 = require("node:crypto");
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const purchases_service_1 = require("../purchases/purchases.service");
const wallet_service_1 = require("../wallet/wallet.service");
const analytics_service_1 = require("../analytics/analytics.service");
const courses_service_1 = require("../courses/courses.service");
const app_constants_1 = require("../../common/constants/app.constants");
const course_mapper_1 = require("../public/course-mapper");
const plans_service_1 = require("../plans/plans.service");
const kyc_service_1 = require("../kyc/kyc.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const media_upload_service_1 = require("../storage/media-upload.service");
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
function avatarDiskStorage() {
    const uploadDir = process.env.MEDIA_UPLOAD_DIR || 'uploads';
    const dir = (0, node_path_1.join)(process.cwd(), uploadDir, 'avatars');
    return (0, multer_1.diskStorage)({
        destination: (_req, _file, cb) => {
            if (!(0, node_fs_1.existsSync)(dir))
                (0, node_fs_1.mkdirSync)(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (_req, file, cb) => {
            let ext = (file.originalname?.match(/\.[a-z0-9]+$/i)?.[0] || '').toLowerCase();
            if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
                ext = '.jpg';
            }
            cb(null, `${(0, node_crypto_1.randomUUID)()}${ext}`);
        },
    });
}
let UsersController = class UsersController {
    constructor(usersService, purchasesService, coursesService, config, walletService, analyticsService, plansService, kycService, mediaUpload) {
        this.usersService = usersService;
        this.purchasesService = purchasesService;
        this.coursesService = coursesService;
        this.config = config;
        this.walletService = walletService;
        this.analyticsService = analyticsService;
        this.plansService = plansService;
        this.kycService = kycService;
        this.mediaUpload = mediaUpload;
    }
    async getCourseCurriculum(req, slug) {
        const isAdmin = req.user.role === app_constants_1.UserRole.ADMIN;
        const course = isAdmin
            ? await this.coursesService.findBySlugAny(slug)
            : await this.coursesService.findBySlug(slug);
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (!course.isPublished && !isAdmin) {
            throw new common_1.NotFoundException('Course not found');
        }
        const userId = req.user._id.toString();
        const courseOid = course._id;
        if (!isAdmin) {
            const ok = await this.purchasesService.hasCourseAccess(userId, courseOid);
            if (!ok) {
                throw new common_1.ForbiddenException('Enroll in this course or activate a plan that includes it to unlock all lesson videos');
            }
        }
        const mediaBase = this.config.get('media.publicBase') || '';
        const legacyVideos = (course.videos || [])
            .filter((u) => typeof u === 'string' && u.trim())
            .map((u) => (0, course_mapper_1.resolveMediaUrl)(u, mediaBase))
            .filter(Boolean);
        return {
            slug: course.slug,
            title: course.title,
            courseId: courseOid.toString(),
            introVideoUrl: (0, course_mapper_1.resolveMediaUrl)(course.introVideoUrl, mediaBase),
            trailerUrl: (0, course_mapper_1.resolveMediaUrl)(course.trailerUrl, mediaBase),
            legacyVideos,
            modules: (0, course_mapper_1.mapCourseModulesForCurriculum)(course, mediaBase),
        };
    }
    async updateProfile(user, body, avatar, req) {
        const patch = {};
        if (body.name !== undefined)
            patch.name = body.name;
        if (body.phone !== undefined)
            patch.phone = body.phone;
        if (avatar && (avatar.filename || avatar.path || avatar.buffer)) {
            const saved = await this.mediaUpload.persist(avatar, 'avatars', req);
            patch.avatarUrl = saved.url;
        }
        if (!Object.keys(patch).length) {
            throw new common_1.BadRequestException('Nothing to update');
        }
        const updated = await this.usersService.updateProfileSelf(user._id.toString(), patch);
        if (!updated)
            throw new common_1.NotFoundException('User not found');
        return { user: updated };
    }
    async getDashboard(req) {
        const userId = req.user._id.toString();
        const user = await this.usersService.findById(userId);
        if (!user)
            return { error: 'User not found' };
        const [referrals, myPurchases, affiliateSales, wallet, summary, kycStatus] = await Promise.all([
            this.usersService.getReferrals(userId),
            this.purchasesService.findByUser(userId),
            user.referralCode ? this.purchasesService.findByCoupon(user.referralCode) : Promise.resolve([]),
            this.walletService.getOrCreate(userId),
            this.analyticsService.dashboardSummary(userId),
            this.kycService.getStatus(userId),
        ]);
        const conversionRate = referrals.length > 0 ? Math.min(100, (affiliateSales.length / referrals.length) * 100) : 0;
        const mediaBase = this.config.get('media.publicBase') || '';
        let planCourses = [];
        let planName = null;
        let activeMembership = null;
        if (user.accountActive && user.planId) {
            const planOid = user.planId;
            const plan = await this.plansService.findById(planOid.toString());
            planName = plan?.name ?? null;
            const courses = await this.plansService.findPublishedCoursesForMembership(planOid);
            planCourses = courses.map((c) => (0, course_mapper_1.mapCourseToExplorerDto)(c, 'General', mediaBase));
            if (plan) {
                activeMembership = {
                    planId: plan._id.toString(),
                    planName: plan.name,
                    tierId: plan.tierId,
                    courseCount: courses.length,
                };
            }
        }
        return {
            user,
            kycStatus: kycStatus?.status ?? 'NOT_SUBMITTED',
            activeMembership,
            referrals: referrals.length,
            referralList: referrals,
            myPurchases,
            planCourses,
            planName,
            affiliateSales,
            wallet,
            conversionRate: Math.round(conversionRate * 100) / 100,
            ...summary,
            totalIncome: (user.activeIncome || 0) + (user.passiveIncome || 0),
            activeIncome: user.activeIncome,
            passiveIncome: user.passiveIncome,
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('courses/:slug/curriculum'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCourseCurriculum", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', {
        storage: avatarDiskStorage(),
        limits: { fileSize: MAX_AVATAR_BYTES },
        fileFilter: (_req, file, cb) => {
            if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype)) {
                cb(new common_1.BadRequestException('Only JPEG, PNG, WebP, or GIF images are allowed'), false);
                return;
            }
            cb(null, true);
        },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getDashboard", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => purchases_service_1.PurchasesService))),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        purchases_service_1.PurchasesService,
        courses_service_1.CoursesService,
        config_1.ConfigService,
        wallet_service_1.WalletService,
        analytics_service_1.AnalyticsService,
        plans_service_1.PlansService,
        kyc_service_1.KycService,
        media_upload_service_1.MediaUploadService])
], UsersController);
//# sourceMappingURL=users.controller.js.map