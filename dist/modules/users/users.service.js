"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./user.schema");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
const app_constants_1 = require("../../common/constants/app.constants");
const wallet_service_1 = require("../wallet/wallet.service");
let UsersService = class UsersService {
    constructor(userModel, walletService) {
        this.userModel = userModel;
        this.walletService = walletService;
    }
    async generateUniqueReferralCode() {
        for (let i = 0; i < 8; i++) {
            const code = (0, uuid_1.v4)().replace(/-/g, '').slice(0, 10).toUpperCase();
            const exists = await this.userModel.exists({ referralCode: code });
            if (!exists)
                return code;
        }
        throw new Error('Could not generate referral code');
    }
    async create(user) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const referralCode = await this.generateUniqueReferralCode();
        const payload = {
            name: user.name,
            email: user.email,
            password: hashedPassword,
            referralCode,
            role: app_constants_1.UserRole.USER,
            referredBy: user.referredBy ? new mongoose_2.Types.ObjectId(user.referredBy) : null,
            accountActive: user.accountActive !== undefined ? user.accountActive : true,
            age: user.age,
            dateOfBirth: user.dateOfBirth,
            phone: user.phone,
            planId: user.planId ? new mongoose_2.Types.ObjectId(user.planId) : null,
        };
        const created = new this.userModel(payload);
        const saved = await created.save();
        if (saved.referredBy) {
            await this.userModel.findByIdAndUpdate(saved.referredBy, {
                $inc: { totalReferralsCount: 1, directReferralsCount: 1 },
            });
        }
        await this.walletService.getOrCreate(saved._id.toString());
        return saved;
    }
    async createPlanBuyer(data) {
        return this.create({
            name: data.name,
            email: data.email,
            password: data.password,
            referredBy: new mongoose_2.Types.ObjectId(data.sellerId),
            accountActive: false,
            age: data.age,
            dateOfBirth: data.dateOfBirth,
            phone: data.phone,
            planId: data.planId,
        });
    }
    async activateAccount(userId, newPassword) {
        const hashed = await bcrypt.hash(newPassword, 10);
        return this.userModel
            .findByIdAndUpdate(userId, { accountActive: true, password: hashed }, { new: true })
            .exec();
    }
    async findByEmail(email, withPassword = false) {
        const q = this.userModel.findOne({ email: email.toLowerCase() });
        if (withPassword)
            q.select('+password');
        return q.exec();
    }
    async findByReferralCode(code) {
        return this.userModel.findOne({ referralCode: code?.toUpperCase() }).exec();
    }
    async validateReferralCodeForCheckout(code, buyerUserId) {
        const upper = code?.trim()?.toUpperCase();
        if (!upper)
            throw new common_1.BadRequestException('Enter a referral code');
        const owner = await this.findByReferralCode(upper);
        if (!owner) {
            throw new common_1.BadRequestException('Invalid referral code. Only promo codes assigned to registered members are accepted.');
        }
        if (!owner.accountActive) {
            throw new common_1.BadRequestException('This member referral code is not active yet.');
        }
        if (!owner.planId) {
            throw new common_1.BadRequestException('This referral code is not valid yet. The member must have an active plan.');
        }
        if (buyerUserId && owner._id.toString() === buyerUserId) {
            throw new common_1.BadRequestException('You cannot use your own referral code');
        }
        return { valid: true, code: upper, referrerName: owner.name };
    }
    async ensureReferralCode(userId) {
        const user = await this.userModel.findById(userId).select('referralCode').lean();
        if (user?.referralCode)
            return user.referralCode;
        const referralCode = await this.generateUniqueReferralCode();
        await this.userModel.findByIdAndUpdate(userId, { referralCode }).exec();
        return referralCode;
    }
    async findById(id) {
        return this.userModel.findById(id).select('-password').exec();
    }
    async updateProfileForSelfPlanPurchase(userId, data) {
        return this.userModel
            .findByIdAndUpdate(userId, {
            name: data.name,
            phone: data.phone,
            age: data.age,
            dateOfBirth: data.dateOfBirth,
            planId: new mongoose_2.Types.ObjectId(data.planId),
            accountActive: data.accountActive,
        }, { new: true })
            .exec();
    }
    async setLockedAffiliateCouponIfUnset(userId, code) {
        const upper = code?.trim?.()?.toUpperCase?.();
        if (!upper)
            return;
        await this.userModel
            .updateOne({
            _id: new mongoose_2.Types.ObjectId(userId),
            $or: [{ lockedAffiliateCoupon: { $exists: false } }, { lockedAffiliateCoupon: null }, { lockedAffiliateCoupon: '' }],
        }, { $set: { lockedAffiliateCoupon: upper } })
            .exec();
    }
    async updateRefreshTokenHash(userId, hash) {
        if (hash === null) {
            await this.userModel.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } }).exec();
        }
        else {
            await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash }).exec();
        }
    }
    async findWithRefreshHash(id) {
        return this.userModel.findById(id).select('+refreshTokenHash').exec();
    }
    async updateIncome(userId, active, passive, session) {
        await this.userModel
            .findByIdAndUpdate(userId, { $inc: { activeIncome: active, passiveIncome: passive } }, { session })
            .exec();
    }
    async getReferrals(userId) {
        return this.userModel.find({ referredBy: new mongoose_2.Types.ObjectId(userId) }).exec();
    }
    async listReferralTree(userId, depth = 3) {
        const root = await this.findById(userId);
        if (!root)
            throw new common_1.NotFoundException('User not found');
        const build = async (id, d) => {
            if (d <= 0)
                return { id, children: [] };
            const children = await this.userModel
                .find({ referredBy: new mongoose_2.Types.ObjectId(id) })
                .select('name email referralCode rank createdAt avatarUrl')
                .lean();
            const nested = await Promise.all(children.map(async (c) => {
                const childData = await build(c._id.toString(), d - 1);
                return { ...c, id: c._id.toString(), children: childData.children };
            }));
            return { id, children: nested };
        };
        const result = await build(userId, depth);
        return { ...root.toObject(), id: userId, children: result.children };
    }
    async adminList(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const filter = {};
        if (query.search) {
            filter.$or = [
                { name: new RegExp(query.search, 'i') },
                { email: new RegExp(query.search, 'i') },
                { referralCode: new RegExp(query.search, 'i') },
            ];
        }
        const [items, total] = await Promise.all([
            this.userModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            this.userModel.countDocuments(filter),
        ]);
        return { items, total, page, limit };
    }
    async adminBan(userId, banned) {
        return this.userModel.findByIdAndUpdate(userId, { isBanned: banned }, { new: true }).exec();
    }
    async adminVerifySeller(userId, verified) {
        return this.userModel.findByIdAndUpdate(userId, { isVerifiedSeller: verified }, { new: true }).exec();
    }
    async countTotal() {
        return this.userModel.countDocuments().exec();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        wallet_service_1.WalletService])
], UsersService);
//# sourceMappingURL=users.service.js.map