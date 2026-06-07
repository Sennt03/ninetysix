"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseCorsOrigins = (raw) => {
    if (!raw || raw.trim() === '*')
        return true;
    return raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
};
exports.default = () => ({
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api/v1',
    corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
    database: {
        type: process.env.DATABASE_TYPE ?? 'mongodb',
        mongoUri: process.env.MONGODB_URI,
        url: process.env.DATABASE_URL,
    },
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    },
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10),
    enableSockets: process.env.ENABLE_SOCKETS === 'true',
    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
    },
    uploads: {
        dir: process.env.UPLOAD_DIR ?? './uploads',
        publicUrl: process.env.PUBLIC_URL ?? `http://localhost:${parseInt(process.env.PORT ?? '3000', 10)}`,
    },
});
//# sourceMappingURL=configuration.js.map