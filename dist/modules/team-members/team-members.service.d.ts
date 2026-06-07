import { Model } from 'mongoose';
import { TeamMember, TeamMemberDocument } from './team-member.schema';
export declare class TeamMembersService {
    private model;
    constructor(model: Model<TeamMemberDocument>);
    ensureSeeded(): Promise<void>;
    publicList(): Promise<(import("mongoose").FlattenMaps<TeamMemberDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    all(): import("mongoose").Query<(import("mongoose").FlattenMaps<TeamMemberDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, TeamMemberDocument, {}, {}> & TeamMember & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, TeamMemberDocument, "find", {}>;
    create(d: Partial<TeamMember>): Promise<import("mongoose").Document<unknown, {}, TeamMemberDocument, {}, {}> & TeamMember & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, patch: Partial<TeamMember>): Promise<import("mongoose").Document<unknown, {}, TeamMemberDocument, {}, {}> & TeamMember & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
