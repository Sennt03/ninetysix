"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize = normalize;
exports.parseBool = parseBool;
exports.parseDecimal = parseDecimal;
exports.parseIntField = parseIntField;
exports.parseProductStatus = parseProductStatus;
exports.parseCategoryStatus = parseCategoryStatus;
exports.parseStockPolicy = parseStockPolicy;
exports.parseColor = parseColor;
exports.splitList = splitList;
const client_1 = require("@prisma/client");
const TRUE_SET = new Set(['si', 'sí', 'true', '1', 'x', 'yes', 'y', 'verdadero', 'v']);
const FALSE_SET = new Set(['no', 'false', '0', 'n', 'falso', 'f']);
function normalize(text) {
    return text
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}
function parseBool(value) {
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
function parseDecimal(value, field) {
    if (value == null || value.trim() === '') {
        return undefined;
    }
    let raw = value.trim();
    if (raw.includes(',') && !raw.includes('.')) {
        raw = raw.replace(',', '.');
    }
    else {
        raw = raw.replace(/,/g, '');
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) {
        throw new Error(`${field}: número no válido ("${value}")`);
    }
    return n;
}
function parseIntField(value, field) {
    const n = parseDecimal(value, field);
    if (n === undefined) {
        return undefined;
    }
    if (!Number.isInteger(n)) {
        throw new Error(`${field}: debe ser un entero ("${value}")`);
    }
    return n;
}
function parseProductStatus(value) {
    if (!value?.trim()) {
        return undefined;
    }
    const n = normalize(value);
    const map = {
        active: client_1.ProductStatus.active,
        activo: client_1.ProductStatus.active,
        draft: client_1.ProductStatus.draft,
        borrador: client_1.ProductStatus.draft,
        archived: client_1.ProductStatus.archived,
        archivado: client_1.ProductStatus.archived,
    };
    const status = map[n];
    if (!status) {
        throw new Error(`Estado no válido: "${value}" (active/draft/archived)`);
    }
    return status;
}
function parseCategoryStatus(value) {
    if (!value?.trim()) {
        return undefined;
    }
    const n = normalize(value);
    const map = {
        active: client_1.CategoryStatus.active,
        activo: client_1.CategoryStatus.active,
        inactive: client_1.CategoryStatus.inactive,
        inactivo: client_1.CategoryStatus.inactive,
    };
    const status = map[n];
    if (!status) {
        throw new Error(`Estado no válido: "${value}" (active/inactive)`);
    }
    return status;
}
function parseStockPolicy(value) {
    if (!value?.trim()) {
        return undefined;
    }
    const n = normalize(value);
    if (n === 'deny' || n === 'denegar') {
        return client_1.StockPolicy.deny;
    }
    if (n === 'allow' || n === 'permitir') {
        return client_1.StockPolicy.allow;
    }
    throw new Error(`Política de stock no válida: "${value}" (deny/allow)`);
}
function parseColor(value) {
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
function splitList(value) {
    if (!value?.trim()) {
        return [];
    }
    return value
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);
}
//# sourceMappingURL=parse.util.js.map