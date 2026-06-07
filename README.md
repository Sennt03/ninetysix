# Ninetysix

Base full‑stack: **Backend** (NestJS) + **Frontend** (Angular 21 + Material).
Incluye autenticación (JWT access+refresh), roles (RBAC) y administración inicial de usuarios.

```
02.Ninetysix/
├── Backend/    NestJS · BD seleccionable (Mongo/SQL) · auth + RBAC · sockets opcionales
└── Frontend/   Angular 21 (zoneless, SSR por rutas) · Material · panel admin
```

## 1. Backend

```bash
cd Backend
# El .env ya viene configurado para MySQL local (BD 'ninetysix', puerto 3307).
docker compose up -d mysql     # MySQL en localhost:3307 (contenedor ninetysix_mysql)
npm install
npx prisma migrate deploy      # crea las tablas en la BD 'ninetysix'
npm run seed                   # crea el admin inicial (admin@ninetysixshop.com / admin123)
npm run start:dev              # API en http://localhost:3001/api  ·  Swagger en /docs
```

- Cambia de base de datos con **una** variable: `DATABASE_TYPE=mongodb | postgres | mysql`.
- Activa WebSockets con `ENABLE_SOCKETS=true`.
- Detalle completo en `Backend/README.md`.

## 2. Frontend

```bash
cd Frontend
npm install
npm start                      # http://localhost:4200
```

La URL del API se configura en `src/environments/environment.ts`
(`url_api`, por defecto `http://localhost:3001/api`).

> El backend ya permite CORS desde `http://localhost:4200` (variable `CORS_ORIGINS`).

## 3. Probar

1. Abre `http://localhost:4200` → te redirige a `/auth/login`.
2. Entra con `admin@ninetysixshop.com` / `admin123` (o regístrate como usuario normal).
3. Como **ADMIN** verás el menú **Usuarios**: listado paginado, editar roles y eliminar.
4. **Mi perfil** muestra `/users/me`. **Cerrar sesión** invalida el refresh token.

## 4. Arquitectura del Frontend

```
src/app/
├── core/            modelos, servicios (auth con signals, users, storage SSR-safe,
│                    notificaciones) e interceptores (token + refresh automático)
├── shared/          guards (auth/no-auth/role), material.imports, utils, diálogos
├── auth/            login + register (lazy)
└── dashboard/       layout (sidenav+toolbar por rol), home, perfil, usuarios (lazy)
```

- **SSR por rutas**: `auth` y el panel se renderizan en cliente (SPA); el resto
  (`**`) queda en modo Server, listo para módulos públicos (tienda/productos).
  Se configura en `src/app/app.routes.server.ts`.
- Sesión persistida y reactiva con **signals**; el interceptor renueva el access
  token automáticamente ante un 401 usando el refresh token.
