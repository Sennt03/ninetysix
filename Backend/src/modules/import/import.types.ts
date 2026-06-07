import { ProductStatus, StockPolicy } from '@prisma/client';
import { RawRow } from './xlsx.util';

// --------------------------- Preview (dry-run) ---------------------------

export interface PreviewColumn {
  key: string;
  header: string;
}

/** Fila del preview: datos + validación estructural. */
export interface PreviewRow {
  _row: number; // primera fila en el Excel
  _errors: string[];
  [key: string]: string | number | null | string[];
}

export interface ImportPreview {
  type: 'products' | 'categories';
  totalRows: number; // filas con datos en el archivo
  totalItems: number; // entidades resultantes (agrupadas)
  validItems: number;
  invalidItems: number;
  truncated: boolean; // si se recortó la lista de filas devueltas
  columns: PreviewColumn[];
  rows: PreviewRow[];
}

// --------------------- Producto agrupado (parseo) ------------------------

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
  options: { optionType: string; value: string }[];
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
  images: { url: string; alt?: string }[];
  hasVariants: boolean;
  optionTypes: { name: string; values: string[] }[];
  variants: ParsedVariant[];
  /** Errores estructurales detectados en el parseo. */
  errors: string[];
  /** Filas originales (para regenerar el archivo de fallidas). */
  raw: RawRow[];
}
