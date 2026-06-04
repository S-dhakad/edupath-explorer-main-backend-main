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
exports.WatchingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const watching_service_1 = require("./watching.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let WatchingController = class WatchingController {
    constructor(watchingService) {
        this.watchingService = watchingService;
    }
    async record(body, req) {
        return this.watchingService.recordWatch(req.user._id.toString(), body.courseId, body.videoIndex, {
            lessonKey: body.lessonKey,
            lastPositionSec: body.lastPositionSec,
            progressPercent: body.progressPercent,
            completed: body.completed,
        });
    }
    async getHistory(req) {
        return this.watchingService.getHistory(req.user._id.toString());
    }
};
exports.WatchingController = WatchingController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WatchingController.prototype, "record", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WatchingController.prototype, "getHistory", null);
exports.WatchingController = WatchingController = __decorate([
    (0, swagger_1.ApiTags)('watching'),
    (0, common_1.Controller)('watching'),
    __metadata("design:paramtypes", [watching_service_1.WatchingService])
], WatchingController);
//# sourceMappingURL=watching.controller.js.map