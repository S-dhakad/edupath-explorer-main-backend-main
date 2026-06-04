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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const review_schema_1 = require("./review.schema");
let ReviewsService = class ReviewsService {
    constructor(model) {
        this.model = model;
    }
    create(userId, dto) {
        return this.model.create({
            userId: new mongoose_2.Types.ObjectId(userId),
            courseId: new mongoose_2.Types.ObjectId(dto.courseId),
            rating: dto.rating,
            comment: dto.comment,
        });
    }
    listByCourse(courseId) {
        return this.model.find({ courseId: new mongoose_2.Types.ObjectId(courseId) }).sort({ createdAt: -1 }).lean();
    }
    async listAll(query) {
        const { page = 1, limit = 20, courseId } = query;
        const filter = {};
        if (courseId)
            filter.courseId = new mongoose_2.Types.ObjectId(courseId);
        const [items, total] = await Promise.all([
            this.model
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('userId', 'name email avatarUrl')
                .populate('courseId', 'title slug')
                .lean(),
            this.model.countDocuments(filter),
        ]);
        return { items, total, page, limit };
    }
    async remove(id) {
        const d = await this.model.findByIdAndDelete(id).exec();
        if (!d)
            throw new common_1.NotFoundException();
        return { deleted: true };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(review_schema_1.Review.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map