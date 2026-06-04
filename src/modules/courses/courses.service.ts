import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './course.schema';

@Injectable()
export class CoursesService {
  constructor(@InjectModel(Course.name) private courseModel: Model<CourseDocument>) {}

  async create(course: Partial<Course>): Promise<Course> {
    if (!course.slug && course.title) {
      (course as any).slug = slugify(course.title);
    }
    const createdCourse = new this.courseModel(course);
    return createdCourse.save();
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.find({ isPublished: true }).sort({ createdAt: -1 }).exec();
  }

  async findAllAdmin(): Promise<Course[]> {
    return this.courseModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Course | null> {
    return this.courseModel.findById(id).exec();
  }

  async findPublishedByIds(ids: Types.ObjectId[]): Promise<Course[]> {
    if (!ids.length) return [];
    return this.courseModel
      .find({ _id: { $in: ids }, isPublished: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findBySlug(slug: string): Promise<Course | null> {
    return this.courseModel.findOne({ slug: slug.toLowerCase(), isPublished: true }).exec();
  }

  /** Slug lookup ignoring publish flag (admin tooling). */
  async findBySlugAny(slug: string): Promise<Course | null> {
    return this.courseModel.findOne({ slug: slug.toLowerCase() }).exec();
  }

  async findByUser(userId: string): Promise<Course[]> {
    return this.courseModel
      .find({ uploadedBy: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, patch: Partial<Course>) {
    const doc = await this.courseModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).exec();
    if (!doc) throw new NotFoundException('Course not found');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.courseModel.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Course not found');
    return { deleted: true };
  }

  async incrementSales(courseId: string) {
    await this.courseModel.findByIdAndUpdate(courseId, { $inc: { salesCount: 1 } }).exec();
  }
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}
