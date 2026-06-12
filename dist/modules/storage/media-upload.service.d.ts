import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { MediaFolder, S3StorageService } from './s3-storage.service';
type MulterFile = {
    buffer?: Buffer;
    path?: string;
    filename?: string;
    originalname?: string;
    mimetype: string;
    size: number;
};
export declare class MediaUploadService {
    private readonly s3;
    private readonly config;
    constructor(s3: S3StorageService, config: ConfigService);
    persist(file: MulterFile, folder: MediaFolder, req?: Request): Promise<{
        path: string;
        url: string;
        filename: string;
        size: number;
    }>;
    private resolveExtension;
}
export {};
