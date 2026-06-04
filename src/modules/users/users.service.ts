import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../common/constants/app.constants';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly walletService: WalletService,
  ) {}

  private async generateUniqueReferralCode(): Promise<string> {
    for (let i = 0; i < 8; i++) {
      const code = uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase();
      const exists = await this.userModel.exists({ referralCode: code });
      if (!exists) return code;
    }
    throw new Error('Could not generate referral code');
  }

  async create(user: Partial<User> & { password: string }): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const referralCode = await this.generateUniqueReferralCode();
    const payload: Partial<User> = {
      name: user.name,
      email: user.email,
      password: hashedPassword,
      referralCode,
      role: UserRole.USER,
      referredBy: user.referredBy ? new Types.ObjectId(user.referredBy as any) : null,
      accountActive: user.accountActive !== undefined ? user.accountActive : true,
      age: user.age,
      dateOfBirth: user.dateOfBirth,
      phone: user.phone,
      planId: user.planId ? new Types.ObjectId(user.planId as any) : null,
    };
    const created = new this.userModel(payload);
    const saved = await created.save();
    if (saved.referredBy) {
      await this.userModel.findByIdAndUpdate(saved.referredBy, {
        $inc: { totalReferralsCount: 1, directReferralsCount: 1 },
      });
    }
    await this.walletService.getOrCreate((saved as any)._id.toString());
    return saved;
  }

  /** Plan sale: inactive account until admin confirms payment. */
  async createPlanBuyer(data: {
    name: string;
    email: string;
    password: string;
    sellerId: string;
    planId: string;
    age: number;
    dateOfBirth: Date;
    phone: string;
  }): Promise<UserDocument> {
    return this.create({
      name: data.name,
      email: data.email,
      password: data.password,
      referredBy: new Types.ObjectId(data.sellerId),
      accountActive: false,
      age: data.age,
      dateOfBirth: data.dateOfBirth,
      phone: data.phone,
      planId: data.planId as any,
    });
  }

  async activateAccount(userId: string, newPassword: string): Promise<UserDocument | null> {
    const hashed = await bcrypt.hash(newPassword, 10);
    return this.userModel
      .findByIdAndUpdate(userId, { accountActive: true, password: hashed }, { new: true })
      .exec();
  }

  async findByEmail(email: string, withPassword = false): Promise<UserDocument | null> {
    const q = this.userModel.findOne({ email: email.toLowerCase() });
    if (withPassword) q.select('+password');
    return q.exec();
  }

  async findByReferralCode(code: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ referralCode: code?.toUpperCase() }).exec();
  }

  /** Checkout: only codes issued to registered members at signup. */
  async validateReferralCodeForCheckout(code: string, buyerUserId?: string) {
    const upper = code?.trim()?.toUpperCase();
    if (!upper) throw new BadRequestException('Enter a referral code');
    const owner = await this.findByReferralCode(upper);
    if (!owner) {
      throw new BadRequestException(
        'Invalid referral code. Only promo codes assigned to registered members are accepted.',
      );
    }
    if (!owner.accountActive) {
      throw new BadRequestException('This member referral code is not active yet.');
    }
    if (!(owner as any).planId) {
      throw new BadRequestException(
        'This referral code is not valid yet. The member must have an active plan.',
      );
    }
    if (buyerUserId && (owner as any)._id.toString() === buyerUserId) {
      throw new BadRequestException('You cannot use your own referral code');
    }
    return { valid: true as const, code: upper, referrerName: owner.name };
  }

  async ensureReferralCode(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId).select('referralCode').lean();
    if ((user as any)?.referralCode) return (user as any).referralCode;
    const referralCode = await this.generateUniqueReferralCode();
    await this.userModel.findByIdAndUpdate(userId, { referralCode }).exec();
    return referralCode;
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  /** Set once when user first earns attribution (signup ref or first purchase with coupon). */
  async updateProfileForSelfPlanPurchase(
    userId: string,
    data: {
      name: string;
      phone: string;
      age: number;
      dateOfBirth: Date;
      planId: string;
      accountActive: boolean;
    },
  ) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          name: data.name,
          phone: data.phone,
          age: data.age,
          dateOfBirth: data.dateOfBirth,
          planId: new Types.ObjectId(data.planId),
          accountActive: data.accountActive,
        },
        { new: true },
      )
      .exec();
  }

  async setLockedAffiliateCouponIfUnset(userId: string, code: string): Promise<void> {
    const upper = code?.trim?.()?.toUpperCase?.();
    if (!upper) return;
    await this.userModel
      .updateOne(
        {
          _id: new Types.ObjectId(userId),
          $or: [{ lockedAffiliateCoupon: { $exists: false } }, { lockedAffiliateCoupon: null }, { lockedAffiliateCoupon: '' }],
        },
        { $set: { lockedAffiliateCoupon: upper } },
      )
      .exec();
  }

  async updateRefreshTokenHash(userId: string, hash: string | null) {
    if (hash === null) {
      await this.userModel.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } }).exec();
    } else {
      await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash }).exec();
    }
  }

  async findWithRefreshHash(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+refreshTokenHash').exec();
  }

  async updateIncome(
    userId: string,
    active: number,
    passive: number,
    session?: any,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(
        userId,
        { $inc: { activeIncome: active, passiveIncome: passive } },
        { session },
      )
      .exec();
  }

  async getReferrals(userId: string): Promise<UserDocument[]> {
    return this.userModel.find({ referredBy: new Types.ObjectId(userId) }).exec();
  }

  async listReferralTree(userId: string, depth = 3): Promise<any> {
    const root = await this.findById(userId);
    if (!root) throw new NotFoundException('User not found');
    const build = async (id: string, d: number): Promise<any> => {
      if (d <= 0) return { id, children: [] };
      const children = await this.userModel
        .find({ referredBy: new Types.ObjectId(id) })
        .select('name email referralCode rank createdAt avatarUrl')
        .lean();
      const nested = await Promise.all(
        children.map(async (c: any) => {
          const childData = await build(c._id.toString(), d - 1);
          return { ...c, id: c._id.toString(), children: childData.children };
        }),
      );
      return { id, children: nested };
    };
    const result = await build(userId, depth);
    return { ...root.toObject(), id: userId, children: result.children };
  }

  async adminList(query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filter: any = {};
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

  async adminBan(userId: string, banned: boolean) {
    return this.userModel.findByIdAndUpdate(userId, { isBanned: banned }, { new: true }).exec();
  }

  async adminVerifySeller(userId: string, verified: boolean) {
    return this.userModel.findByIdAndUpdate(userId, { isVerifiedSeller: verified }, { new: true }).exec();
  }

  async countTotal() {
    return this.userModel.countDocuments().exec();
  }
}
