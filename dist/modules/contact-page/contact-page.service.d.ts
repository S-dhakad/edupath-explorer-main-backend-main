import { Model } from 'mongoose';
import { ContactPage, ContactPageDocument } from './contact-page.schema';
export declare class ContactPageService {
    private model;
    constructor(model: Model<ContactPageDocument>);
    private ensureDefault;
    getPublic(): Promise<{
        badgeText: any;
        headingPrefix: any;
        headingHighlight: any;
        headingSuffix: any;
        description: any;
        email: any;
        phone: any;
        office: any;
        responseTimeText: any;
        faqButtonLabel: any;
    }>;
    getAdmin(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ContactPage, {}, {}> & ContactPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, ContactPage, {}, {}> & ContactPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | (import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, ContactPage, {}, {}> & ContactPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)>;
    update(patch: Partial<ContactPage>): Promise<{
        badgeText: any;
        headingPrefix: any;
        headingHighlight: any;
        headingSuffix: any;
        description: any;
        email: any;
        phone: any;
        office: any;
        responseTimeText: any;
        faqButtonLabel: any;
    }>;
    private toPayload;
}
