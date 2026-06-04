import { WatchingService } from './watching.service';
export declare class WatchingController {
    private readonly watchingService;
    constructor(watchingService: WatchingService);
    record(body: {
        courseId: string;
        videoIndex: number;
        lessonKey?: string;
        lastPositionSec?: number;
        progressPercent?: number;
        completed?: boolean;
    }, req: any): Promise<import("./watching.schema").Watching>;
    getHistory(req: any): Promise<import("./watching.schema").Watching[]>;
}
