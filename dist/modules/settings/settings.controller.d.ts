import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    publicCommissionPreview(): Promise<{
        couponOwnerPercent: number;
        platformPercent: number;
        directParentPercent: number;
        memberPromoBuyerDiscountPercent: number;
    }>;
    adminUpdate(body: Record<string, number | boolean>): Promise<import("./schemas/platform-settings.schema").PlatformSettingsDocument>;
}
