import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { join, basename } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';
import { buildMediaAbsoluteUrl } from '../../common/utils/media-url';
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Commission, CommissionDocument } from '../commission/schemas/commission.schema';
import { Kyc, KycDocument } from '../kyc/schemas/kyc.schema';
import { Withdrawal, WithdrawalDocument } from '../withdrawals/withdrawal.schema';

const MAX_VIDEO_UPLOAD_BYTES = Math.min(
  2048 * 1024 * 1024,
  Math.max(16 * 1024 * 1024, (parseInt(process.env.MEDIA_MAX_VIDEO_MB || '512', 10) || 512) * 1024 * 1024),
);

function courseVideoDiskStorage() {
  const uploadDir = process.env.MEDIA_UPLOAD_DIR || 'uploads';
  const dir = join(process.cwd(), uploadDir, 'videos');
  return diskStorage({
    destination: (_req, _file, cb) => {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      let ext = (file.originalname?.match(/\.[a-z0-9]+$/i)?.[0] || '').toLowerCase();
      if (!['.mp4', '.webm', '.mov', '.m4v', '.mkv'].includes(ext)) {
        ext = '.mp4';
      }
      cb(null, `${randomUUID()}${ext}`);
    },
  });
}

function generalMediaDiskStorage() {
  const uploadDir = process.env.MEDIA_UPLOAD_DIR || 'uploads';
  const dir = join(process.cwd(), uploadDir, 'media');
  return diskStorage({
    destination: (_req, _file, cb) => {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = (file.originalname?.match(/\.[a-z0-9]+$/i)?.[0] || '').toLowerCase();
      cb(null, `${randomUUID()}${ext}`);
    },
  });
}

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private users: UsersService,
    private coursesService: CoursesService,
    private readonly config: ConfigService,
    @InjectModel(Commission.name) private commissionModel: Model<CommissionDocument>,
    @InjectModel(Kyc.name) private kycModel: Model<KycDocument>,
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<WithdrawalDocument>,
  ) {}

  @Get('stats')
  async stats() {
    const [users, courses, revenue, pendingKyc, pendingWithdrawals] = await Promise.all([
      this.users.countTotal(),
      this.coursesService.findAllAdmin().then((r) => r.length),
      this.commissionModel.aggregate([
        { $match: { incomeCategory: 'platform' } },
        { $group: { _id: null, t: { $sum: '$amount' } } },
      ]),
      this.kycModel.countDocuments({ status: 'PENDING' }),
      this.withdrawalModel.countDocuments({ status: 'PENDING' }),
    ]);
    return {
      totalUsers: users,
      totalCourses: courses,
      platformRevenue: revenue[0]?.t || 0,
      pendingKyc,
      pendingWithdrawals,
    };
  }

  @Get('users')
  listUsers(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string) {
    return this.users.adminList({
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
      search,
    });
  }

  @Patch('users/:id/ban')
  ban(@Param('id') id: string, @Query('value') value?: string) {
    return this.users.adminBan(id, value !== 'false');
  }

  @Patch('users/:id/verify-seller')
  verify(@Param('id') id: string, @Query('value') value?: string) {
    return this.users.adminVerifySeller(id, value !== 'false');
  }

  @Get('users/:id/referrals')
  referrals(@Param('id') id: string) {
    return this.users.listReferralTree(id, 5);
  }

  @Get('courses')
  listCourses() {
    return this.coursesService.findAllAdmin();
  }

  /** Upload a lesson video from disk; returns `url` to paste into course modules (also stored as `path`). */
  @Post('media/video')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: courseVideoDiskStorage(),
      limits: { fileSize: MAX_VIDEO_UPLOAD_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('video/')) {
          cb(new BadRequestException('Only video files are allowed (e.g. mp4, webm).') as any, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadCourseVideo(
    @UploadedFile()
    file:
      | {
          path: string;
          filename: string;
          originalname: string;
          mimetype: string;
          size: number;
        }
      | undefined,
    @Req() req: Request,
  ) {
    if (!file?.path) {
      throw new BadRequestException('Missing file field "file"');
    }
    const name = basename(file.path);
    const relativePath = `/uploads/videos/${name}`;
    const configuredBase = this.config.get<string>('media.publicBase') || '';
    const url = buildMediaAbsoluteUrl(req, relativePath, configuredBase);
    return { path: relativePath, url, filename: name, size: file.size };
  }

  @Post('media/upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: generalMediaDiskStorage(),
      limits: { fileSize: MAX_VIDEO_UPLOAD_BYTES },
    }),
  )
  async uploadMedia(
    @UploadedFile()
    file:
      | {
          path: string;
          filename: string;
          originalname: string;
          mimetype: string;
          size: number;
        }
      | undefined,
    @Req() req: Request,
  ) {
    if (!file?.path) {
      throw new BadRequestException('Missing file field "file"');
    }
    const name = basename(file.path);
    const relativePath = `/uploads/media/${name}`;
    const configuredBase = this.config.get<string>('media.publicBase') || '';
    const url = buildMediaAbsoluteUrl(req, relativePath, configuredBase);
    return { path: relativePath, url, filename: name, size: file.size };
  }
}
