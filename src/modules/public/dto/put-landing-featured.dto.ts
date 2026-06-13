import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsMongoId } from 'class-validator';

export class PutLandingFeaturedDto {
  @ApiProperty({
    type: [String],
    description: 'Up to 6 published course IDs shown on the landing page',
    maxItems: 6,
  })
  @IsArray()
  @ArrayMaxSize(6)
  @IsMongoId({ each: true })
  courseIds: string[];
}

export const LANDING_FEATURED_MAX = 6;
