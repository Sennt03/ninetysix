"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSafeUser = exports.UserEntity = void 0;
const openapi = require("@nestjs/swagger");
class UserEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, email: { required: true, type: () => String }, username: { required: true, type: () => String }, password: { required: true, type: () => String }, roles: { required: true, enum: require("../../../common/enums/role.enum").Role, isArray: true }, refreshTokenHash: { required: true, type: () => String, nullable: true }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.UserEntity = UserEntity;
const toSafeUser = (user) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    roles: user.roles,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
exports.toSafeUser = toSafeUser;
//# sourceMappingURL=user.entity.js.map