import { Document, Types } from 'mongoose';
export type PlanDocument = Plan & Document;
export declare class Plan {
    name: string;
    price: number;
    features: string[];
    tierId?: string;
    period?: string;
    active: boolean;
    courseIds: Types.ObjectId[];
    createdAt: Date;
}
export declare const PlanSchema: import("mongoose").Schema<Plan, import("mongoose").Model<Plan, any, any, any, Document<unknown, any, Plan, any, {}> & Plan & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Plan, Document<unknown, {}, import("mongoose").FlatRecord<Plan>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Plan> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
