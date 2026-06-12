import { ConfigService } from '@nestjs/config';
export type MediaFolder = 'videos' | 'images' | 'media' | 'avatars' | 'kyc';
export declare class S3StorageService {
    private readonly config;
    private readonly logger;
    private readonly client;
    private readonly bucket;
    private readonly publicBase;
    private readonly enabled;
    constructor(config: ConfigService);
    isEnabled(): boolean;
    getPublicBase(): string;
    buildPublicUrl(key: string): string;
    uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string>;
    uploadFromDisk(filePath: string, key: string, contentType: string): Promise<string>;
}
