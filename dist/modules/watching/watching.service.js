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
exports.WatchingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const watching_schema_1 = require("./watching.schema");
let WatchingService = class WatchingService {
    constructor(watchingModel) {
        this.watchingModel = watchingModel;
    }
    async recordWatch(userId, courseId, videoIndex, extra) {
        const uid = new mongoose_2.Types.ObjectId(userId);
        const cid = new mongoose_2.Types.ObjectId(courseId);
        const lessonKey = extra?.lessonKey ?? `v${videoIndex}`;
        return this.watchingModel
            .findOneAndUpdate({ userId: uid, courseId: cid, lessonKey }, {
            $set: {
                videoIndex,
                lessonKey,
                lastPositionSec: extra?.lastPositionSec ?? 0,
                progressPercent: extra?.progressPercent ?? 0,
                completed: extra?.completed ?? false,
                watchedAt: new Date(),
            },
        }, { upsert: true, new: true })
            .exec();
    }
    async getHistory(userId) {
        return this.watchingModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .sort({ watchedAt: -1 })
            .exec();
    }
};
exports.WatchingService = WatchingService;
exports.WatchingService = WatchingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(watching_schema_1.Watching.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], WatchingService);
//# sourceMappingURL=watching.service.js.map