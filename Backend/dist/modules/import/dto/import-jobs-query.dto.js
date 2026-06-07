"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportRowsQueryDto = exports.ImportJobsQueryDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
class ImportJobsQueryDto extends pagination_dto_1.PaginationDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { type: { required: false, type: () => Object }, search: { required: false, type: () => String } };
    }
}
exports.ImportJobsQueryDto = ImportJobsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.ImportJobType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ImportJobType),
    __metadata("design:type", String)
], ImportJobsQueryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Busca en el nombre del archivo.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportJobsQueryDto.prototype, "search", void 0);
class ImportRowsQueryDto extends pagination_dto_1.PaginationDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: false, type: () => Object } };
    }
}
exports.ImportRowsQueryDto = ImportRowsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.ImportRowStatus, description: 'Filtra por estado de fila.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ImportRowStatus),
    __metadata("design:type", String)
], ImportRowsQueryDto.prototype, "status", void 0);
//# sourceMappingURL=import-jobs-query.dto.js.map