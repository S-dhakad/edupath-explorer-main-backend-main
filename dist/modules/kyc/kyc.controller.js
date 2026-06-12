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
exports.KycController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const swagger_1 = require("@nestjs/swagger");
const kyc_service_1 = require("./kyc.service");
const media_upload_service_1 = require("../storage/media-upload.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const kyc_schema_1 = require("./schemas/kyc.schema");
function kycDiskStorage() {
    const dir = (0, path_1.join)(process.cwd(), process.env.MEDIA_UPLOAD_DIR || 'uploads', 'kyc');
    return (0, multer_1.diskStorage)({
        destination: (_req, _file, cb) => {
            if (!(0, fs_1.existsSync)(dir))
                (0, fs_1.mkdirSync)(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (_req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${file.fieldname}-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
        },
    });
}
let KycController = class KycController {
    constructor(svc, mediaUpload) {
        this.svc = svc;
        this.mediaUpload = mediaUpload;
    }
    async submit(user, body, files, req) {
        let aadharImage;
        let panImage;
        if (files.aadharImage?.[0]) {
            const saved = await this.mediaUpload.persist(files.aadharImage[0], 'kyc', req);
            aadharImage = saved.url;
        }
        if (files.panImage?.[0]) {
            const saved = await this.mediaUpload.persist(files.panImage[0], 'kyc', req);
            panImage = saved.url;
        }
        const data = { ...body, aadharImage, panImage };
        return this.svc.submit(user._id.toString(), data);
    }
    status(user) {
        return this.svc.getStatus(user._id.toString());
    }
    adminList(status, page, limit) {
        return this.svc.listAll({
            status,
            page: parseInt(page || '1', 10),
            limit: parseInt(limit || '20', 10),
        });
    }
    decide(id, body) {
        return this.svc.decide(id, body.approve, body.adminNote);
    }
};
exports.KycController = KycController;
__decorate([
    (0, common_1.Post)('submit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'aadharImage', maxCount: 1 },
        { name: 'panImage', maxCount: 1 },
    ], { storage: kycDiskStorage() })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KycController.prototype, "status", null);
__decorate([
    (0, common_1.Get)('admin/list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], KycController.prototype, "adminList", null);
__decorate([
    (0, common_1.Patch)('admin/decide/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], KycController.prototype, "decide", null);
exports.KycController = KycController = __decorate([
    (0, swagger_1.ApiTags)('kyc'),
    (0, common_1.Controller)('kyc'),
    __metadata("design:paramtypes", [kyc_service_1.KycService,
        media_upload_service_1.MediaUploadService])
], KycController);
//# sourceMappingURL=kyc.controller.js.map