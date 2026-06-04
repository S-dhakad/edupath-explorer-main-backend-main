import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlatformSettings, PlatformSettingsDocument } from './schemas/platform-settings.schema';
import {
  DEFAULT_COUPON_OWNER_PCT,
  DEFAULT_DIRECT_PARENT_PCT,
  DEFAULT_MEMBER_PROMO_BUYER_DISCOUNT_PCT,
  DEFAULT_PLATFORM_PCT,
} from '../../common/constants/app.constants';

@Injectable()
export class SettingsRepository {
  constructor(
    @InjectModel(PlatformSettings.name)
    private readonly model: Model<PlatformSettingsDocument>,
  ) {}

  async getGlobal(): Promise<PlatformSettingsDocument> {
    let doc = await this.model.findOne({ key: 'global' }).exec();
    if (!doc) {
      doc = await this.model.create({
        key: 'global',
        couponOwnerPercent: DEFAULT_COUPON_OWNER_PCT,
        platformPercent: DEFAULT_PLATFORM_PCT,
        directParentPercent: DEFAULT_DIRECT_PARENT_PCT,
        memberPromoBuyerDiscountPercent: DEFAULT_MEMBER_PROMO_BUYER_DISCOUNT_PCT,
      });
    }
    return doc;
  }

  async updateGlobal(patch: Partial<PlatformSettings>): Promise<PlatformSettingsDocument> {
    return this.model
      .findOneAndUpdate({ key: 'global' }, { $set: patch }, { new: true, upsert: true })
      .exec();
  }
}
