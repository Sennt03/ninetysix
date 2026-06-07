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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const throttler_guard_1 = require("./common/guards/throttler.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const configuration_1 = __importDefault(require("./config/configuration"));
const database_type_1 = require("./config/database-type");
const env_validation_1 = require("./config/env.validation");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const categories_module_1 = require("./modules/categories/categories.module");
const jwt_auth_guard_1 = require("./modules/auth/guards/jwt-auth.guard");
const import_module_1 = require("./modules/import/import.module");
const media_module_1 = require("./modules/media/media.module");
const products_module_1 = require("./modules/products/products.module");
const storefront_module_1 = require("./modules/storefront/storefront.module");
const users_module_1 = require("./modules/users/users.module");
const realtime_module_1 = require("./realtime/realtime.module");
const optionalModules = process.env.ENABLE_SOCKETS === 'true' ? [realtime_module_1.RealtimeModule] : [];
const catalogModules = (0, database_type_1.isSql)()
    ? [media_module_1.MediaModule, categories_module_1.CategoriesModule, products_module_1.ProductsModule, import_module_1.ImportModule, storefront_module_1.StorefrontModule]
    : [];
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                validationSchema: env_validation_1.envValidationSchema,
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    throttlers: [
                        {
                            ttl: config.get('throttle.ttl', { infer: true }),
                            limit: config.get('throttle.limit', { infer: true }),
                        },
                    ],
                }),
            }),
            database_module_1.DatabaseModule.forRoot(),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            ...catalogModules,
            ...optionalModules,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
            { provide: core_1.APP_GUARD, useClass: throttler_guard_1.HttpThrottlerGuard },
            { provide: core_1.APP_FILTER, useClass: all_exceptions_filter_1.AllExceptionsFilter },
            { provide: core_1.APP_INTERCEPTOR, useClass: logging_interceptor_1.LoggingInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: transform_interceptor_1.TransformInterceptor },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map