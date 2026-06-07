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
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.envValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().port().default(3000),
    API_PREFIX: Joi.string().default('api/v1'),
    CORS_ORIGINS: Joi.string().default('*'),
    DATABASE_TYPE: Joi.string().valid('mongodb', 'postgres', 'mysql').default('mongodb'),
    MONGODB_URI: Joi.string().when('DATABASE_TYPE', {
        is: 'mongodb',
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    DATABASE_URL: Joi.string().when('DATABASE_TYPE', {
        is: Joi.valid('postgres', 'mysql'),
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    JWT_ACCESS_SECRET: Joi.string().min(16).required(),
    JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
    JWT_REFRESH_SECRET: Joi.string().min(16).required(),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
    BCRYPT_SALT_ROUNDS: Joi.number().min(4).max(15).default(10),
    ENABLE_SOCKETS: Joi.boolean().default(false),
    THROTTLE_TTL: Joi.number().default(60000),
    THROTTLE_LIMIT: Joi.number().default(100),
    UPLOAD_DIR: Joi.string().default('./uploads'),
    PUBLIC_URL: Joi.string().optional(),
});
//# sourceMappingURL=env.validation.js.map