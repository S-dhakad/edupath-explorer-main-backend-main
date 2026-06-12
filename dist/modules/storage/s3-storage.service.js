"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var S3StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
let S3StorageService = S3StorageService_1 = class S3StorageService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(S3StorageService_1.name);
        const accessKeyId = this.config.get('aws.accessKeyId') || process.env.AWS_ACCESS_KEY_ID || '';
        const secretAccessKey = this.config.get('aws.secretAccessKey') || process.env.AWS_SECRET_ACCESS_KEY || '';
        const region = this.config.get('aws.region') || process.env.AWS_REGION || 'ap-south-1';
        this.bucket =
            this.config.get('aws.s3Bucket') || process.env.AWS_S3_BUCKET || '';
        const explicitBase = (this.config.get('aws.s3PublicBase') || process.env.AWS_S3_PUBLIC_BASE || '').replace(/\/$/, '');
        const s3Enabled = this.config.get('aws.s3Enabled') ?? process.env.AWS_S3_ENABLED !== 'false';
        this.enabled = Boolean(s3Enabled && accessKeyId && secretAccessKey && this.bucket);
        if (this.enabled) {
            this.client = new client_s3_1.S3Client({
                region,
                credentials: { accessKeyId, secretAccessKey },
            });
            this.publicBase =
                explicitBase || `https://${this.bucket}.s3.${region}.amazonaws.com`;
            this.logger.log(`S3 storage enabled — bucket: ${this.bucket}`);
        }
        else {
            this.client = null;
            this.publicBase = '';
            this.logger.warn(`S3 storage disabled — uploads will use local disk (enabled=${String(s3Enabled)}, bucket=${this.bucket || 'missing'})`);
        }
    }
    isEnabled() {
        return this.enabled;
    }
    getPublicBase() {
        return this.publicBase;
    }
    buildPublicUrl(key) {
        return `${this.publicBase}/${key.replace(/^\//, '')}`;
    }
    async uploadBuffer(buffer, key, contentType) {
        if (!this.client)
            throw new Error('S3 storage is not configured');
        await this.client.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            ACL: 'public-read',
            CacheControl: 'public, max-age=31536000, immutable',
        }));
        return this.buildPublicUrl(key);
    }
    async uploadFromDisk(filePath, key, contentType) {
        if (!this.client)
            throw new Error('S3 storage is not configured');
        const upload = new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket: this.bucket,
                Key: key,
                Body: (0, node_fs_1.createReadStream)(filePath),
                ContentType: contentType,
                ACL: 'public-read',
                CacheControl: 'public, max-age=31536000, immutable',
            },
            queueSize: 4,
            partSize: 8 * 1024 * 1024,
            leavePartsOnError: false,
        });
        await upload.done();
        await (0, promises_1.unlink)(filePath).catch(() => undefined);
        return this.buildPublicUrl(key);
    }
};
exports.S3StorageService = S3StorageService;
exports.S3StorageService = S3StorageService = S3StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3StorageService);
//# sourceMappingURL=s3-storage.service.js.map