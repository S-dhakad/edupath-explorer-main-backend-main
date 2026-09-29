import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private model: Model<CategoryDocument>) {}

  create(d: Partial<Category>) {
    const doc = { ...d } as Partial<Category> & { name?: string; slug?: string };
    if (!doc.slug && doc.name) {
      (doc as any).slug = slugify(doc.name);
    }
    return new this.model(doc).save();
  }

  findAll() {
    return this.model.find().sort({ order: 1, name: 1 }).lean();
  }

  async update(id: string, patch: Partial<Category>) {
    const doc = await this.model.findByIdAndUpdate(id, { $set: patch }, { new: true }).exec();
    if (!doc) throw new NotFoundException();
    return doc;
  }

  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException();
    return { deleted: true };
  }
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}
