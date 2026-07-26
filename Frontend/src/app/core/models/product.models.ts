export type ProductStatus = 'draft' | 'active' | 'archived';
export const PRODUCT_STATUSES: ProductStatus[] = ['draft', 'active', 'archived'];

export type StockPolicy = 'deny' | 'allow';
export const STOCK_POLICIES: StockPolicy[] = ['deny', 'allow'];

/** Fila del listado admin. */
export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  featured: boolean;
  hasVariants: boolean;
  sortOrder: number;
  updatedAt: string;
  coverImageUrl: string | null;
  price: number | null;
  sku: string | null;
  stock: number;
  categories: { id: string; name: string }[];
}

export interface VariantOptionRef {
  optionType: string;
  value: string;
  optionValueId?: string;
}

export interface ProductVariant {
  id?: string;
  sku: string | null;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  stock: number;
  stockPolicy: StockPolicy;
  weight: number | null;
  color: string | null;
  /** Asset (de las imágenes del producto) al que salta la galería de la tienda. */
  imageAssetId: string | null;
  isDefault: boolean;
  active: boolean;
  sortOrder: number;
  options: VariantOptionRef[];
}

export interface ProductOptionValue {
  id?: string;
  value: string;
  sortOrder: number;
}

export interface ProductOptionType {
  id?: string;
  name: string;
  sortOrder: number;
  values: ProductOptionValue[];
}

export interface ProductImage {
  id: string;
  assetId: string;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  sortOrder: number;
  isCover: boolean;
  width: number | null;
  height: number | null;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  status: ProductStatus;
  hasVariants: boolean;
  sortOrder: number;
  featured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  categories: { id: string; name: string; slug: string }[];
  images: ProductImage[];
  optionTypes: ProductOptionType[];
  variants: ProductVariant[];
}

// ----------------------------- payloads -----------------------------

export interface VariantInput {
  sku?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock?: number;
  stockPolicy?: StockPolicy;
  weight?: number;
  color?: string;
  imageAssetId?: string;
  isDefault?: boolean;
  active?: boolean;
  sortOrder?: number;
  options?: { optionType: string; value: string }[];
}

export interface OptionTypeInput {
  name: string;
  values: string[];
  sortOrder?: number;
}

export interface ProductImageInput {
  assetId: string;
  altText?: string;
  sortOrder?: number;
  isCover?: boolean;
}

export interface ProductPayload {
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  status?: ProductStatus;
  hasVariants?: boolean;
  sortOrder?: number;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  categoryIds?: string[];
  optionTypes?: OptionTypeInput[];
  images?: ProductImageInput[];
  variants: VariantInput[];
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus[];
  categoryId?: string;
  featured?: boolean;
  hasVariants?: boolean;
}
