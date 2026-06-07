"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const common_1 = require("@nestjs/common");
const exceljs_1 = __importDefault(require("exceljs"));
const import_constants_1 = require("./import.constants");
const xlsx_util_1 = require("./xlsx.util");
let TemplateService = class TemplateService {
    async productsTemplate() {
        const examples = [
            {
                handle: 'serum-vitamina-c',
                name: 'Serum Vitamina C',
                description: 'Serum facial iluminador con vitamina C estable.',
                shortDescription: 'Ilumina y unifica el tono.',
                status: 'active',
                featured: 'no',
                categories: 'cuidado-facial',
                imageUrl: 'https://midominio.com/fotos/serum-1.jpg|https://midominio.com/fotos/serum-2.jpg',
                imageAlt: 'Serum Vitamina C',
                sku: 'SER-VC-30',
                price: '29.90',
                comparePrice: '39.90',
                costPrice: '12.00',
                stock: '100',
                stockPolicy: 'deny',
                weight: '120',
                active: 'sí',
                isDefault: 'sí',
            },
            {
                handle: 'camiseta-basica',
                name: 'Camiseta básica',
                description: 'Camiseta de algodón 100%.',
                status: 'active',
                categories: 'ropa|hombre',
                imageUrl: 'https://midominio.com/fotos/cam-roja.jpg',
                imageAlt: 'Camiseta básica roja',
                option1Name: 'Color',
                option1Value: 'Rojo',
                option2Name: 'Talla',
                option2Value: 'M',
                sku: 'CAM-ROJ-M',
                price: '19.99',
                stock: '20',
                color: '#FF0000',
                isDefault: 'sí',
                active: 'sí',
            },
            {
                handle: 'camiseta-basica',
                option1Name: 'Color',
                option1Value: 'Rojo',
                option2Name: 'Talla',
                option2Value: 'L',
                sku: 'CAM-ROJ-L',
                price: '19.99',
                stock: '15',
                color: '#FF0000',
                active: 'sí',
            },
        ];
        return this.build('Productos', import_constants_1.PRODUCT_COLUMNS, examples);
    }
    async categoriesTemplate() {
        const examples = [
            {
                name: 'Ropa',
                slug: 'ropa',
                description: 'Toda la ropa.',
                status: 'active',
                sortOrder: '0',
            },
            {
                name: 'Hombre',
                slug: 'hombre',
                parent: 'ropa',
                status: 'active',
                sortOrder: '1',
            },
            {
                name: 'Cuidado facial',
                slug: 'cuidado-facial',
                description: 'Serums, cremas y limpiadores.',
                imageUrl: 'https://midominio.com/fotos/cuidado.jpg',
                imageAlt: 'Cuidado facial',
                status: 'active',
            },
        ];
        return this.build('Categorías', import_constants_1.CATEGORY_COLUMNS, examples);
    }
    async build(sheetName, columns, examples) {
        const wb = new exceljs_1.default.Workbook();
        wb.creator = 'Ninetysix';
        wb.created = new Date();
        const ws = wb.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
        ws.addRow(columns.map((c) => c.header));
        this.styleHeaderRow(ws.getRow(1));
        for (const ex of examples) {
            ws.addRow(columns.map((c) => ex[c.key] ?? ''));
        }
        columns.forEach((c, i) => {
            ws.getColumn(i + 1).width = Math.min(Math.max(c.header.length + 2, 14), 45);
        });
        const info = wb.addWorksheet('Instrucciones');
        info.addRow(['Columna', 'Obligatorio', 'Descripción', 'Ejemplo']);
        this.styleHeaderRow(info.getRow(1));
        for (const c of columns) {
            info.addRow([c.header, c.required ? 'Sí' : 'No', c.help, c.example ?? '']);
        }
        info.getColumn(1).width = 22;
        info.getColumn(2).width = 12;
        info.getColumn(3).width = 80;
        info.getColumn(4).width = 40;
        info.getColumn(3).alignment = { wrapText: true, vertical: 'top' };
        return (0, xlsx_util_1.workbookToBuffer)(wb);
    }
    styleHeaderRow(row) {
        row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
        row.alignment = { vertical: 'middle' };
        row.height = 20;
    }
};
exports.TemplateService = TemplateService;
exports.TemplateService = TemplateService = __decorate([
    (0, common_1.Injectable)()
], TemplateService);
//# sourceMappingURL=template.service.js.map