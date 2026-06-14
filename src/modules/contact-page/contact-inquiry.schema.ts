import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContactInquiryDocument = HydratedDocument<ContactInquiry>;

@Schema({ timestamps: true, collection: 'contactInquiries' })
export class ContactInquiry {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ required: true })
  topic: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: 'new', enum: ['new', 'read', 'archived'] })
  status: string;
}

export const ContactInquirySchema = SchemaFactory.createForClass(ContactInquiry);
