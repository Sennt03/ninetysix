import ExcelJS from 'exceljs';
import { ColumnDef } from './import.constants';
export interface RawRow {
    rowNumber: number;
    values: Record<string, string>;
}
export declare function readSheetRows(source: string | Buffer, columns: ColumnDef[]): Promise<RawRow[]>;
export declare function buildWorkbook(sheetName: string, headers: string[], rows: (string | number | null | undefined)[][]): ExcelJS.Workbook;
export declare function workbookToBuffer(wb: ExcelJS.Workbook): Promise<Buffer>;
