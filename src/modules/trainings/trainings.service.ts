import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Training, TrainingDocument } from './training.schema';
import { DEFAULT_TRAININGS } from './trainings.defaults';

@Injectable()
export class TrainingsService {
  constructor(@InjectModel(Training.name) private model: Model<TrainingDocument>) {}

  async ensureSeeded() {
    const count = await this.model.countDocuments().exec();
    if (count > 0) return;
    await this.model.insertMany(DEFAULT_TRAININGS);
  }

  async publicList() {
    await this.ensureSeeded();
    return this.model.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
  }

  async all() {
    await this.ensureSeeded();
    return this.model.find().sort({ order: 1, createdAt: 1 }).lean();
  }

  create(d: Partial<Training>) {
    return new this.model(d).save();
  }

  async update(id: string, patch: Partial<Training>) {
    const doc = await this.model.findByIdAndUpdate(id, { $set: patch }, { new: true }).exec();
    if (!doc) throw new NotFoundException('Training not found');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Training not found');
    return { deleted: true };
  }
}
