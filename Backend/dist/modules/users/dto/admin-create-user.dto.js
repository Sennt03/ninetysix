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
exports.AdminCreateUserDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const role_enum_1 = require("../../../common/enums/role.enum");
const create_user_dto_1 = require("./create-user.dto");
class AdminCreateUserDto extends create_user_dto_1.CreateUserDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { roles: { required: false, enum: require("../../../common/enums/role.enum").Role, isArray: true } };
    }
}
exports.AdminCreateUserDto = AdminCreateUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: role_enum_1.Role, isArray: true, example: [role_enum_1.Role.USER] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.IsEnum)(role_enum_1.Role, { each: true }),
    __metadata("design:type", Array)
], AdminCreateUserDto.prototype, "roles", void 0);
//# sourceMappingURL=admin-create-user.dto.js.map