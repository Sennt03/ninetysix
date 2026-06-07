// Helpers de parseo de celdas a tipos de dominio. Todas las entradas vienen ya
// como string (lo entrega xlsx.util). Lanzan Error con mensaje legible cuando el
// valor es inválido; ese mensaje acaba como incidencia de la fila.

import { CategoryStatus, ProductStatus, StockPolicy } from '@prisma/client';

const TRUE_SET = new Set(['si', 'sí', 'true', '1', 'x', 'yes', 'y', 'verdadero', 'v']);
const FALSE_SET = new Set(['no', 'false', '0', 'n', 'falso', 'f']);

/** Normaliza texto: sin tildes, minúsculas, espacios colapsados. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** sí/no → boolean. Devuelve undefined si la celda está vacía. */
export function parseBool(value: string | undefined): boolean | undefined {
  if (value == null || value.trim() === '') {
    return undefined;
  }
  const n = normalize(value);
  if (TRUE_SET.has(n)) {
    return true;
  }
  if (FALSE_SET.has(n)) {
    return false;
  }
  throw new Error(`Valor booleano no válido: "${value}" (usa sí/no)`);
}

/** Número decimal. Acepta coma decimal ("19,99"). undefined si vacío. */
export function parseDecimal(value: string | undefined, field: string): number | undefined {
  if (value == null || value.trim() === '') {
    return undefined;
  }
  let raw = value.trim();
  // "19,99" -> "19.99" (coma decimal); si hay ambos, se asume coma de millares.
  if (raw.includes(',') && !raw.includes('.')) {
    raw = raw.replace(',', '.');
  } else {
    raw = raw.replace(/,/g, '');
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new Error(`${field}: número no válido ("${value}")`);
  }
  return n;
}

/** Entero ≥ 0. undefined si vacío. */
export function parseIntField(value: string | undefined, field: string): number | undefined {
  const n = parseDecimal(value, field);
  if (n === undefined) {
    return undefined;
  }
  if (!Number.isInteger(n)) {
    throw new Error(`${field}: debe ser un entero ("${value}")`);
  }
  return n;
}

export function parseProductStatus(value: string | undefined): ProductStatus | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  const n = normalize(value);
  const map: Record<string, ProductStatus> = {
    active: ProductStatus.active,
    activo: ProductStatus.active,
    draft: ProductStatus.draft,
    borrador: ProductStatus.draft,
    archived: ProductStatus.archived,
    archivado: ProductStatus.archived,
  };
  const status = map[n];
  if (!status) {
    throw new Error(`Estado no válido: "${value}" (active/draft/archived)`);
  }
  return status;
}

export function parseCategoryStatus(value: string | undefined): CategoryStatus | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  const n = normalize(value);
  const map: Record<string, CategoryStatus> = {
    active: CategoryStatus.active,
    activo: CategoryStatus.active,
    inactive: CategoryStatus.inactive,
    inactivo: CategoryStatus.inactive,
  };
  const status = map[n];
  if (!status) {
    throw new Error(`Estado no válido: "${value}" (active/inactive)`);
  }
  return status;
}

export function parseStockPolicy(value: string | undefined): StockPolicy | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  const n = normalize(value);
  if (n === 'deny' || n === 'denegar') {
    return StockPolicy.deny;
  }
  if (n === 'allow' || n === 'permitir') {
    return StockPolicy.allow;
  }
  throw new Error(`Política de stock no válida: "${value}" (deny/allow)`);
}

export function parseColor(value: string | undefined): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  let hex = value.trim();
  if (!hex.startsWith('#')) {
    hex = `#${hex}`;
  }
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error(`Color no válido: "${value}" (usa formato #RRGGBB)`);
  }
  return hex.toUpperCase();
}

/** Divide una celda por el separador "|", limpiando vacíos. */
export function splitList(value: string | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }
  return value
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
}
