import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Kyc, KycDocument, KycStatus } from './schemas/kyc.schema';

@Injectable()
export class KycService {
  constructor(
    @InjectModel(Kyc.name) private readonly kycModel: Model<KycDocument>,
  ) {}

  async submit(userId: string, data: Partial<Kyc>) {
    const uid = new Types.ObjectId(userId);
    const existing = await this.kycModel.findOne({ userId: uid });
    if (existing && existing.status === KycStatus.APPROVED) {
      throw new BadRequestException('KYC already approved');
    }

    if (existing) {
      return this.kycModel.findByIdAndUpdate(
        existing._id,
        { ...data, status: KycStatus.PENDING },
        { new: true },
      );
    }

    const created = new this.kycModel({ ...data, userId: uid });
    return created.save();
  }

  async getStatus(userId: string) {
    const kyc = await this.kycModel.findOne({ userId: new Types.ObjectId(userId) }).lean();
    if (!kyc) return { status: 'NOT_SUBMITTED' };
    return kyc;
  }

  async isApproved(userId: string): Promise<boolean> {
    const kyc = await this.kycModel
      .findOne({ userId: new Types.ObjectId(userId), status: KycStatus.APPROVED })
      .select('_id')
      .lean();
    return Boolean(kyc);
  }

  /** Bank payout details from approved KYC (used for withdrawals). */
  async getApprovedPayoutDetails(userId: string) {
    const kyc = await this.kycModel
      .findOne({ userId: new Types.ObjectId(userId), status: KycStatus.APPROVED })
      .lean();
    if (!kyc) {
      throw new BadRequestException('KYC must be approved before you can withdraw');
    }
    if (!kyc.bankName || !kyc.accountNumber || !kyc.ifscCode || !kyc.accountHolderName) {
      throw new BadRequestException('Complete bank details in KYC before withdrawing');
    }
    return {
      method: 'bank' as const,
      accountHolderName: kyc.accountHolderName,
      bankName: kyc.bankName,
      accountNumber: kyc.accountNumber,
      ifscCode: kyc.ifscCode,
      razorpayContactId: kyc.razorpayContactId,
      razorpayFundAccountId: kyc.razorpayFundAccountId,
    };
  }

  async saveRazorpayIds(userId: string, contactId: string, fundAccountId: string) {
    await this.kycModel.updateOne(
      { userId: new Types.ObjectId(userId) },
      { razorpayContactId: contactId, razorpayFundAccountId: fundAccountId },
    );
  }

  async listAll(query: { status?: KycStatus; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = query;
    const filter: any = {};
    if (status) filter.status = status;

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

  async decide(id: string, approve: boolean, adminNote?: string) {
    const kyc = await this.kycModel.findById(id);
    if (!kyc) throw new NotFoundException('KYC record not found');

    kyc.status = approve ? KycStatus.APPROVED : KycStatus.REJECTED;
    if (adminNote) kyc.adminNote = adminNote;
    
    return kyc.save();
  }
}
