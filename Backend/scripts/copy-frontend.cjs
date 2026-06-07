// Tras 'nest build', copia DENTRO de dist/ lo que Hostinger NO despliega por su
// cuenta (solo sube la carpeta dist). Así llega al servidor:
//   - dist/frontend : bundle del Angular SSR (lo carga main.js en producción)
//   - dist/prisma   : schema + migraciones (para 'prisma migrate deploy' en el server)
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const copies = [
  ['frontend', 'dist/frontend'],
  ['prisma', 'dist/prisma'],
];

for (const [from, to] of copies) {
  const src = path.join(root, from);
  const dest = path.join(root, to);
  if (!fs.existsSync(src)) {
    console.warn(`[copy] omito "${from}" (no existe)`);
    continue;
  }
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log(`[copy] ${from} -> ${to}`);
}
