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
exports.KycService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const kyc_schema_1 = require("./schemas/kyc.schema");
let KycService = class KycService {
    constructor(kycModel) {
        this.kycModel = kycModel;
    }
    async submit(userId, data) {
        const uid = new mongoose_2.Types.ObjectId(userId);
        const existing = await this.kycModel.findOne({ userId: uid });
        if (existing && existing.status === kyc_schema_1.KycStatus.APPROVED) {
            throw new common_1.BadRequestException('KYC already approved');
        }
        if (existing) {
            return this.kycModel.findByIdAndUpdate(existing._id, { ...data, status: kyc_schema_1.KycStatus.PENDING }, { new: true });
        }
        const created = new this.kycModel({ ...data, userId: uid });
        return created.save();
    }
    async getStatus(userId) {
        const kyc = await this.kycModel.findOne({ userId: new mongoose_2.Types.ObjectId(userId) }).lean();
        if (!kyc)
            return { status: 'NOT_SUBMITTED' };
        return kyc;
    }
    async isApproved(userId) {
        const kyc = await this.kycModel
            .findOne({ userId: new mongoose_2.Types.ObjectId(userId), status: kyc_schema_1.KycStatus.APPROVED })
            .select('_id')
            .lean();
        return Boolean(kyc);
    }
    async getApprovedPayoutDetails(userId) {
        const kyc = await this.kycModel
            .findOne({ userId: new mongoose_2.Types.ObjectId(userId), status: kyc_schema_1.KycStatus.APPROVED })
            .lean();
        if (!kyc) {
            throw new common_1.BadRequestException('KYC must be approved before you can withdraw');
        }
        if (!kyc.bankName || !kyc.accountNumber || !kyc.ifscCode || !kyc.accountHolderName) {
            throw new common_1.BadRequestException('Complete bank details in KYC before withdrawing');
        }
        return {
            method: 'bank',
            accountHolderName: kyc.accountHolderName,
            bankName: kyc.bankName,
            accountNumber: kyc.accountNumber,
            ifscCode: kyc.ifscCode,
            razorpayContactId: kyc.razorpayContactId,
            razorpayFundAccountId: kyc.razorpayFundAccountId,
        };
    }
    async saveRazorpayIds(userId, contactId, fundAccountId) {
        await this.kycModel.updateOne({ userId: new mongoose_2.Types.ObjectId(userId) }, { razorpayContactId: contactId, razorpayFundAccountId: fundAccountId });
    }
    async listAll(query) {
        const { status, page = 1, limit = 20 } = query;
        const filter = {};
        if (status)
            filter.status = status;
        const [items, total] = await Promise.all([
            this.kycModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('userId', 'name email'),
            this.kycModel.countDocuments(filter),
        ]);
        return { items, total, page, limit };
    }
    async decide(id, approve, adminNote) {
        const kyc = await this.kycModel.findById(id);
        if (!kyc)
            throw new common_1.NotFoundException('KYC record not found');
        kyc.status = approve ? kyc_schema_1.KycStatus.APPROVED : kyc_schema_1.KycStatus.REJECTED;
        if (adminNote)
            kyc.adminNote = adminNote;
        return kyc.save();
    }
};
exports.KycService = KycService;
exports.KycService = KycService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(kyc_schema_1.Kyc.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], KycService);
//# sourceMappingURL=kyc.service.js.map