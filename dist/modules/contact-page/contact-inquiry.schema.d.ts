import { HydratedDocument } from 'mongoose';
export type ContactInquiryDocument = HydratedDocument<ContactInquiry>;
export declare class ContactInquiry {
    name: string;
    email: string;
    phone: string;
    topic: string;
    message: string;
    status: string;
}
export declare const ContactInquirySchema: import("mongoose").Schema<ContactInquiry, import("mongoose").Model<ContactInquiry, any, any, any, import("mongoose").Document<unknown, any, ContactInquiry, any, {}> & ContactInquiry & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ContactInquiry, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ContactInquiry>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ContactInquiry> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
