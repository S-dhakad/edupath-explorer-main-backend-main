import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactPage, ContactPageDocument } from './contact-page.schema';
import { DEFAULT_CONTACT_PAGE } from './contact-page.defaults';

@Injectable()
export class ContactPageService {
  constructor(@InjectModel(ContactPage.name) private model: Model<ContactPageDocument>) {}

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
}
