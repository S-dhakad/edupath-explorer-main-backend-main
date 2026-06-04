import { Model } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';
export declare class CategoriesService {
    private model;
    constructor(model: Model<CategoryDocument>);
    create(d: Partial<Category>): Promise<import("mongoose").Document<unknown, {}, CategoryDocument, {}, {}> & Category & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(): import("mongoose").Query<(import("mongoose").FlattenMaps<CategoryDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, CategoryDocument, {}, {}> & Category & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, CategoryDocument, "find", {}>;
    update(id: string, patch: Partial<Category>): Promise<import("mongoose").Document<unknown, {}, CategoryDocument, {}, {}> & Category & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
