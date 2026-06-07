import {
  Controller,
  Get,
  Patch,
  UseGuards,
  Request,
  Inject,
  forwardRef,
  Param,
  ForbiddenException,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PurchasesService } from '../purchases/purchases.service';
import { WalletService } from '../wallet/wallet.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { CoursesService } from '../courses/courses.service';
import { UserRole } from '../../common/constants/app.constants';
import { mapCourseModulesForCurriculum, mapCourseToExplorerDto } from '../public/course-mapper';
import { PlansService } from '../plans/plans.service';
import { KycService } from '../kyc/kyc.service';
import { Types } from 'mongoose';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function avatarDiskStorage() {
  const uploadDir = process.env.MEDIA_UPLOAD_DIR || 'uploads';
  const dir = join(process.cwd(), uploadDir, 'avatars');
  return diskStorage({
    destination: (_req, _file, cb) => {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      let ext = (file.originalname?.match(/\.[a-z0-9]+$/i)?.[0] || '').toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
        ext = '.jpg';
      }
      cb(null, `${randomUUID()}${ext}`);
    },
  });
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    @Inject(forwardRef(() => PurchasesService)) private purchasesService: PurchasesService,
    private coursesService: CoursesService,
    private config: ConfigService,
    private walletService: WalletService,
    private analyticsService: AnalyticsService,
    private plansService: PlansService,
    private kycService: KycService,
  ) {}

  /**
   * Full curriculum with video URLs for learners who completed purchase (or admins).
   * Public catalog uses `GET /public/courses/:slug` — preview URLs only for `freePreview` lessons.
   */
  @Get('courses/:slug/curriculum')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getCourseCurriculum(@Request() req, @Param('slug') slug: string) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    const course = isAdmin
      ? await this.coursesService.findBySlugAny(slug)
      : await this.coursesService.findBySlug(slug);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (!course.isPublished && !isAdmin) {
      throw new NotFoundException('Course not found');
    }
    const userId = req.user._id.toString();
    const courseOid = (course as any)._id as Types.ObjectId;
    if (!isAdmin) {
      const ok = await this.purchasesService.hasCourseAccess(userId, courseOid);
      if (!ok) {
        throw new ForbiddenException(
          'Enroll in this course or activate a plan that includes it to unlock all lesson videos',
        );
      }
    }
    const mediaBase = this.config.get<string>('media.publicBase') || '';
    return {
      slug: course.slug,
      title: course.title,
      modules: mapCourseModulesForCurriculum(course as any, mediaBase),
    };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: avatarDiskStorage(),
      limits: { fileSize: MAX_AVATAR_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype)) {
          cb(new BadRequestException('Only JPEG, PNG, WebP, or GIF images are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async updateProfile(
    @CurrentUser() user: { _id: Types.ObjectId },
    @Body() body: UpdateProfileDto,
    @UploadedFile() avatar?: { filename: string },
  ) {
    const patch: { name?: string; phone?: string; avatarUrl?: string } = {};
    if (body.name !== undefined) patch.name = body.name;
    if (body.phone !== undefined) patch.phone = body.phone;
    if (avatar?.filename) {
      patch.avatarUrl = `/uploads/avatars/${avatar.filename}`;
    }
    if (!Object.keys(patch).length) {
      throw new BadRequestException('Nothing to update');
    }
    const updated = await this.usersService.updateProfileSelf(user._id.toString(), patch);
    if (!updated) throw new NotFoundException('User not found');
    return { user: updated };
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getDashboard(@Request() req) {
    const userId = req.user._id.toString();
    const user = await this.usersService.findById(userId);
    if (!user) return { error: 'User not found' };
    const [referrals, myPurchases, affiliateSales, wallet, summary, kycStatus] = await Promise.all([
      this.usersService.getReferrals(userId),
      this.purchasesService.findByUser(userId),
      user.referralCode ? this.purchasesService.findByCoupon(user.referralCode) : Promise.resolve([]),
      this.walletService.getOrCreate(userId),
      this.analyticsService.dashboardSummary(userId),
      this.kycService.getStatus(userId),
    ]);

    const conversionRate =
      referrals.length > 0 ? Math.min(100, (affiliateSales.length / referrals.length) * 100) : 0;

    const mediaBase = this.config.get<string>('media.publicBase') || '';
    let planCourses: ReturnType<typeof mapCourseToExplorerDto>[] = [];
    let planName: string | null = null;
    let activeMembership: {
      planId: string;
      planName: string;
      tierId?: string;
      courseCount: number;
    } | null = null;

    if (user.accountActive && user.planId) {
      const planOid = user.planId as Types.ObjectId;
      const plan = await this.plansService.findById(planOid.toString());
      planName = plan?.name ?? null;
      const courses = await this.plansService.findPublishedCoursesForMembership(planOid);
      planCourses = courses.map((c) => mapCourseToExplorerDto(c as any, 'General', mediaBase));
      if (plan) {
        activeMembership = {
          planId: (plan as any)._id.toString(),
          planName: plan.name,
          tierId: (plan as any).tierId,
          courseCount: courses.length,
        };
      }
    }

    return {
      user,
      kycStatus: (kycStatus as { status?: string })?.status ?? 'NOT_SUBMITTED',
      activeMembership,
      referrals: referrals.length,
      referralList: referrals,
      myPurchases,
      planCourses,
      planName,
      affiliateSales,
      wallet,
      conversionRate: Math.round(conversionRate * 100) / 100,
      ...summary,
      totalIncome: (user.activeIncome || 0) + (user.passiveIncome || 0),
      activeIncome: user.activeIncome,
      passiveIncome: user.passiveIncome,
    };
  }
}
