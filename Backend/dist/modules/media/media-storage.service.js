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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MediaStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaStorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const sharp_1 = __importDefault(require("sharp"));
sharp_1.default.concurrency(1);
sharp_1.default.cache(false);
const MAX_DIMENSION = 2000;
const THUMB_SIZE = 400;
const THUMBS_SUBDIR = 'thumbs';
let MediaStorageService = MediaStorageService_1 = class MediaStorageService {
    constructor(config) {
        this.logger = new common_1.Logger(MediaStorageService_1.name);
        this.uploadDir = (0, node_path_1.resolve)(config.get('uploads.dir', { infer: true }));
        this.thumbsDir = (0, node_path_1.join)(this.uploadDir, THUMBS_SUBDIR);
        this.publicUrl = config.get('uploads.publicUrl', { infer: true }).replace(/\/+$/, '');
    }
    async processAndSave(file) {
        await this.ensureDirs();
        let pipeline;
        let metadata;
        try {
            pipeline = (0, sharp_1.default)(file.buffer, { animated: true });
            metadata = await pipeline.metadata();
        }
        catch {
            throw new common_1.BadRequestException('El archivo no es una imagen válida.');
        }
        if (!metadata.format || !metadata.width || !metadata.height) {
            throw new common_1.BadRequestException('El archivo no es una imagen válida.');
        }
        const isAnimated = (metadata.pages ?? 1) > 1;
        const id = (0, node_crypto_1.randomUUID)();
        let filename;
        let mimeType;
        let mainBuffer;
        let outWidth = metadata.width;
        let outHeight = metadata.height;
        if (isAnimated) {
            filename = `${id}.${metadata.format === 'gif' ? 'gif' : 'webp'}`;
            mimeType = metadata.format === 'gif' ? 'image/gif' : 'image/webp';
            mainBuffer = file.buffer;
        }
        else {
            filename = `${id}.webp`;
            mimeType = 'image/webp';
            const resized = await (0, sharp_1.default)(file.buffer)
                .rotate()
                .resize({
                width: MAX_DIMENSION,
                height: MAX_DIMENSION,
                fit: 'inside',
                withoutEnlargement: true,
            })
                .webp({ quality: 82 })
                .toBuffer({ resolveWithObject: true });
            mainBuffer = resized.data;
            outWidth = resized.info.width;
            outHeight = resized.info.height;
        }
        const thumbFilename = `${id}.webp`;
        const thumbBuffer = await (0, sharp_1.default)(file.buffer, { animated: false })
            .rotate()
            .resize({ width: THUMB_SIZE, height: THUMB_SIZE, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
        await (0, promises_1.writeFile)((0, node_path_1.join)(this.uploadDir, filename), mainBuffer);
        await (0, promises_1.writeFile)((0, node_path_1.join)(this.thumbsDir, thumbFilename), thumbBuffer);
        return {
            filename,
            originalName: file.originalname ?? null,
            url: `${this.publicUrl}/uploads/${filename}`,
            thumbnailUrl: `${this.publicUrl}/uploads/${THUMBS_SUBDIR}/${thumbFilename}`,
            mimeType,
            sizeBytes: mainBuffer.byteLength,
            width: outWidth,
            height: outHeight,
        };
    }
    async deleteFiles(asset) {
        const id = asset.filename.replace(/\.[^.]+$/, '');
        await Promise.all([
            this.safeUnlink((0, node_path_1.join)(this.uploadDir, asset.filename)),
            this.safeUnlink((0, node_path_1.join)(this.thumbsDir, `${id}.webp`)),
        ]);
    }
    async ensureDirs() {
        await (0, promises_1.mkdir)(this.thumbsDir, { recursive: true });
    }
    async safeUnlink(path) {
        try {
            await (0, promises_1.unlink)(path);
        }
        catch (e) {
            const err = e;
            if (err.code !== 'ENOENT') {
                this.logger.warn(`No se pudo borrar ${path}: ${err.message}`);
            }
        }
    }
};
exports.MediaStorageService = MediaStorageService;
exports.MediaStorageService = MediaStorageService = MediaStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MediaStorageService);
//# sourceMappingURL=media-storage.service.js.map