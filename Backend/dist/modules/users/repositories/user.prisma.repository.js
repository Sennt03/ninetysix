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
exports.UserPrismaRepository = void 0;
const common_1 = require("@nestjs/common");
const role_enum_1 = require("../../../common/enums/role.enum");
const prisma_service_1 = require("../../../database/prisma/prisma.service");
let UserPrismaRepository = class UserPrismaRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                password: data.password,
                roles: this.serializeRoles(data.roles ?? [role_enum_1.Role.USER]),
            },
        });
        return this.toEntity(user);
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        return user ? this.toEntity(user) : null;
    }
    async findByEmail(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        return user ? this.toEntity(user) : null;
    }
    async findAll({ skip, limit }) {
        const users = await this.prisma.user.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
        return users.map((u) => this.toEntity(u));
    }
    count() {
        return this.prisma.user.count();
    }
    async update(id, data) {
        try {
            const user = await this.prisma.user.update({
                where: { id },
                data: {
                    ...(data.email !== undefined && { email: data.email }),
                    ...(data.username !== undefined && { username: data.username }),
                    ...(data.roles !== undefined && { roles: this.serializeRoles(data.roles) }),
                },
            });
            return this.toEntity(user);
        }
        catch {
            return null;
        }
    }
    async setRefreshTokenHash(id, hash) {
        await this.prisma.user.update({ where: { id }, data: { refreshTokenHash: hash } });
    }
    async delete(id) {
        try {
            await this.prisma.user.delete({ where: { id } });
            return true;
        }
        catch {
            return false;
        }
    }
    toEntity(user) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            password: user.password,
            roles: this.parseRoles(user.roles),
            refreshTokenHash: user.refreshTokenHash,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    serializeRoles(roles) {
        return JSON.stringify(roles);
    }
    parseRoles(raw) {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : [role_enum_1.Role.USER];
        }
        catch {
            return [role_enum_1.Role.USER];
        }
    }
};
exports.UserPrismaRepository = UserPrismaRepository;
exports.UserPrismaRepository = UserPrismaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserPrismaRepository);
//# sourceMappingURL=user.prisma.repository.js.map