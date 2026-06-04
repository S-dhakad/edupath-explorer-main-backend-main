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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const multer_1 = require("multer");
const node_crypto_1 = require("node:crypto");
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const users_service_1 = require("../users/users.service");
const courses_service_1 = require("../courses/courses.service");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const commission_schema_1 = require("../commission/schemas/commission.schema");
const kyc_schema_1 = require("../kyc/schemas/kyc.schema");
const withdrawal_schema_1 = require("../withdrawals/withdrawal.schema");
const MAX_VIDEO_UPLOAD_BYTES = Math.min(2048 * 1024 * 1024, Math.max(16 * 1024 * 1024, (parseInt(process.env.MEDIA_MAX_VIDEO_MB || '512', 10) || 512) * 1024 * 1024));
function courseVideoDiskStorage() {
    const uploadDir = process.env.MEDIA_UPLOAD_DIR || 'uploads';
    const dir = (0, node_path_1.join)(process.cwd(), uploadDir, 'videos');
    return (0, multer_1.diskStorage)({
        destination: (_req, _file, cb) => {
            if (!(0, node_fs_1.existsSync)(dir))
                (0, node_fs_1.mkdirSync)(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (_req, file, cb) => {
            let ext = (file.originalname?.match(/\.[a-z0-9]+$/i)?.[0] || '').toLowerCase();
            if (!['.mp4', '.webm', '.mov', '.m4v', '.mkv'].includes(ext)) {
                ext = '.mp4';
            }
            cb(null, `${(0, node_crypto_1.randomUUID)()}${ext}`);
        },
    });
}
function generalMediaDiskStorage() {
    const uploadDir = process.env.MEDIA_UPLOAD_DIR || 'uploads';
    const dir = (0, node_path_1.join)(process.cwd(), uploadDir, 'media');
    return (0, multer_1.diskStorage)({
        destination: (_req, _file, cb) => {
            if (!(0, node_fs_1.existsSync)(dir))
                (0, node_fs_1.mkdirSync)(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (_req, file, cb) => {
            const ext = (file.originalname?.match(/\.[a-z0-9]+$/i)?.[0] || '').toLowerCase();
            cb(null, `${(0, node_crypto_1.randomUUID)()}${ext}`);
        },
    });
}
let AdminController = class AdminController {
    constructor(users, coursesService, config, commissionModel, kycModel, withdrawalModel) {
        this.users = users;
        this.coursesService = coursesService;
        this.config = config;
        this.commissionModel = commissionModel;
        this.kycModel = kycModel;
        this.withdrawalModel = withdrawalModel;
    }
    async stats() {
        const [users, courses, revenue, pendingKyc, pendingWithdrawals] = await Promise.all([
            this.users.countTotal(),
            this.coursesService.findAllAdmin().then((r) => r.length),
            this.commissionModel.aggregate([
                { $match: { incomeCategory: 'platform' } },
                { $group: { _id: null, t: { $sum: '$amount' } } },
            ]),
            this.kycModel.countDocuments({ status: 'PENDING' }),
            this.withdrawalModel.countDocuments({ status: 'PENDING' }),
        ]);
        return {
            totalUsers: users,
            totalCourses: courses,
            platformRevenue: revenue[0]?.t || 0,
            pendingKyc,
            pendingWithdrawals,
        };
    }
    listUsers(page, limit, search) {
        return this.users.adminList({
            page: parseInt(page || '1', 10),
            limit: parseInt(limit || '20', 10),
            search,
        });
    }
    ban(id, value) {
        return this.users.adminBan(id, value !== 'false');
    }
    verify(id, value) {
        return this.users.adminVerifySeller(id, value !== 'false');
    }
    referrals(id) {
        return this.users.listReferralTree(id, 5);
    }
    listCourses() {
        return this.coursesService.findAllAdmin();
    }
    async uploadCourseVideo(file, req) {
        if (!file?.path) {
            throw new common_1.BadRequestException('Missing file field "file"');
        }
        const name = (0, node_path_1.basename)(file.path);
        const relativePath = `/uploads/videos/${name}`;
        const configuredBase = (this.config.get('media.publicBase') || '').replace(/\/$/, '');
        const inferred = `${req.protocol}://${req.get('host') || 'localhost'}`;
        const origin = configuredBase || inferred;
        const url = `${origin.replace(/\/$/, '')}${relativePath}`;
        return { path: relativePath, url, filename: name, size: file.size };
    }
    async uploadMedia(file, req) {
        if (!file?.path) {
            throw new common_1.BadRequestException('Missing file field "file"');
        }
        const name = (0, node_path_1.basename)(file.path);
        const relativePath = `/uploads/media/${name}`;
        const configuredBase = (this.config.get('media.publicBase') || '').replace(/\/$/, '');
        const inferred = `${req.protocol}://${req.get('host') || 'localhost'}`;
        const origin = configuredBase || inferred;
        const url = `${origin.replace(/\/$/, '')}${relativePath}`;
        return { path: relativePath, url, filename: name, size: file.size };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/ban'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('value')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "ban", null);
__decorate([
    (0, common_1.Patch)('users/:id/verify-seller'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('value')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "verify", null);
__decorate([
    (0, common_1.Get)('users/:id/referrals'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "referrals", null);
__decorate([
    (0, common_1.Get)('courses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listCourses", null);
__decorate([
    (0, common_1.Post)('media/video'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
            required: ['file'],
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: courseVideoDiskStorage(),
        limits: { fileSize: MAX_VIDEO_UPLOAD_BYTES },
        fileFilter: (_req, file, cb) => {
            if (!file.mimetype.startsWith('video/')) {
                cb(new common_1.BadRequestException('Only video files are allowed (e.g. mp4, webm).'), false);
                return;
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "uploadCourseVideo", null);
__decorate([
    (0, common_1.Post)('media/upload'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
            required: ['file'],
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: generalMediaDiskStorage(),
        limits: { fileSize: MAX_VIDEO_UPLOAD_BYTES },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "uploadMedia", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(3, (0, mongoose_1.InjectModel)(commission_schema_1.Commission.name)),
    __param(4, (0, mongoose_1.InjectModel)(kyc_schema_1.Kyc.name)),
    __param(5, (0, mongoose_1.InjectModel)(withdrawal_schema_1.Withdrawal.name)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        courses_service_1.CoursesService,
        config_1.ConfigService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AdminController);
//# sourceMappingURL=admin.controller.js.map