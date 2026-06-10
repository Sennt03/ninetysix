"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    const apiPrefix = config.get('apiPrefix', { infer: true });
    app.setGlobalPrefix(apiPrefix);
    const uploadDir = (0, node_path_1.resolve)(config.get('uploads.dir', { infer: true }));
    app.useStaticAssets(uploadDir, {
        prefix: '/uploads',
        maxAge: '30d',
        immutable: true,
    });
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.enableCors({
        origin: config.get('corsOrigins', { infer: true }),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.enableShutdownHooks();
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Nest API Base')
        .setDescription('Auth JWT + refresh + RBAC · BD seleccionable (Mongo/SQL) · sockets opcionales')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    if (process.env.SERVE_FRONTEND === 'true') {
        const entry = process.env.FRONTEND_SSR_ENTRY ??
            (0, node_path_1.resolve)(__dirname, 'frontend/server/server.mjs');
        try {
            const importEsm = new Function('p', 'return import(p)');
            const { reqHandler } = await importEsm((0, node_url_1.pathToFileURL)(entry).href);
            const passthrough = [`/${apiPrefix}`, '/docs', '/uploads'];
            app.use((req, res, next) => {
                const path = req.path;
                if (passthrough.some((p) => path === p || path.startsWith(`${p}/`))) {
                    return next();
                }
                return reqHandler(req, res, next);
            });
            logger.log(`Front -> SSR Angular servido desde ${entry}`);
        }
        catch (err) {
            logger.error(`No se pudo cargar el SSR del frontend (${entry}); la API sigue activa.`, err);
        }
    }
    const port = config.get('port', { infer: true });
    await app.listen(port);
    logger.log(`API  -> http://localhost:${port}/${apiPrefix}`);
    logger.log(`Docs -> http://localhost:${port}/docs`);
    logger.log(`DB   -> ${config.get('database.type', { infer: true })}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map