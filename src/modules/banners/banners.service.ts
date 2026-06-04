import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from './banner.schema';

@Injectable()
export class BannersService {
  constructor(@InjectModel(Banner.name) private model: Model<BannerDocument>) {}

  create(d: Partial<Banner>) {
    return new this.model(d).save();
  }

  active() {
    return this.model.find({ active: true }).sort({ order: 1 }).lean();
  }

  all() {
    return this.model.find().sort({ order: 1 }).lean();
  }

  async update(id: string, patch: Partial<Banner>) {
    const d = await this.model.findByIdAndUpdate(id, { $set: patch }, { new: true }).exec();
    if (!d) throw new NotFoundException();
    return d;
  }

  async remove(id: string) {
    const d = await this.model.findByIdAndDelete(id).exec();
    if (!d) throw new NotFoundException();
    return { deleted: true };
  }
}
