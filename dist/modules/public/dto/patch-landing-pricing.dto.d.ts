export declare class LandingPricingTierDto {
    id: string;
    name: string;
    tagline: string;
    price: number;
    promoPrice?: number;
    period: string;
    features: string[];
    highlight?: boolean;
    badge?: string;
    chip: string;
    savings: string;
    description: string;
    accent: string;
    courseIds?: string[];
    showOnLanding?: boolean;
}
export declare class LandingPricingCompareRowDto {
    label: string;
    cells: string[];
}
export declare class PatchLandingPricingDto {
    tiers?: LandingPricingTierDto[];
    compareRows?: LandingPricingCompareRowDto[];
}
