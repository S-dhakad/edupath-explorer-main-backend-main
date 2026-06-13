import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private readonly svc;
    constructor(svc: CategoriesService);
    findAll(): import("mongoose").Query<(import("mongoose").FlattenMaps<import("./category.schema").CategoryDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, import("./category.schema").CategoryDocument, {}, {}> & import("./category.schema").Category & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, import("./category.schema").CategoryDocument, "find", {}>;
    create(body: CreateCategoryDto): Promise<import("mongoose").Document<unknown, {}, import("./category.schema").CategoryDocument, {}, {}> & import("./category.schema").Category & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, body: UpdateCategoryDto): Promise<import("mongoose").Document<unknown, {}, import("./category.schema").CategoryDocument, {}, {}> & import("./category.schema").Category & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
