export interface ColumnDef {
    key: string;
    header: string;
    aliases?: string[];
    required?: boolean;
    help: string;
    example?: string;
}
export declare const LIMITS: {
    readonly xlsxBytes: number;
    readonly maxRows: 50000;
    readonly previewCap: 200;
    readonly zipBytes: number;
    readonly maxImages: 500;
    readonly imageBytes: number;
};
export declare const PRODUCT_COLUMNS: ColumnDef[];
export declare const CATEGORY_COLUMNS: ColumnDef[];
