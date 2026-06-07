# Nest API Base

Base de API **robusta y lista para producción** en NestJS, pensada para arrancar proyectos rápido con buenas decisiones de arquitectura ya tomadas.

- 🔐 **Auth completa**: register / login / refresh / logout, **JWT access + refresh token** (con rotación), hashing con bcrypt.
- 👮 **RBAC**: roles (`USER`, `ADMIN`) con `@Roles()` + guard global.
- 🗄️ **Base de datos seleccionable por ENV**: MongoDB (Mongoose) o SQL (PostgreSQL/MySQL con Prisma), gracias a un **patrón repositorio**. Los servicios no saben qué motor hay debajo.
- 🔌 **Sockets opcionales** (Socket.IO) activables con una variable de entorno, con autenticación JWT en el handshake.
- ✅ **Validación declarativa** con `class-validator` + `ValidationPipe` global.
- 🧱 **Respuestas y errores uniformes** mediante interceptor y exception filter globales.
- 📚 **Swagger** en `/docs`, **rate-limiting**, **helmet**, **CORS** configurable, healthcheck y **tests e2e**.

---

## 1. Requisitos

- Node 18+ (probado en Node 20)
- Una base de datos según lo que elijas:
  - MongoDB, **o**
  - PostgreSQL / MySQL
- (Opcional) Docker para levantar la BD con el `docker-compose.yml` incluido.

## 2. Puesta en marcha

```bash
# 1. Instalar dependencias (genera el cliente Prisma automáticamente)
npm install

# 2. Crear tu .env a partir del ejemplo
cp .env.example .env
#    edita los secretos JWT y elige DATABASE_TYPE

# 3a. (Opcional) levantar la BD con Docker
docker compose up -d mongo        # si DATABASE_TYPE=mongodb
# docker compose up -d postgres   # si DATABASE_TYPE=postgres

# 3b. Si usas SQL (Prisma), crea las tablas
npm run prisma:migrate            # solo postgres/mysql

# 4. Arrancar en desarrollo
npm run start:dev
```

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/docs`
- Health: `http://localhost:3000/api/v1/health`

## 3. Elegir la base de datos

Todo se controla con **una sola variable**: `DATABASE_TYPE`.

| `DATABASE_TYPE` | Motor       | ORM/ODM  | Variable de conexión |
| --------------- | ----------- | -------- | -------------------- |
| `mongodb`       | MongoDB     | Mongoose | `MONGODB_URI`        |
| `postgres`      | PostgreSQL  | Prisma   | `DATABASE_URL`       |
| `mysql`         | MySQL       | Prisma   | `DATABASE_URL`       |

Cómo funciona por dentro:

```
UserRepository (clase abstracta = contrato)
   ├── UserMongooseRepository   (se inyecta si DATABASE_TYPE=mongodb)
   └── UserPrismaRepository     (se inyecta si DATABASE_TYPE=postgres|mysql)
```

`DatabaseModule.forRoot()` abre la conexión del motor elegido y cada módulo de
feature provee la implementación de repositorio correcta. **El service siempre
inyecta `UserRepository`**, nunca Mongoose ni Prisma → cambiar de BD es cambiar
una variable.

> **MySQL + Prisma:** en `prisma/schema.prisma` cambia `provider = "mysql"`.
> Además, los arrays de enum (`roles Role[]`) solo existen en PostgreSQL; en
> MySQL sustituye ese campo por `role String @default("USER")` (o una tabla de
> roles) y ajusta el mapeo en `user.prisma.repository.ts`.

## 4. Activar los WebSockets

```env
ENABLE_SOCKETS=true
```

Al activarlo se carga `RealtimeModule` (`src/realtime/`). El `AppGateway`
autentica cada conexión con el access token (en `handshake.auth.token` o en la
cabecera `Authorization`) y mete a cada usuario en una sala privada
`user:<id>`. Cliente de ejemplo:

```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000', { auth: { token: accessToken } });
socket.emit('ping', { hola: 'mundo' }, (res) => console.log(res));
socket.on('presence:update', (p) => console.log('online:', p.online));
```

## 5. Endpoints incluidos

| Método | Ruta                  | Auth        | Descripción                          |
| ------ | --------------------- | ----------- | ------------------------------------ |
| POST   | `/auth/register`      | público     | Crea usuario y devuelve tokens       |
| POST   | `/auth/login`         | público     | Inicia sesión                        |
| POST   | `/auth/refresh`       | refresh JWT | Rota access + refresh token          |
| POST   | `/auth/logout`        | access JWT  | Invalida el refresh token            |
| GET    | `/auth/me`            | access JWT  | Datos del token actual               |
| GET    | `/users/me`           | access JWT  | Perfil (recargado de BD)             |
| GET    | `/users`              | ADMIN       | Listado paginado                     |
| GET    | `/users/:id`          | ADMIN       | Detalle                              |
| PATCH  | `/users/:id`          | ADMIN       | Actualiza email/username             |
| DELETE | `/users/:id`          | ADMIN       | Elimina                              |
| GET    | `/health`             | público     | Estado del servicio                  |

Formato de respuesta (interceptor global):

```json
{ "success": true, "statusCode": 200, "data": { ... }, "timestamp": "..." }
```

Formato de error (exception filter global):

```json
{ "success": false, "statusCode": 401, "error": "UnauthorizedException", "message": "Credenciales inválidas", "path": "/api/v1/auth/login", "timestamp": "..." }
```

## 6. Estructura

```
src/
├── main.ts                  # bootstrap: helmet, CORS, ValidationPipe, Swagger
├── app.module.ts            # ensamblado + guards/filtros/interceptores globales
├── app.controller.ts        # healthcheck
├── config/                  # configuración tipada + validación de ENV (Joi)
├── common/                  # piezas transversales reutilizables
│   ├── decorators/          # @Public, @Roles, @CurrentUser
│   ├── guards/              # RolesGuard, HttpThrottlerGuard
│   ├── filters/             # AllExceptionsFilter
│   ├── interceptors/        # Transform + Logging
│   ├── dto/                 # PaginationDto
│   └── enums / interfaces
├── database/                # selección de motor (Mongoose | Prisma)
├── modules/
│   ├── users/               # entidad de dominio + repos (mongo/prisma) + CRUD
│   └── auth/                # estrategias, guards, service, controller
└── realtime/                # gateway Socket.IO (opcional)
```

## 7. Scripts

| Script                   | Qué hace                                  |
| ------------------------ | ----------------------------------------- |
| `npm run start:dev`      | Desarrollo con recarga                    |
| `npm run build`          | Compila a `dist/`                         |
| `npm run start:prod`     | Ejecuta `dist/main`                       |
| `npm run lint`           | ESLint + fix                              |
| `npm test`               | Tests unitarios                           |
| `npm run test:e2e`       | Tests e2e (MongoDB en memoria)            |
| `npm run prisma:migrate` | Migraciones Prisma (solo SQL)             |
| `npm run prisma:studio`  | GUI de Prisma (solo SQL)                  |

## 8. Variables de entorno

Ver `.env.example`. Se **validan al arrancar** (`src/config/env.validation.ts`):
si falta un secreto JWT o la URI de BD del motor elegido, la app no arranca y
te dice exactamente qué falta.

## 9. Cómo extender

Para un nuevo recurso (p. ej. `products`):

1. Crea `modules/products/` con `entities/`, `repositories/` (abstracta + mongo + prisma), `dto/`, `service`, `controller`, `module`.
2. En el módulo, replica el `userRepositoryProvider` (provider condicional por `isMongo()`).
3. Protege rutas con `@Roles(...)` y/o márcalas `@Public()`.
4. Añade el modelo a `prisma/schema.prisma` (SQL) y/o un schema Mongoose.

> Sugerencia: el módulo `users` sirve de plantilla copia-pega para cualquier recurso.
```
