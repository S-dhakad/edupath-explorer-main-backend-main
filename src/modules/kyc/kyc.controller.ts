import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';
import { KycStatus } from './schemas/kyc.schema';

@ApiTags('kyc')
@Controller('kyc')
export class KycController {
  constructor(private readonly svc: KycService) {}

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'aadharImage', maxCount: 1 },
        { name: 'panImage', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/kyc',
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  submit(
    @CurrentUser() user: any,
    @Body() body: any,
    @UploadedFiles() files: { aadharImage?: any[]; panImage?: any[] },
  ) {
    const data = {
      ...body,
      aadharImage: files.aadharImage ? `/uploads/kyc/${files.aadharImage[0].filename}` : undefined,
      panImage: files.panImage ? `/uploads/kyc/${files.panImage[0].filename}` : undefined,
    };
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
