import { Controller, Get, Param, Patch, Body, Post, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PublicService } from './public.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';
import { PatchLandingPricingDto } from './dto/patch-landing-pricing.dto';

@ApiTags('public')
@Controller('public')
@SkipThrottle()
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly usersService: UsersService,
  ) {}

  /** Full homepage hero payload: slides, offers, stat cards, featured courses (explorer shape). */
  @Get('hero')
  hero() {
    return this.publicService.getHeroPayload();
  }

  /** Published courses in explorer card/detail shape (for /courses catalog). */
  @Get('courses')
  listCourses() {
    return this.publicService.listPublishedCoursesExplorer();
  }

  @Get('courses/:slug')
  courseBySlug(@Param('slug') slug: string) {
    return this.publicService.getCourseBySlug(slug);
  }

  /** Homepage course-plan book cards (tiers + copy for cover / inside page). */
  @Get('pricing-plans')
  pricingPlans() {
    return this.publicService.getPricingPlansPayload({ landingOnly: true });
  }

  /** Guest checkout: validate member referral code without login. */
  @Post('validate-referral')
  validateReferral(@Body() body: { code: string }) {
    return this.usersService.validateReferralCodeForCheckout(body.code);
  }
}

@ApiTags('admin-landing')
@Controller('admin/landing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class LandingAdminController {
  constructor(private readonly publicService: PublicService) {}

  @Get('pricing')
  @ApiOkResponse({ description: 'Tiers (features = plan benefits) + compareRows for /plans table' })
  getPricing() {
    return this.publicService.getPricingPlansPayload();
  }

  @Patch('hero')
  patchHero(@Body() body: Record<string, unknown>) {
    return this.publicService.updateLandingHero(body as any);
  }

  @Patch('pricing')
  @ApiBody({ type: PatchLandingPricingDto })
  patchPricing(@Body() body: PatchLandingPricingDto) {
    return this.publicService.updateLandingPricing(body);
  }
}
