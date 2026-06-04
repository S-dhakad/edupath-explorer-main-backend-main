import { CoursesService } from './courses.service';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    findAll(): Promise<import("./course.schema").Course[]>;
    findBySlug(slug: string): Promise<import("./course.schema").Course>;
    findByUser(userId: string): Promise<import("./course.schema").Course[]>;
    findOne(id: string): Promise<import("./course.schema").Course>;
    create(course: Partial<any>, req: any): Promise<import("./course.schema").Course>;
    adminUpdate(id: string, body: Partial<any>): Promise<import("mongoose").Document<unknown, {}, import("./course.schema").CourseDocument, {}, {}> & import("./course.schema").Course & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    adminRemove(id: string): Promise<{
        deleted: boolean;
    }>;
}
