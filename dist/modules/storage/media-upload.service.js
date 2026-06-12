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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaUploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
const node_path_1 = require("node:path");
const media_url_1 = require("../../common/utils/media-url");
const s3_storage_service_1 = require("./s3-storage.service");
let MediaUploadService = class MediaUploadService {
    constructor(s3, config) {
        this.s3 = s3;
        this.config = config;
    }
    async persist(file, folder, req) {
        const ext = this.resolveExtension(file, folder);
        const filename = `${(0, node_crypto_1.randomUUID)()}${ext}`;
        const key = `${folder}/${filename}`;
        const configuredBase = this.config.get('media.publicBase') || '';
        if (this.s3.isEnabled()) {
            let url;
            if (file.buffer?.length) {
                url = await this.s3.uploadBuffer(file.buffer, key, file.mimetype);
            }
            else if (file.path) {
                url = await this.s3.uploadFromDisk(file.path, key, file.mimetype);
            }
            else {
                throw new Error('Uploaded file has no buffer or disk path');
            }
            return { path: url, url, filename, size: file.size };
        }
        const diskName = file.path ? (0, node_path_1.basename)(file.path) : filename;
        const relativePath = `/uploads/${folder}/${diskName}`;
        const url = req
            ? (0, media_url_1.buildMediaAbsoluteUrl)(req, relativePath, configuredBase)
            : relativePath;
        return { path: relativePath, url, filename: diskName, size: file.size };
    }
    resolveExtension(file, folder) {
        const fromName = (file.originalname?.match(/\.[a-z0-9]+$/i)?.[0] || '').toLowerCase();
        if (fromName)
            return fromName;
        if (folder === 'videos')
            return '.mp4';
        if (folder === 'avatars' || folder === 'kyc')
            return '.jpg';
        return '.bin';
    }
};
exports.MediaUploadService = MediaUploadService;
exports.MediaUploadService = MediaUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [s3_storage_service_1.S3StorageService,
        config_1.ConfigService])
], MediaUploadService);
//# sourceMappingURL=media-upload.service.js.map