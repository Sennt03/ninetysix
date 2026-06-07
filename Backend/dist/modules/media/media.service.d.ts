import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PrismaService } from '../../database/prisma/prisma.service';
import { MediaQueryDto } from './dto/media-query.dto';
import { MediaStorageService } from './media-storage.service';
export interface MediaUsage {
    products: {
        id: string;
        name: string;
    }[];
    categories: {
        id: string;
        name: string;
    }[];
}
export interface MediaAssetView {
    id: string;
    url: string;
    thumbnailUrl: string | null;
    originalName: string | null;
    mimeType: string;
    sizeBytes: number;
    width: number | null;
    height: number | null;
    createdAt: Date;
    inUse: boolean;
    usageCount: number;
}
export interface MediaAssetDetail extends MediaAssetView {
    usage: MediaUsage;
}
export declare class MediaService {
    private readonly prisma;
    private readonly storage;
    constructor(prisma: PrismaService, storage: MediaStorageService);
    list(query: MediaQueryDto): Promise<PaginatedResult<MediaAssetView>>;
    upload(files: Express.Multer.File[]): Promise<MediaAssetView[]>;
    findOrCreateAssetFromBuffer(buffer: Buffer, originalName: string | null): Promise<string>;
    importFromUrl(url: string): Promise<string>;
    private persistBuffer;
    private usageCountOf;
    findOne(id: string): Promise<MediaAssetDetail>;
    remove(id: string): Promise<void>;
    cleanupOrphans(assetIds: string[]): Promise<void>;
    assertAssetsExist(assetIds: string[]): Promise<void>;
    private usageMessage;
    private toView;
}
