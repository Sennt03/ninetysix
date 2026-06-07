export type MediaUsageFilter = 'all' | 'used' | 'unused';

export const MEDIA_USAGE_FILTERS: MediaUsageFilter[] = ['all', 'used', 'unused'];

/** Archivo de la biblioteca (imagen en el servidor). */
export interface MediaAsset {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  originalName: string | null;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  inUse: boolean;
  usageCount: number;
}

export interface MediaUsage {
  products: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

/** Detalle con el desglose de dónde se usa la imagen. */
export interface MediaAssetDetail extends MediaAsset {
  usage: MediaUsage;
}

export interface MediaQuery {
  page?: number;
  limit?: number;
  search?: string;
  usage?: MediaUsageFilter;
}
