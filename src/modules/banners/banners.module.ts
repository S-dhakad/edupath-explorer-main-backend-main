import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Banner, BannerSchema } from './banner.schema';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }])],
  providers: [BannersService],
  controllers: [BannersController],
})
export class BannersModule {}
