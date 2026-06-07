import { ProductStatus, StockPolicy } from '@prisma/client';
import { RawRow } from './xlsx.util';
export interface PreviewColumn {
    key: string;
    header: string;
}
export interface PreviewRow {
    _row: number;
    _errors: string[];
    [key: string]: string | number | null | string[];
}
export interface ImportPreview {
    type: 'products' | 'categories';
    totalRows: number;
    totalItems: number;
    validItems: number;
    invalidItems: number;
    truncated: boolean;
    columns: PreviewColumn[];
    rows: PreviewRow[];
}
export interface ParsedVariant {
    rowNumber: number;
    sku?: string;
    price?: number;
    comparePrice?: number;
    costPrice?: number;
    stock?: number;
    stockPolicy?: StockPolicy;
    weight?: number;
    color?: string;
    isDefault?: boolean;
    active?: boolean;
    options: {
        optionType: string;
        value: string;
    }[];
}
export interface ParsedProductItem {
    handle: string;
    firstRow: number;
    rowNumbers: number[];
    name?: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    status?: ProductStatus;
    featured?: boolean;
    metaTitle?: string;
    metaDescription?: string;
    categorySlugs: string[];
    images: {
        url: string;
        alt?: string;
    }[];
    hasVariants: boolean;
    optionTypes: {
        name: string;
        values: string[];
    }[];
    variants: ParsedVariant[];
    errors: string[];
    raw: RawRow[];
}
