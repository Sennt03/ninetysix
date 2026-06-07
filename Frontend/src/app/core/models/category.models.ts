export type CategoryStatus = 'active' | 'inactive';

export const CATEGORY_STATUSES: CategoryStatus[] = ['active', 'inactive'];

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parentName?: string | null;
  imageAssetId: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  sortOrder: number;
  status: CategoryStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
  children: Category[];
}

export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string | null;
  parentId?: string | null;
  imageAssetId?: string | null;
  imageAlt?: string | null;
  sortOrder?: number;
  status?: CategoryStatus;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface DeleteCategoryOptions {
  reassignChildrenTo?: string;
  reassignProductsTo?: string;
}
