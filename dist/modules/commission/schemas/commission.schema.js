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
exports.CommissionSchema = exports.Commission = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Commission = class Commission {
};
exports.Commission = Commission;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Purchase', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Commission.prototype, "purchaseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'PlanSale', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Commission.prototype, "planSaleId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Commission.prototype, "beneficiaryUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Commission.prototype, "beneficiaryRole", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['active', 'passive', 'platform'] }),
    __metadata("design:type", String)
], Commission.prototype, "incomeCategory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Commission.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'INR' }),
    __metadata("design:type", String)
], Commission.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Commission.prototype, "percentApplied", void 0);
exports.Commission = Commission = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'commissions' })
], Commission);
exports.CommissionSchema = mongoose_1.SchemaFactory.createForClass(Commission);
exports.CommissionSchema.index({ beneficiaryUserId: 1, createdAt: -1 });
exports.CommissionSchema.index({ purchaseId: 1 });
//# sourceMappingURL=commission.schema.js.map