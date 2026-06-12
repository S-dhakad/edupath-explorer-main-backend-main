import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';

export type MediaFolder = 'videos' | 'images' | 'media' | 'avatars' | 'kyc';

@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly client: S3Client | null;
  private readonly bucket: string;
  private readonly publicBase: string;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    const accessKeyId =
      this.config.get<string>('aws.accessKeyId') || process.env.AWS_ACCESS_KEY_ID || '';
    const secretAccessKey =
      this.config.get<string>('aws.secretAccessKey') || process.env.AWS_SECRET_ACCESS_KEY || '';
    const region =
      this.config.get<string>('aws.region') || process.env.AWS_REGION || 'ap-south-1';
    this.bucket =
      this.config.get<string>('aws.s3Bucket') || process.env.AWS_S3_BUCKET || '';
    const explicitBase = (
      this.config.get<string>('aws.s3PublicBase') || process.env.AWS_S3_PUBLIC_BASE || ''
    ).replace(/\/$/, '');
    const s3Enabled =
      this.config.get<boolean>('aws.s3Enabled') ?? process.env.AWS_S3_ENABLED !== 'false';

    this.enabled = Boolean(
      s3Enabled && accessKeyId && secretAccessKey && this.bucket,
    );

    if (this.enabled) {
      this.client = new S3Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });
      this.publicBase =
        explicitBase || `https://${this.bucket}.s3.${region}.amazonaws.com`;
      this.logger.log(`S3 storage enabled — bucket: ${this.bucket}`);
    } else {
      this.client = null;
      this.publicBase = '';
      this.logger.warn(
        `S3 storage disabled — uploads will use local disk (enabled=${String(s3Enabled)}, bucket=${this.bucket || 'missing'})`,
      );
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getPublicBase(): string {
    return this.publicBase;
  }

  buildPublicUrl(key: string): string {
    return `${this.publicBase}/${key.replace(/^\//, '')}`;
  }

  /** Upload from in-memory buffer (images, small files). */
  async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    if (!this.client) throw new Error('S3 storage is not configured');
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    return this.buildPublicUrl(key);
  }

  /** Stream upload from disk (large videos) then delete the temp file. */
  async uploadFromDisk(
    filePath: string,
    key: string,
    contentType: string,
  ): Promise<string> {
    if (!this.client) throw new Error('S3 storage is not configured');
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: createReadStream(filePath),
        ContentType: contentType,
        ACL: 'public-read',
        CacheControl: 'public, max-age=31536000, immutable',
      },
      queueSize: 4,
      partSize: 8 * 1024 * 1024,
      leavePartsOnError: false,
    });
    await upload.done();
    await unlink(filePath).catch(() => undefined);
    return this.buildPublicUrl(key);
  }
}
