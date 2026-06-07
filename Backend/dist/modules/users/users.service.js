"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const role_enum_1 = require("../../common/enums/role.enum");
const user_entity_1 = require("./entities/user.entity");
const user_repository_1 = require("./repositories/user.repository");
let UsersService = class UsersService {
    constructor(userRepository, configService) {
        this.userRepository = userRepository;
        this.configService = configService;
    }
    async create(dto, roles = [role_enum_1.Role.USER]) {
        const existing = await this.userRepository.findByEmail(dto.email);
        if (existing) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const saltRounds = this.configService.get('bcryptSaltRounds', { infer: true });
        const password = await bcrypt.hash(dto.password, saltRounds);
        return this.userRepository.create({
            email: dto.email,
            username: dto.username,
            password,
            roles,
        });
    }
    findByEmail(email) {
        return this.userRepository.findByEmail(email);
    }
    findById(id) {
        return this.userRepository.findById(id);
    }
    async findByIdOrFail(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        return user;
    }
    async getProfile(id) {
        return (0, user_entity_1.toSafeUser)(await this.findByIdOrFail(id));
    }
    async findAll(pagination) {
        const { page, limit, skip } = pagination;
        const [items, total] = await Promise.all([
            this.userRepository.findAll({ skip, limit }),
            this.userRepository.count(),
        ]);
        return {
            items: items.map(user_entity_1.toSafeUser),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
        };
    }
    async update(id, dto) {
        if (dto.email) {
            const owner = await this.userRepository.findByEmail(dto.email);
            if (owner && owner.id !== id) {
                throw new common_1.ConflictException('El email ya está registrado');
            }
        }
        const updated = await this.userRepository.update(id, dto);
        if (!updated) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        return (0, user_entity_1.toSafeUser)(updated);
    }
    async remove(id) {
        const deleted = await this.userRepository.delete(id);
        if (!deleted) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
    }
    setRefreshTokenHash(id, hash) {
        return this.userRepository.setRefreshTokenHash(id, hash);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map