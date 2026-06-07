import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/configuration';
export interface ProcessedAsset {
    filename: string;
    originalName: string | null;
    url: string;
    thumbnailUrl: string;
    mimeType: string;
    sizeBytes: number;
    width: number;
    height: number;
}
export declare class MediaStorageService {
    private readonly logger;
    private readonly uploadDir;
    private readonly thumbsDir;
    private readonly publicUrl;
    constructor(config: ConfigService<AppConfig, true>);
    processAndSave(file: Express.Multer.File): Promise<ProcessedAsset>;
    deleteFiles(asset: {
        filename: string;
    }): Promise<void>;
    private ensureDirs;
    private safeUnlink;
}
