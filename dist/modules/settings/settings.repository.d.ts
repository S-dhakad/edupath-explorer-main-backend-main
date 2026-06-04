import { Model } from 'mongoose';
import { PlatformSettings, PlatformSettingsDocument } from './schemas/platform-settings.schema';
export declare class SettingsRepository {
    private readonly model;
    constructor(model: Model<PlatformSettingsDocument>);
    getGlobal(): Promise<PlatformSettingsDocument>;
    updateGlobal(patch: Partial<PlatformSettings>): Promise<PlatformSettingsDocument>;
}
