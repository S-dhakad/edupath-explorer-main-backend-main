import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactPage, ContactPageDocument } from './contact-page.schema';
import { ContactInquiry, ContactInquiryDocument } from './contact-inquiry.schema';
import { DEFAULT_CONTACT_PAGE } from './contact-page.defaults';
import { SubmitContactInquiryDto } from './dto/submit-contact-inquiry.dto';

@Injectable()
export class ContactPageService {
  constructor(
    @InjectModel(ContactPage.name) private model: Model<ContactPageDocument>,
    @InjectModel(ContactInquiry.name) private inquiryModel: Model<ContactInquiryDocument>,
  ) {}

  private async ensureDefault() {
    const existing = await this.model.findOne({ key: 'default' }).lean();
    if (existing) return existing;
    return this.model.create(DEFAULT_CONTACT_PAGE);
  }

  async getPublic() {
    const doc = await this.ensureDefault();
    return this.toPayload(doc);
  }

  async getAdmin() {
    const doc = await this.ensureDefault();
    return doc;
  }

  async update(patch: Partial<ContactPage>) {
    const { key, _id, ...rest } = patch as any;
    const doc = await this.model
      .findOneAndUpdate({ key: 'default' }, { $set: rest }, { new: true, upsert: true })
      .lean();
    return this.toPayload(doc);
  }

  private toPayload(doc: any) {
    return {
      badgeText: doc.badgeText ?? DEFAULT_CONTACT_PAGE.badgeText,
      headingPrefix: doc.headingPrefix ?? DEFAULT_CONTACT_PAGE.headingPrefix,
      headingHighlight: doc.headingHighlight ?? DEFAULT_CONTACT_PAGE.headingHighlight,
      headingSuffix: doc.headingSuffix ?? DEFAULT_CONTACT_PAGE.headingSuffix,
      description: doc.description ?? DEFAULT_CONTACT_PAGE.description,
      email: doc.email ?? DEFAULT_CONTACT_PAGE.email,
      phone: doc.phone ?? DEFAULT_CONTACT_PAGE.phone,
      office: doc.office ?? DEFAULT_CONTACT_PAGE.office,
      responseTimeText: doc.responseTimeText ?? DEFAULT_CONTACT_PAGE.responseTimeText,
      faqButtonLabel: doc.faqButtonLabel ?? DEFAULT_CONTACT_PAGE.faqButtonLabel,
    };
  }

  async submitInquiry(dto: SubmitContactInquiryDto) {
    const inquiry = await this.inquiryModel.create({
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone?.trim() ?? '',
      topic: dto.topic.trim(),
      message: dto.message.trim(),
      status: 'new',
    });
    return {
      ok: true,
      id: inquiry._id.toString(),
      message: 'Thank you for your message. Our team will respond shortly.',
    };
  }

  async listInquiries(opts: { page?: number; limit?: number }) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, Math.max(1, opts.limit ?? 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.inquiryModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.inquiryModel.countDocuments(),
    ]);

    return { items, total, page, limit };
  }

  async deleteInquiry(id: string) {
    await this.inquiryModel.findByIdAndDelete(id).exec();
    return { ok: true };
  }
}
