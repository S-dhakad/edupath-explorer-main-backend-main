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
exports.TrainingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const training_schema_1 = require("./training.schema");
const trainings_defaults_1 = require("./trainings.defaults");
let TrainingsService = class TrainingsService {
    constructor(model) {
        this.model = model;
    }
    async ensureSeeded() {
        const count = await this.model.countDocuments().exec();
        if (count > 0)
            return;
        await this.model.insertMany(trainings_defaults_1.DEFAULT_TRAININGS);
    }
    async publicList() {
        await this.ensureSeeded();
        return this.model.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
    }
    async all() {
        await this.ensureSeeded();
        return this.model.find().sort({ order: 1, createdAt: 1 }).lean();
    }
    create(d) {
        return new this.model(d).save();
    }
    async update(id, patch) {
        const doc = await this.model.findByIdAndUpdate(id, { $set: patch }, { new: true }).exec();
        if (!doc)
            throw new common_1.NotFoundException('Training not found');
        return doc;
    }
    async remove(id) {
        const doc = await this.model.findByIdAndDelete(id).exec();
        if (!doc)
            throw new common_1.NotFoundException('Training not found');
        return { deleted: true };
    }
};
exports.TrainingsService = TrainingsService;
exports.TrainingsService = TrainingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(training_schema_1.Training.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TrainingsService);
//# sourceMappingURL=trainings.service.js.map