import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './review.schema';

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review.name) private model: Model<ReviewDocument>) {}

  create(userId: string, dto: { courseId: string; rating: number; comment?: string }) {
    return this.model.create({
      userId: new Types.ObjectId(userId),
      courseId: new Types.ObjectId(dto.courseId),
      rating: dto.rating,
      comment: dto.comment,
    });
  }

  listByCourse(courseId: string) {
    return this.model.find({ courseId: new Types.ObjectId(courseId) }).sort({ createdAt: -1 }).lean();
  }

  async listAll(query: { page?: number; limit?: number; courseId?: string }) {
    const { page = 1, limit = 20, courseId } = query;
    const filter: any = {};
    if (courseId) filter.courseId = new Types.ObjectId(courseId);
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name email avatarUrl')
        .populate('courseId', 'title slug')
        .lean(),
      this.model.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  }

  async remove(id: string) {
    const d = await this.model.findByIdAndDelete(id).exec();
    if (!d) throw new NotFoundException();
    return { deleted: true };
  }
}
