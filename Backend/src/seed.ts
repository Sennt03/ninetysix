import 'dotenv/config';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Role } from './common/enums/role.enum';
import { UsersService } from './modules/users/users.service';

/**
 * Crea el usuario ADMIN inicial. Funciona con cualquier motor (Mongo/SQL)
 * porque pasa por UsersService -> UserRepository (la abstracción).
 *
 *   npm run seed
 *
 * Configurable por ENV: SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_USERNAME.
 */
async function seed() {
  const logger = new Logger('Seed');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const usersService = app.get(UsersService);

    const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@ninetysix.com';
    const username = process.env.SEED_ADMIN_USERNAME ?? 'admin';
    const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234!';

    const existing = await usersService.findByEmail(email.toLowerCase());
    if (existing) {
      logger.log(`El admin "${email}" ya existe. No se hace nada.`);
    } else {
      await usersService.create({ email, username, password }, [Role.ADMIN]);
      logger.log(`✅ Admin creado -> email: ${email}  password: ${password}`);
      logger.warn('Cambia la contraseña del admin tras el primer login.');
    }
  } finally {
    await app.close();
  }
}

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
