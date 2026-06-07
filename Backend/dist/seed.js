"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const role_enum_1 = require("./common/enums/role.enum");
const users_service_1 = require("./modules/users/users.service");
async function seed() {
    const logger = new common_1.Logger('Seed');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    try {
        const usersService = app.get(users_service_1.UsersService);
        const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@ninetysix.com';
        const username = process.env.SEED_ADMIN_USERNAME ?? 'admin';
        const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234!';
        const existing = await usersService.findByEmail(email.toLowerCase());
        if (existing) {
            logger.log(`El admin "${email}" ya existe. No se hace nada.`);
        }
        else {
            await usersService.create({ email, username, password }, [role_enum_1.Role.ADMIN]);
            logger.log(`✅ Admin creado -> email: ${email}  password: ${password}`);
            logger.warn('Cambia la contraseña del admin tras el primer login.');
        }
    }
    finally {
        await app.close();
    }
}
seed().catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map