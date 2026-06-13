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
exports.AdminDecideWithdrawalDto = exports.ADMIN_MANUAL_PAYOUT_METHODS = void 0;
const class_validator_1 = require("class-validator");
exports.ADMIN_MANUAL_PAYOUT_METHODS = [
    'cash',
    'upi',
    'bank_transfer',
    'card',
    'other',
];
class AdminDecideWithdrawalDto {
}
exports.AdminDecideWithdrawalDto = AdminDecideWithdrawalDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminDecideWithdrawalDto.prototype, "approve", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminDecideWithdrawalDto.prototype, "adminNote", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['manual', 'razorpayx']),
    __metadata("design:type", String)
], AdminDecideWithdrawalDto.prototype, "payoutMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([...exports.ADMIN_MANUAL_PAYOUT_METHODS]),
    __metadata("design:type", String)
], AdminDecideWithdrawalDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminDecideWithdrawalDto.prototype, "paymentReference", void 0);
//# sourceMappingURL=admin-decide-withdrawal.dto.js.map