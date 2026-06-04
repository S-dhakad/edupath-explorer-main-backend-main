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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const course_schema_1 = require("./course.schema");
let CoursesService = class CoursesService {
    constructor(courseModel) {
        this.courseModel = courseModel;
    }
    async create(course) {
        if (!course.slug && course.title) {
            course.slug = slugify(course.title);
        }
        const createdCourse = new this.courseModel(course);
        return createdCourse.save();
    }
    async findAll() {
        return this.courseModel.find({ isPublished: true }).sort({ createdAt: -1 }).exec();
    }
    async findAllAdmin() {
        return this.courseModel.find().sort({ createdAt: -1 }).exec();
    }
    async findById(id) {
        return this.courseModel.findById(id).exec();
    }
    async findPublishedByIds(ids) {
        if (!ids.length)
            return [];
        return this.courseModel
            .find({ _id: { $in: ids }, isPublished: true })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findBySlug(slug) {
        return this.courseModel.findOne({ slug: slug.toLowerCase(), isPublished: true }).exec();
    }
    async findBySlugAny(slug) {
        return this.courseModel.findOne({ slug: slug.toLowerCase() }).exec();
    }
    async findByUser(userId) {
        return this.courseModel
            .find({ uploadedBy: new mongoose_2.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    async update(id, patch) {
        const doc = await this.courseModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).exec();
        if (!doc)
            throw new common_1.NotFoundException('Course not found');
        return doc;
    }
    async remove(id) {
        const doc = await this.courseModel.findByIdAndDelete(id).exec();
        if (!doc)
            throw new common_1.NotFoundException('Course not found');
        return { deleted: true };
    }
    async incrementSales(courseId) {
        await this.courseModel.findByIdAndUpdate(courseId, { $inc: { salesCount: 1 } }).exec();
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(course_schema_1.Course.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CoursesService);
function slugify(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 80);
}
//# sourceMappingURL=courses.service.js.map