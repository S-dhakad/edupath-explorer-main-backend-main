import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/** One subscription tier including `features` = plan benefits (bullet list in UI). */
export class LandingPricingTierDto {
  @ApiProperty({ example: 'pro', description: 'Stable slug / id for checkout links' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsString()
  @MaxLength(64)
  id: string;

  @ApiProperty({ example: 'Pro Learner' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'Most popular for serious learners' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(240)
  tagline: string;

  @ApiProperty({ example: 1499 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(99_999_999)
  price: number;

  @ApiProperty({ example: 'month', description: 'Billing label shown after price' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(32)
  period: string;

  @ApiProperty({
    type: [String],
    description: 'Plan benefits — each string is one bullet on cards and /plans',
    example: ['Access to all 200+ courses', 'Live mentorship sessions'],
  })
  @Transform(({ value }) => {
    if (!Array.isArray(value)) return [];
    return value
      .map((x) => (typeof x === 'string' ? x.trim() : String(x ?? '').trim()))
      .filter((s) => s.length > 0);
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Each tier must have at least one plan benefit (feature line)' })
  @ArrayMaxSize(40)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  features: string[];

  @ApiPropertyOptional({ description: 'Highlight this column in the UI' })
  @IsOptional()
  @IsBoolean()
  highlight?: boolean;

  @ApiPropertyOptional({ example: 'Most Popular' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(80)
  badge?: string;

  @ApiProperty({ example: '200+ full library' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(120)
  chip: string;

  @ApiProperty({ example: 'Save ₹3,000+ vs buying courses' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(200)
  savings: string;

  @ApiProperty({
    description: 'Long tier copy; may contain HTML if your admin uses CKEditor',
    example: '<p>Unlock the full library…</p>',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(50_000)
  description: string;

  @ApiProperty({
    example: 'from-primary/70 via-primary/40 to-transparent',
    description: 'Tailwind gradient fragment for marketing card wash',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(200)
  accent: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'MongoDB course ids included in this plan (full playlist for members)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!Array.isArray(value)) return [];
    return value.map((x) => String(x ?? '').trim()).filter(Boolean);
  })
  @IsArray()
  @ArrayMaxSize(500)
  @IsString({ each: true })
  courseIds?: string[];
}

/** One row in the /plans compare table; `cells[i]` = value for `tiers[i]`. */
export class LandingPricingCompareRowDto {
  @ApiProperty({ example: 'Course access' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(120)
  label: string;

  @ApiProperty({
    type: [String],
    description: 'Must have exactly one string per pricing tier (same order as tiers array)',
  })
  @Transform(({ value }) => {
    if (!Array.isArray(value)) return [];
    return value.map((x) => (typeof x === 'string' ? x.trim() : String(x ?? '').trim()));
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  cells: string[];
}

export class PatchLandingPricingDto {
  @ApiPropertyOptional({ type: [LandingPricingTierDto], description: 'Replace all tiers when sent' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => LandingPricingTierDto)
  tiers?: LandingPricingTierDto[];

  @ApiPropertyOptional({ type: [LandingPricingCompareRowDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => LandingPricingCompareRowDto)
  compareRows?: LandingPricingCompareRowDto[];
}
