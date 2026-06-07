import { TeamMembersService } from './team-members.service';
export declare class TeamMembersController {
    private svc;
    constructor(svc: TeamMembersService);
    publicList(): Promise<(import("mongoose").FlattenMaps<import("./team-member.schema").TeamMemberDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    all(): import("mongoose").Query<(import("mongoose").FlattenMaps<import("./team-member.schema").TeamMemberDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, import("./team-member.schema").TeamMemberDocument, {}, {}> & import("./team-member.schema").TeamMember & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, import("./team-member.schema").TeamMemberDocument, "find", {}>;
    create(body: Partial<any>): Promise<import("mongoose").Document<unknown, {}, import("./team-member.schema").TeamMemberDocument, {}, {}> & import("./team-member.schema").TeamMember & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, body: Partial<any>): Promise<import("mongoose").Document<unknown, {}, import("./team-member.schema").TeamMemberDocument, {}, {}> & import("./team-member.schema").TeamMember & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
