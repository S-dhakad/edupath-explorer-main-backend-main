import { ContactPageService } from './contact-page.service';
import { ContactPage } from './contact-page.schema';
import { SubmitContactInquiryDto } from './dto/submit-contact-inquiry.dto';
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
    submitInquiry(body: SubmitContactInquiryDto): Promise<{
        ok: boolean;
        id: string;
        message: string;
    }>;
    adminListInquiries(page?: string, limit?: string): Promise<{
        items: (import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./contact-inquiry.schema").ContactInquiry, {}, {}> & import("./contact-inquiry.schema").ContactInquiry & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
        total: number;
        page: number;
        limit: number;
    }>;
    adminDeleteInquiry(id: string): Promise<{
        ok: boolean;
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
