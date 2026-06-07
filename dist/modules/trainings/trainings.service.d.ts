import { Model } from 'mongoose';
import { Training, TrainingDocument } from './training.schema';
export declare class TrainingsService {
    private model;
    constructor(model: Model<TrainingDocument>);
    ensureSeeded(): Promise<void>;
    publicList(): Promise<(import("mongoose").FlattenMaps<TrainingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    all(): Promise<(import("mongoose").FlattenMaps<TrainingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    create(d: Partial<Training>): Promise<import("mongoose").Document<unknown, {}, TrainingDocument, {}, {}> & Training & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, patch: Partial<Training>): Promise<import("mongoose").Document<unknown, {}, TrainingDocument, {}, {}> & Training & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
