import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContactPageDocument = HydratedDocument<ContactPage>;

@Schema({ timestamps: true, collection: 'contactPage' })
export class ContactPage {
  @Prop({ unique: true, default: 'default' })
  key: string;

  @Prop({ default: 'Contact us' })
  badgeText: string;

  @Prop({ default: "Let's build your" })
  headingPrefix: string;

  @Prop({ default: 'next growth' })
  headingHighlight: string;

  @Prop({ default: 'plan' })
  headingSuffix: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 'hello@StartSuccess.app' })
  email: string;

  @Prop({ default: '+91 98765 43210' })
  phone: string;

  @Prop({ default: 'Bengaluru, India' })
  office: string;

  @Prop({ default: 'Average response time: under 24 hours' })
  responseTimeText: string;

  @Prop({ default: 'Visit FAQ' })
  faqButtonLabel: string;
}

export const ContactPageSchema = SchemaFactory.createForClass(ContactPage);
