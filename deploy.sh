#!/usr/bin/env bash
#
# Despliegue por GIT PUSH (Hostinger compila el backend al recibir el push).
# Ejecútalo DESDE TU PC, en la raíz del proyecto:
#
#     bash deploy.sh "mensaje opcional del commit"
#
# Qué hace:
#   1. Compila el frontend (Angular SSR) en tu PC.
#   2. Lo copia dentro de Backend/frontend (va versionado: Hostinger NO lo compila).
#   3. Hace commit + push. Hostinger detecta el push, instala deps y hace nest build.
#
# El backend SÍ lo compila Hostinger (por eso movimos @nestjs/cli y typescript a
# dependencies). El frontend NO (lo subes ya compilado dentro del repo).
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

MSG="${1:-deploy}"
BRANCH="${DEPLOY_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"

echo "==> [1/3] Compilando frontend (Angular SSR)"
( cd Frontend && npm run build )

echo "==> [2/3] Copiando el bundle dentro del backend"
rm -rf Backend/frontend
mkdir -p Backend/frontend
cp -r Frontend/dist/Frontend/* Backend/frontend/

echo "==> [3/3] Commit + push (Hostinger desplegará solo)"
git add -A
git commit -m "$MSG" || echo "   (sin cambios que commitear)"
git push origin "$BRANCH"

echo
echo "==> Push enviado a la rama '$BRANCH'."
echo "    Mira el progreso en hPanel -> Git (o Node.js -> deployment)."
echo "    La PRIMERA vez (o al añadir migraciones), por SSH dentro de la app:"
echo "        npx prisma migrate deploy && npm run seed:prod"
