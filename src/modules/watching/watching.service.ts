import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Watching, WatchingDocument } from './watching.schema';

@Injectable()
export class WatchingService {
  constructor(@InjectModel(Watching.name) private watchingModel: Model<WatchingDocument>) {}

  async recordWatch(
    userId: string,
    courseId: string,
    videoIndex: number,
    extra?: {
      lessonKey?: string;
      lastPositionSec?: number;
      progressPercent?: number;
      completed?: boolean;
    },
  ): Promise<Watching> {
    const uid = new Types.ObjectId(userId);
    const cid = new Types.ObjectId(courseId);
    const lessonKey = extra?.lessonKey ?? `v${videoIndex}`;
    return this.watchingModel
      .findOneAndUpdate(
        { userId: uid, courseId: cid, lessonKey },
        {
          $set: {
            videoIndex,
            lessonKey,
            lastPositionSec: extra?.lastPositionSec ?? 0,
            progressPercent: extra?.progressPercent ?? 0,
            completed: extra?.completed ?? false,
            watchedAt: new Date(),
          },
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async getHistory(userId: string): Promise<Watching[]> {
    return this.watchingModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ watchedAt: -1 })
      .exec();
  }
}
