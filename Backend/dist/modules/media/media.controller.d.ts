import { MediaQueryDto } from './dto/media-query.dto';
import { MediaService } from './media.service';
export declare class MediaController {
    private readonly media;
    constructor(media: MediaService);
    findAll(query: MediaQueryDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("./media.service").MediaAssetView>>;
    upload(files: Express.Multer.File[]): Promise<import("./media.service").MediaAssetView[]>;
    findOne(id: string): Promise<import("./media.service").MediaAssetDetail>;
    remove(id: string): Promise<void>;
}
