"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const database_type_1 = require("../../config/database-type");
const user_mongoose_repository_1 = require("./repositories/user.mongoose.repository");
const user_prisma_repository_1 = require("./repositories/user.prisma.repository");
const user_repository_1 = require("./repositories/user.repository");
const user_schema_1 = require("./schemas/user.schema");
const users_controller_1 = require("./users.controller");
const users_service_1 = require("./users.service");
const userRepositoryProvider = {
    provide: user_repository_1.UserRepository,
    useClass: (0, database_type_1.isMongo)() ? user_mongoose_repository_1.UserMongooseRepository : user_prisma_repository_1.UserPrismaRepository,
};
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: (0, database_type_1.isMongo)() ? [mongoose_1.MongooseModule.forFeature([{ name: user_schema_1.User.name, schema: user_schema_1.UserSchema }])] : [],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService, userRepositoryProvider],
        exports: [users_service_1.UsersService, user_repository_1.UserRepository],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map