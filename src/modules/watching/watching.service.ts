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

    const existing = await this.watchingModel
      .findOne({ userId: uid, courseId: cid, lessonKey })
      .exec();

    const wasCompleted = Boolean(existing?.completed);
    const incomingPct = Math.min(100, Math.max(0, extra?.progressPercent ?? 0));
    const incomingPos = Math.max(0, extra?.lastPositionSec ?? 0);
    const progressPercent = wasCompleted
      ? 100
      : Math.max(existing?.progressPercent ?? 0, incomingPct);
    const completed = wasCompleted || Boolean(extra?.completed) || incomingPct >= 95;
    const lastPositionSec = wasCompleted
      ? incomingPos
      : Math.max(existing?.lastPositionSec ?? 0, incomingPos);

    return this.watchingModel
      .findOneAndUpdate(
        { userId: uid, courseId: cid, lessonKey },
        {
          $set: {
            videoIndex,
            lessonKey,
            lastPositionSec,
            progressPercent,
            completed,
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
