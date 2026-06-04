import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './review.schema';
export declare class ReviewsService {
    private model;
    constructor(model: Model<ReviewDocument>);
    create(userId: string, dto: {
        courseId: string;
        rating: number;
        comment?: string;
    }): Promise<import("mongoose").Document<unknown, {}, ReviewDocument, {}, {}> & Review & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listByCourse(courseId: string): import("mongoose").Query<(import("mongoose").FlattenMaps<ReviewDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, ReviewDocument, {}, {}> & Review & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, {}, ReviewDocument, "find", {}>;
    listAll(query: {
        page?: number;
        limit?: number;
        courseId?: string;
    }): Promise<{
        items: (import("mongoose").FlattenMaps<ReviewDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
