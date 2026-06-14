import { Model } from 'mongoose';
import { ContactPage, ContactPageDocument } from './contact-page.schema';
import { ContactInquiry, ContactInquiryDocument } from './contact-inquiry.schema';
import { SubmitContactInquiryDto } from './dto/submit-contact-inquiry.dto';
export declare class ContactPageService {
    private model;
    private inquiryModel;
    constructor(model: Model<ContactPageDocument>, inquiryModel: Model<ContactInquiryDocument>);
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
    submitInquiry(dto: SubmitContactInquiryDto): Promise<{
        ok: boolean;
        id: string;
        message: string;
    }>;
    listInquiries(opts: {
        page?: number;
        limit?: number;
    }): Promise<{
        items: (import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, ContactInquiry, {}, {}> & ContactInquiry & {
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
    deleteInquiry(id: string): Promise<{
        ok: boolean;
    }>;
}
