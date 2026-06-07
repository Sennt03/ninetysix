// Lectura/escritura de Excel con exceljs. La lectura mapea cada columna por su
// cabecera (canónica o alias) a la clave interna, de modo que el orden de las
// columnas en el archivo del usuario no importa.

import { BadRequestException } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { ColumnDef } from './import.constants';
import { normalize } from './parse.util';

/** Fila cruda leída: número de fila (1-based, con cabecera) + valores por clave. */
export interface RawRow {
  rowNumber: number;
  values: Record<string, string>;
}

/** Convierte el value de una celda exceljs a string plano. */
function cellToString(value: ExcelJS.CellValue): string {
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
    const v = value as unknown as Record<string, unknown>;
    if ('text' in v && typeof v.text === 'string') {
      return v.text; // hyperlink
    }
    if ('result' in v) {
      return v.result == null ? '' : String(v.result); // formula
    }
    if ('richText' in v && Array.isArray(v.richText)) {
      return (v.richText as { text: string }[]).map((p) => p.text).join('');
    }
    if ('hyperlink' in v && typeof v.hyperlink === 'string') {
      return v.hyperlink;
    }
  }
  return String(value);
}

/** Construye el mapa cabecera-normalizada -> clave interna. */
function buildHeaderResolver(columns: ColumnDef[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const col of columns) {
    map.set(normalize(col.header), col.key);
    for (const alias of col.aliases ?? []) {
      map.set(normalize(alias), col.key);
    }
  }
  return map;
}

/**
 * Lee la primera hoja de un .xlsx y devuelve las filas con datos mapeadas a las
 * claves internas según `columns`. Filas totalmente vacías se descartan.
 */
export async function readSheetRows(
  source: string | Buffer,
  columns: ColumnDef[],
): Promise<RawRow[]> {
  const workbook = new ExcelJS.Workbook();
  try {
    if (Buffer.isBuffer(source)) {
      // Cast por desajuste de tipos Buffer entre @types/node y exceljs.
      type LoadArg = Parameters<typeof workbook.xlsx.load>[0];
      await workbook.xlsx.load(source as unknown as LoadArg);
    } else {
      await workbook.xlsx.readFile(source);
    }
  } catch {
    throw new BadRequestException('No se pudo leer el archivo. ¿Es un .xlsx válido?');
  }
  const ws = workbook.worksheets[0];
  if (!ws || ws.rowCount < 1) {
    throw new BadRequestException('El archivo no tiene datos.');
  }

  const resolver = buildHeaderResolver(columns);
  const keyByColIndex = new Map<number, string>();
  ws.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const header = normalize(cellToString(cell.value));
    const key = resolver.get(header);
    if (key && !Array.from(keyByColIndex.values()).includes(key)) {
      keyByColIndex.set(colNumber, key);
    }
  });

  if (keyByColIndex.size === 0) {
    throw new BadRequestException(
      'No se reconoció ninguna columna. Descarga la plantilla de ejemplo y respeta las cabeceras.',
    );
  }

  const rows: RawRow[] = [];
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const values: Record<string, string> = {};
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

/** Crea un workbook con una hoja de datos y cabecera con estilo. */
export function buildWorkbook(
  sheetName: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
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

  // Ancho aproximado por contenido.
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

/** Serializa un workbook a Buffer. */
export async function workbookToBuffer(wb: ExcelJS.Workbook): Promise<Buffer> {
  const data = await wb.xlsx.writeBuffer();
  return Buffer.from(data);
}
