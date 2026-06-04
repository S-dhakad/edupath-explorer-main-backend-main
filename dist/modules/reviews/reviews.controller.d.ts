import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private svc;
    constructor(svc: ReviewsService);
    create(user: any, body: any): Promise<import("mongoose").Document<unknown, {}, import("./review.schema").ReviewDocument, {}, {}> & import("./review.schema").Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    list(courseId: string): import("mongoose").Query<(import("mongoose").FlattenMaps<import("./review.schema").ReviewDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, import("./review.schema").ReviewDocument, {}, {}> & import("./review.schema").Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, import("./review.schema").ReviewDocument, "find", {}>;
    adminList(page?: string, limit?: string, courseId?: string): Promise<{
        items: (import("mongoose").FlattenMaps<import("./review.schema").ReviewDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
