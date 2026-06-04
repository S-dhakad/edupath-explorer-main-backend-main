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
exports.CreatePlanSaleDto = void 0;
const class_validator_1 = require("class-validator");
class CreatePlanSaleDto {
}
exports.CreatePlanSaleDto = CreatePlanSaleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreatePlanSaleDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreatePlanSaleDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePlanSaleDto.prototype, "age", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlanSaleDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], CreatePlanSaleDto.prototype, "contactNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlanSaleDto.prototype, "promoCode", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreatePlanSaleDto.prototype, "planId", void 0);
//# sourceMappingURL=create-plan-sale.dto.js.map