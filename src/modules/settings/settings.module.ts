import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlatformSettings, PlatformSettingsSchema } from './schemas/platform-settings.schema';
import { SettingsRepository } from './settings.repository';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PlatformSettings.name, schema: PlatformSettingsSchema }]),
  ],
  providers: [SettingsRepository, SettingsService],
  controllers: [SettingsController],
  exports: [SettingsService],
})
export class SettingsModule {}
