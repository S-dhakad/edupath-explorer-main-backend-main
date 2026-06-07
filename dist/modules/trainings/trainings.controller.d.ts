import { TrainingsService } from './trainings.service';
export declare class TrainingsController {
    private svc;
    constructor(svc: TrainingsService);
    list(): Promise<(import("mongoose").FlattenMaps<import("./training.schema").TrainingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    all(): Promise<(import("mongoose").FlattenMaps<import("./training.schema").TrainingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    create(body: Partial<any>): Promise<import("mongoose").Document<unknown, {}, import("./training.schema").TrainingDocument, {}, {}> & import("./training.schema").Training & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, body: Partial<any>): Promise<import("mongoose").Document<unknown, {}, import("./training.schema").TrainingDocument, {}, {}> & import("./training.schema").Training & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
