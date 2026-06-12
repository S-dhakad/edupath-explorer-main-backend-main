import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import type { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { MediaUploadService } from '../storage/media-upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';
import { KycStatus } from './schemas/kyc.schema';

function kycDiskStorage() {
  const dir = join(process.cwd(), process.env.MEDIA_UPLOAD_DIR || 'uploads', 'kyc');
  return diskStorage({
    destination: (_req, _file, cb) => {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
    },
  });
}

@ApiTags('kyc')
@Controller('kyc')
export class KycController {
  constructor(
    private readonly svc: KycService,
    private readonly mediaUpload: MediaUploadService,
  ) {}

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'aadharImage', maxCount: 1 },
        { name: 'panImage', maxCount: 1 },
      ],
      { storage: kycDiskStorage() },
    ),
  )
  async submit(
    @CurrentUser() user: any,
    @Body() body: any,
    @UploadedFiles() files: { aadharImage?: any[]; panImage?: any[] },
    @Req() req: Request,
  ) {
    let aadharImage: string | undefined;
    let panImage: string | undefined;
    if (files.aadharImage?.[0]) {
      const saved = await this.mediaUpload.persist(files.aadharImage[0], 'kyc', req);
      aadharImage = saved.url;
    }
    if (files.panImage?.[0]) {
      const saved = await this.mediaUpload.persist(files.panImage[0], 'kyc', req);
      panImage = saved.url;
    }
    const data = { ...body, aadharImage, panImage };
    return this.svc.submit(user._id.toString(), data);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  status(@CurrentUser() user: any) {
    return this.svc.getStatus(user._id.toString());
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  adminList(@Query('status') status?: KycStatus, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.listAll({
      status,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  @Patch('admin/decide/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  decide(@Param('id') id: string, @Body() body: { approve: boolean; adminNote?: string }) {
    return this.svc.decide(id, body.approve, body.adminNote);
  }
}
