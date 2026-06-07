import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MarketingTool, MarketingToolDocument } from './marketing-tool.schema';
import { DEFAULT_MARKETING_TOOLS } from './marketing-tools.defaults';

@Injectable()
export class MarketingToolsService {
  constructor(@InjectModel(MarketingTool.name) private model: Model<MarketingToolDocument>) {}

  async ensureSeeded() {
    const count = await this.model.countDocuments().exec();
    if (count > 0) return;
    await this.model.insertMany(DEFAULT_MARKETING_TOOLS);
  }

  async publicList() {
    await this.ensureSeeded();
    return this.model.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
  }

  async all() {
    await this.ensureSeeded();
    return this.model.find().sort({ order: 1, createdAt: 1 }).lean();
  }

  create(d: Partial<MarketingTool>) {
    return new this.model(d).save();
  }

  async update(id: string, patch: Partial<MarketingTool>) {
    const doc = await this.model.findByIdAndUpdate(id, { $set: patch }, { new: true }).exec();
    if (!doc) throw new NotFoundException('Marketing tool not found');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Marketing tool not found');
    return { deleted: true };
  }
}
