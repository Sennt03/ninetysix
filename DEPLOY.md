# Despliegue en Hostinger — UNA app, deploy por git push

El backend NestJS sirve **también** la tienda (Angular SSR). Reparto del trabajo:

- **El frontend lo compilas tú** en tu PC y va versionado dentro de `Backend/frontend/`
  (Hostinger no sabe compilar Angular y se quedaría sin RAM).
- **El backend lo compila Hostinger** al recibir el push (por eso `@nestjs/cli` y
  `typescript` están en `dependencies`: así el `nest build` automático funciona).

URLs en producción:
- Tienda (SSR): `https://ninetysixshop.com/`
- API: `https://ninetysixshop.com/api/...`
- Swagger: `https://ninetysixshop.com/docs`
- Imágenes: `https://ninetysixshop.com/uploads/...`

> No necesitas subdominio.

---

## Parte 1 — Una sola vez en Hostinger (hPanel)

### 1.1 Base de datos MySQL
hPanel → **Bases de datos → MySQL** → crea BD y usuario. Apunta host, nombre,
usuario y clave (para `DATABASE_URL`). El host suele ser `localhost`.

### 1.2 Dominio y SSL
Apunta `ninetysixshop.com` a Hostinger y activa **SSL** (hPanel → SSL).

### 1.3 Node.js app + Git
- **Node.js app**: Node 20.x, *startup file* = `dist/main.js`, *Application URL* =
  `ninetysixshop.com`. Apunta la ruta del *Application root* (= `APP_PATH`).
- **Git**: conecta tu repo y la rama que uses (ej. `master`) con **Auto-Deployment ON**.
  (Ahora sí funciona: el `npm install` + `nest build` automático compila el backend.)

### 1.4 Crear el `.env` en el servidor
Dentro de `APP_PATH` crea un archivo **`.env`** (por SSH o File Manager). Lo leen
la app y el `prisma migrate`. Mínimo:
```
NODE_ENV=production
SERVE_FRONTEND=true
API_PREFIX=api
DATABASE_TYPE=mysql
DATABASE_URL=mysql://USUARIO:CLAVE@localhost:3306/NOMBRE_BD
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
PUBLIC_URL=https://ninetysixshop.com
```
Genera los secretos: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

> Si el dominio no es `ninetysixshop.com`, cámbialo en
> `Frontend/src/environments/environment.production.ts` y en
> `Frontend/angular.json` → `security.allowedHosts`.

---

## Parte 2 — Desplegar (cada vez)

Desde tu PC, en la raíz del proyecto:
```bash
bash deploy.sh "lo que cambiaste"
```
Eso compila el frontend, lo mete en `Backend/frontend/`, hace commit y push.
Hostinger detecta el push, instala dependencias y compila el backend
automáticamente. Mira el progreso en hPanel → Git.

> Si prefieres a mano: `cd Frontend && npm run build`, copia `dist/Frontend/*` a
> `Backend/frontend/`, y `git add -A && git commit -m "..." && git push`.

---

## Parte 3 — Primer arranque (una vez) y migraciones
Hostinger NO ejecuta migraciones. Por SSH, dentro de `APP_PATH`:
```bash
npx prisma migrate deploy   # crea/actualiza tablas (repetir solo si añades migraciones)
npm run seed:prod           # crea el admin (solo la primera vez)
```
Si el backend no se reinicia solo tras el deploy: hPanel → Node.js → **Restart**
(o `mkdir -p tmp && touch tmp/restart.txt`).

---

## Checklist
- [ ] `https://ninetysixshop.com/` carga la tienda; "ver código fuente" trae HTML con
      contenido (SSR ok, no `<app-root></app-root>` vacío).
- [ ] `https://ninetysixshop.com/api/...` responde y `/docs` muestra Swagger.
- [ ] Login del panel funciona.
- [ ] Imágenes de `/uploads` cargan.

## Notas
- El bundle del frontend (`Backend/frontend/`) va **versionado** a propósito.
  Recuérdalo: tras tocar el frontend, hay que recompilarlo (lo hace `deploy.sh`).
- `uploads` persiste en `Backend/uploads`; el deploy no lo borra.
- El `.env` con secretos vive solo en el servidor (no en el repo).
