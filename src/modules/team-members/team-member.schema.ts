import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamMemberDocument = TeamMember & Document;

@Schema({ timestamps: true, collection: 'teamMembers' })
export class TeamMember {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  experience: string;

  @Prop({ required: true, trim: true })
  position: string;

  @Prop({ trim: true })
  contactNumber?: string;

  @Prop({ required: true, trim: true })
  state: string;

  @Prop({ trim: true })
  instagram?: string;

  @Prop({ trim: true })
  instagramSecondary?: string;

  @Prop({ default: '' })
  imageUrl: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  active: boolean;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);
