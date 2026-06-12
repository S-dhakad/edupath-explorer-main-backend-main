import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import type { Request } from 'express';
import { buildMediaAbsoluteUrl } from '../../common/utils/media-url';
import { MediaFolder, S3StorageService } from './s3-storage.service';

type MulterFile = {
  buffer?: Buffer;
  path?: string;
  filename?: string;
  originalname?: string;
  mimetype: string;
  size: number;
};

@Injectable()
export class MediaUploadService {
  constructor(
    private readonly s3: S3StorageService,
    private readonly config: ConfigService,
  ) {}

  async persist(
    file: MulterFile,
    folder: MediaFolder,
    req?: Request,
  ): Promise<{ path: string; url: string; filename: string; size: number }> {
    const ext = this.resolveExtension(file, folder);
    const filename = `${randomUUID()}${ext}`;
    const key = `${folder}/${filename}`;
    const configuredBase = this.config.get<string>('media.publicBase') || '';

    if (this.s3.isEnabled()) {
      let url: string;
      if (file.buffer?.length) {
        url = await this.s3.uploadBuffer(file.buffer, key, file.mimetype);
      } else if (file.path) {
        url = await this.s3.uploadFromDisk(file.path, key, file.mimetype);
      } else {
        throw new Error('Uploaded file has no buffer or disk path');
      }
      return { path: url, url, filename, size: file.size };
    }

    const diskName = file.path ? basename(file.path) : filename;
    const relativePath = `/uploads/${folder}/${diskName}`;
    const url = req
      ? buildMediaAbsoluteUrl(req, relativePath, configuredBase)
      : relativePath;
    return { path: relativePath, url, filename: diskName, size: file.size };
  }

  private resolveExtension(file: MulterFile, folder: MediaFolder): string {
    const fromName = (file.originalname?.match(/\.[a-z0-9]+$/i)?.[0] || '').toLowerCase();
    if (fromName) return fromName;

    if (folder === 'videos') return '.mp4';
    if (folder === 'avatars' || folder === 'kyc') return '.jpg';
    return '.bin';
  }
}
