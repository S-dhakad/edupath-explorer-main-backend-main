import { SettingsRepository } from './settings.repository';
export declare class SettingsService {
    private readonly repo;
    constructor(repo: SettingsRepository);
    getGlobal(): Promise<import("./schemas/platform-settings.schema").PlatformSettingsDocument>;
    updateGlobal(patch: Record<string, unknown>): Promise<import("./schemas/platform-settings.schema").PlatformSettingsDocument>;
}
