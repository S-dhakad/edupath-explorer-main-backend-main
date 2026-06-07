import { HydratedDocument } from 'mongoose';
export type ContactPageDocument = HydratedDocument<ContactPage>;
export declare class ContactPage {
    key: string;
    badgeText: string;
    headingPrefix: string;
    headingHighlight: string;
    headingSuffix: string;
    description: string;
    email: string;
    phone: string;
    office: string;
    responseTimeText: string;
    faqButtonLabel: string;
}
export declare const ContactPageSchema: import("mongoose").Schema<ContactPage, import("mongoose").Model<ContactPage, any, any, any, import("mongoose").Document<unknown, any, ContactPage, any, {}> & ContactPage & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ContactPage, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ContactPage>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ContactPage> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
