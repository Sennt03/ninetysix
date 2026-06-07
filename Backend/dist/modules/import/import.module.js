"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportModule = void 0;
const common_1 = require("@nestjs/common");
const categories_module_1 = require("../categories/categories.module");
const media_module_1 = require("../media/media.module");
const products_module_1 = require("../products/products.module");
const category_import_service_1 = require("./category-import.service");
const export_service_1 = require("./export.service");
const image_import_service_1 = require("./image-import.service");
const import_controller_1 = require("./import.controller");
const import_jobs_service_1 = require("./import-jobs.service");
const import_worker_service_1 = require("./import-worker.service");
const product_import_service_1 = require("./product-import.service");
const template_service_1 = require("./template.service");
let ImportModule = class ImportModule {
};
exports.ImportModule = ImportModule;
exports.ImportModule = ImportModule = __decorate([
    (0, common_1.Module)({
        imports: [media_module_1.MediaModule, products_module_1.ProductsModule, categories_module_1.CategoriesModule],
        controllers: [import_controller_1.ImportController],
        providers: [
            import_jobs_service_1.ImportJobsService,
            import_worker_service_1.ImportWorkerService,
            product_import_service_1.ProductImportService,
            category_import_service_1.CategoryImportService,
            image_import_service_1.ImageImportService,
            template_service_1.TemplateService,
            export_service_1.ExportService,
        ],
    })
], ImportModule);
//# sourceMappingURL=import.module.js.map