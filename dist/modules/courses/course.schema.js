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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseSchema = exports.Course = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const LessonSubSchema = {
    title: { type: String, required: true },
    slug: { type: String },
    videoUrl: { type: String },
    durationSec: { type: Number, default: 0 },
    freePreview: { type: Boolean, default: false },
    notes: { type: String },
    order: { type: Number, default: 0 },
};
const ModuleSubSchema = {
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    lessons: { type: [LessonSubSchema], default: [] },
};
let Course = class Course {
};
exports.Course = Course;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Course.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true }),
    __metadata("design:type", String)
], Course.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Course.prototype, "shortDescription", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Course.prototype, "fullDescription", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Course.prototype, "highlights", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Course.prototype, "requirements", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Course.prototype, "benefits", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Course.prototype, "language", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Category', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Course.prototype, "categoryId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Category', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Course.prototype, "subcategoryId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Course.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "originalPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "discountPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "offerPercent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Course.prototype, "couponApplicable", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Course.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Course.prototype, "bannerUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Course.prototype, "introVideoUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Course.prototype, "previewVideoUrls", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Course.prototype, "trailerUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Course.prototype, "pdfAttachmentUrls", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [ModuleSubSchema], default: [] }),
    __metadata("design:type", Array)
], Course.prototype, "modules", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Course.prototype, "instructorName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Course.prototype, "instructorBio", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Course.prototype, "instructorSocial", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Course.prototype, "instructorImageUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Course.prototype, "metaTitle", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Course.prototype, "metaDescription", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Course.prototype, "keywords", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Course.prototype, "videos", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Course.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Course.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Course.prototype, "uploadedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Course.prototype, "isPublished", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "salesCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "ratingAvg", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "ratingCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Course.prototype, "featuredOnHero", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "heroOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Intermediate' }),
    __metadata("design:type", String)
], Course.prototype, "level", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Course.prototype, "durationLabel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "lessonCount", void 0);
exports.Course = Course = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'courses' })
], Course);
exports.CourseSchema = mongoose_1.SchemaFactory.createForClass(Course);
exports.CourseSchema.index({ title: 'text', shortDescription: 'text', tags: 'text' });
exports.CourseSchema.index({ categoryId: 1, isPublished: 1 });
exports.CourseSchema.index({ featuredOnHero: 1, heroOrder: 1, isPublished: 1 });
//# sourceMappingURL=course.schema.js.map