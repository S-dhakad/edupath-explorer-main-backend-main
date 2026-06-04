import { Model } from 'mongoose';
import { Watching, WatchingDocument } from './watching.schema';
export declare class WatchingService {
    private watchingModel;
    constructor(watchingModel: Model<WatchingDocument>);
    recordWatch(userId: string, courseId: string, videoIndex: number, extra?: {
        lessonKey?: string;
        lastPositionSec?: number;
        progressPercent?: number;
        completed?: boolean;
    }): Promise<Watching>;
    getHistory(userId: string): Promise<Watching[]>;
}
