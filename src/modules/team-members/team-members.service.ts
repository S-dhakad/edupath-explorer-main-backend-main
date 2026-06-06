import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeamMember, TeamMemberDocument } from './team-member.schema';
import { DEFAULT_TEAM_MEMBERS } from './team-members.defaults';

@Injectable()
export class TeamMembersService {
  constructor(@InjectModel(TeamMember.name) private model: Model<TeamMemberDocument>) {}

  async ensureSeeded() {
    const count = await this.model.countDocuments().exec();
    if (count > 0) return;
    await this.model.insertMany(DEFAULT_TEAM_MEMBERS);
  }

  async publicList() {
    await this.ensureSeeded();
    return this.model.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
  }

  all() {
    return this.model.find().sort({ order: 1, createdAt: 1 }).lean();
  }

  create(d: Partial<TeamMember>) {
    return new this.model(d).save();
  }

  async update(id: string, patch: Partial<TeamMember>) {
    const d = await this.model.findByIdAndUpdate(id, { $set: patch }, { new: true }).exec();
    if (!d) throw new NotFoundException('Team member not found');
    return d;
  }

  async remove(id: string) {
    const d = await this.model.findByIdAndDelete(id).exec();
    if (!d) throw new NotFoundException('Team member not found');
    return { deleted: true };
  }
}
