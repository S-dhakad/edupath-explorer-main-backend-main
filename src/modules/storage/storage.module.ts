import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3StorageService } from './s3-storage.service';
import { MediaUploadService } from './media-upload.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [S3StorageService, MediaUploadService],
  exports: [S3StorageService, MediaUploadService],
})
export class StorageModule {}
