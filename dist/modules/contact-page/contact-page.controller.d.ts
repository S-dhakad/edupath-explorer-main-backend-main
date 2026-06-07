import { ContactPageService } from './contact-page.service';
import { ContactPage } from './contact-page.schema';
export declare class ContactPageController {
    private svc;
    constructor(svc: ContactPageService);
    publicGet(): Promise<{
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
    adminGet(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ContactPage, {}, {}> & ContactPage & {
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
    adminPatch(body: Partial<ContactPage>): Promise<{
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
}
