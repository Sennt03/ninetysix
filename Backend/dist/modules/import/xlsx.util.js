"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSheetRows = readSheetRows;
exports.buildWorkbook = buildWorkbook;
exports.workbookToBuffer = workbookToBuffer;
const common_1 = require("@nestjs/common");
const exceljs_1 = __importDefault(require("exceljs"));
const parse_util_1 = require("./parse.util");
function cellToString(value) {
    if (value == null) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (typeof value === 'object') {
        const v = value;
        if ('text' in v && typeof v.text === 'string') {
            return v.text;
        }
        if ('result' in v) {
            return v.result == null ? '' : String(v.result);
        }
        if ('richText' in v && Array.isArray(v.richText)) {
            return v.richText.map((p) => p.text).join('');
        }
        if ('hyperlink' in v && typeof v.hyperlink === 'string') {
            return v.hyperlink;
        }
    }
    return String(value);
}
function buildHeaderResolver(columns) {
    const map = new Map();
    for (const col of columns) {
        map.set((0, parse_util_1.normalize)(col.header), col.key);
        for (const alias of col.aliases ?? []) {
            map.set((0, parse_util_1.normalize)(alias), col.key);
        }
    }
    return map;
}
async function readSheetRows(source, columns) {
    const workbook = new exceljs_1.default.Workbook();
    try {
        if (Buffer.isBuffer(source)) {
            await workbook.xlsx.load(source);
        }
        else {
            await workbook.xlsx.readFile(source);
        }
    }
    catch {
        throw new common_1.BadRequestException('No se pudo leer el archivo. ¿Es un .xlsx válido?');
    }
    const ws = workbook.worksheets[0];
    if (!ws || ws.rowCount < 1) {
        throw new common_1.BadRequestException('El archivo no tiene datos.');
    }
    const resolver = buildHeaderResolver(columns);
    const keyByColIndex = new Map();
    ws.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const header = (0, parse_util_1.normalize)(cellToString(cell.value));
        const key = resolver.get(header);
        if (key && !Array.from(keyByColIndex.values()).includes(key)) {
            keyByColIndex.set(colNumber, key);
        }
    });
    if (keyByColIndex.size === 0) {
        throw new common_1.BadRequestException('No se reconoció ninguna columna. Descarga la plantilla de ejemplo y respeta las cabeceras.');
    }
    const rows = [];
    for (let r = 2; r <= ws.rowCount; r++) {
        const row = ws.getRow(r);
        const values = {};
        let hasData = false;
        keyByColIndex.forEach((key, colNumber) => {
            const text = cellToString(row.getCell(colNumber).value).trim();
            if (text) {
                values[key] = text;
                hasData = true;
            }
        });
        if (hasData) {
            rows.push({ rowNumber: r, values });
        }
    }
    return rows;
}
function buildWorkbook(sheetName, headers, rows) {
    const wb = new exceljs_1.default.Workbook();
    wb.creator = 'Ninetysix';
    wb.created = new Date();
    const ws = wb.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
    ws.addRow(headers);
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    headerRow.alignment = { vertical: 'middle' };
    headerRow.height = 20;
    for (const row of rows) {
        ws.addRow(row);
    }
    ws.columns.forEach((col) => {
        let max = 12;
        col.eachCell?.({ includeEmpty: false }, (cell) => {
            const len = cell.value ? String(cell.value).length : 0;
            if (len > max) {
                max = len;
            }
        });
        col.width = Math.min(max + 2, 50);
    });
    return wb;
}
async function workbookToBuffer(wb) {
    const data = await wb.xlsx.writeBuffer();
    return Buffer.from(data);
}
//# sourceMappingURL=xlsx.util.js.map