import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Commission, CommissionDocument } from '../commission/schemas/commission.schema';
import { Purchase, PurchaseDocument } from '../purchases/purchase.schema';
import { User, UserDocument } from '../users/user.schema';
import { PaymentStatus } from '../../common/constants/app.constants';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Commission.name) private commissionModel: Model<CommissionDocument>,
    @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async earningsSeries(userId: string, granularity: 'day' | 'week' | 'month' = 'day', days = 30) {
    const uid = new Types.ObjectId(userId);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const format = granularity === 'month' ? '%Y-%m' : '%Y-%m-%d';
    return this.commissionModel.aggregate([
      {
        $match: {
          beneficiaryUserId: uid,
          incomeCategory: { $in: ['active', 'passive'] },
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          active: {
            $sum: { $cond: [{ $eq: ['$incomeCategory', 'active'] }, '$amount', 0] },
          },
          passive: {
            $sum: { $cond: [{ $eq: ['$incomeCategory', 'passive'] }, '$amount', 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async dashboardSummary(userId: string) {
    const uid = new Types.ObjectId(userId);
    const sinceDay = new Date();
    sinceDay.setHours(0, 0, 0, 0);
    const sinceWeek = new Date();
    sinceWeek.setDate(sinceWeek.getDate() - 7);
    const sinceMonth = new Date();
    sinceMonth.setMonth(sinceMonth.getMonth() - 1);

    const u = await this.userModel.findById(userId).select('referralCode').lean();
    const code = (u as any)?.referralCode;

    const [totals, daySum, weekSum, monthSum, salesCount] = await Promise.all([
      this.commissionModel.aggregate([
        { $match: { beneficiaryUserId: uid, incomeCategory: { $in: ['active', 'passive'] } } },
        {
          $group: {
            _id: null,
            active: { $sum: { $cond: [{ $eq: ['$incomeCategory', 'active'] }, '$amount', 0] } },
            passive: { $sum: { $cond: [{ $eq: ['$incomeCategory', 'passive'] }, '$amount', 0] } },
          },
        },
      ]),
      this.commissionModel.aggregate([
        {
          $match: {
            beneficiaryUserId: uid,
            incomeCategory: { $in: ['active', 'passive'] },
            createdAt: { $gte: sinceDay },
          },
        },
        { $group: { _id: null, t: { $sum: '$amount' } } },
      ]),
      this.commissionModel.aggregate([
        {
          $match: {
            beneficiaryUserId: uid,
            incomeCategory: { $in: ['active', 'passive'] },
            createdAt: { $gte: sinceWeek },
          },
        },
        { $group: { _id: null, t: { $sum: '$amount' } } },
      ]),
      this.commissionModel.aggregate([
        {
          $match: {
            beneficiaryUserId: uid,
            incomeCategory: { $in: ['active', 'passive'] },
            createdAt: { $gte: sinceMonth },
          },
        },
        { $group: { _id: null, t: { $sum: '$amount' } } },
      ]),
      code
        ? this.purchaseModel.countDocuments({
            couponUsed: code,
            paymentStatus: PaymentStatus.COMPLETED,
          })
        : Promise.resolve(0),
    ]);

    const t = totals[0] || { active: 0, passive: 0 };
    return {
      totalActive: t.active,
      totalPassive: t.passive,
      lifetimeEarnings: t.active + t.passive,
      todayIncome: daySum[0]?.t || 0,
      weeklyIncome: weekSum[0]?.t || 0,
      monthlyIncome: monthSum[0]?.t || 0,
      totalCourseSales: salesCount,
    };
  }

  private periodStart(period: 'daily' | 'weekly' | 'monthly' | 'overall'): Date | null {
    if (period === 'overall') return null;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (period === 'weekly') {
      const day = d.getDay();
      const diff = day === 0 ? 6 : day - 1;
      d.setDate(d.getDate() - diff);
    } else if (period === 'monthly') {
      d.setDate(1);
    }
    return d;
  }

  async leaderboard(period: 'daily' | 'weekly' | 'monthly' | 'overall', limit = 10) {
    const since = this.periodStart(period);
    if (period === 'overall') {
      const users = await this.userModel
        .find({ role: 'user', $or: [{ activeIncome: { $gt: 0 } }, { passiveIncome: { $gt: 0 } }] })
        .select('name email avatarUrl activeIncome passiveIncome')
        .sort({ activeIncome: -1, passiveIncome: -1 })
        .limit(limit)
        .lean();
      return users.map((u: any, i) => ({
        rank: i + 1,
        userId: u._id.toString(),
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl,
        activeIncome: u.activeIncome || 0,
        passiveIncome: u.passiveIncome || 0,
        totalEarnings: (u.activeIncome || 0) + (u.passiveIncome || 0),
      }));
    }

    const match: Record<string, unknown> = {
      beneficiaryUserId: { $ne: null },
      incomeCategory: { $in: ['active', 'passive'] },
    };
    if (since) match.createdAt = { $gte: since };

    const rows = await this.commissionModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$beneficiaryUserId',
          active: { $sum: { $cond: [{ $eq: ['$incomeCategory', 'active'] }, '$amount', 0] } },
          passive: { $sum: { $cond: [{ $eq: ['$incomeCategory', 'passive'] }, '$amount', 0] } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
      { $limit: limit },
    ]);

    const ids = rows.map((r) => r._id);
    const users = await this.userModel
      .find({ _id: { $in: ids } })
      .select('name email avatarUrl activeIncome passiveIncome')
      .lean();
    const byId = new Map(users.map((u: any) => [u._id.toString(), u]));

    return rows.map((r, i) => {
      const u = byId.get(r._id.toString()) || {};
      return {
        rank: i + 1,
        userId: r._id.toString(),
        name: (u as any).name || 'User',
        email: (u as any).email,
        avatarUrl: (u as any).avatarUrl,
        activeIncome: r.active,
        passiveIncome: r.passive,
        totalEarnings: r.total,
      };
    });
  }

  async incomeUsersList(query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const filter: Record<string, unknown> = { role: 'user' };
    if (query.search) {
      const re = new RegExp(query.search, 'i');
      filter.$or = [{ name: re }, { email: re }, { referralCode: re }];
    }
    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('name email avatarUrl activeIncome passiveIncome referralCode rank createdAt accountActive')
        .sort({ activeIncome: -1, passiveIncome: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);
    return {
      items: items.map((u: any) => ({
        ...u,
        id: u._id.toString(),
        totalIncome: (u.activeIncome || 0) + (u.passiveIncome || 0),
      })),
      total,
      page,
      limit,
    };
  }
}
