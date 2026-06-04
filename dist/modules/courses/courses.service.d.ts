import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './course.schema';
export declare class CoursesService {
    private courseModel;
    constructor(courseModel: Model<CourseDocument>);
    create(course: Partial<Course>): Promise<Course>;
    findAll(): Promise<Course[]>;
    findAllAdmin(): Promise<Course[]>;
    findById(id: string): Promise<Course | null>;
    findPublishedByIds(ids: Types.ObjectId[]): Promise<Course[]>;
    findBySlug(slug: string): Promise<Course | null>;
    findBySlugAny(slug: string): Promise<Course | null>;
    findByUser(userId: string): Promise<Course[]>;
    update(id: string, patch: Partial<Course>): Promise<import("mongoose").Document<unknown, {}, CourseDocument, {}, {}> & Course & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
    incrementSales(courseId: string): Promise<void>;
}
