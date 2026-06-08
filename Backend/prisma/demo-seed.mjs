/**
 * Datos de muestra para la portada (categorías + productos destacados).
 * Idempotente: usa upsert por slug. Borrar con: node prisma/demo-seed.mjs --clean
 * Las imágenes son placeholders (picsum); reemplázalas desde el panel admin.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const img = (seed, w = 800, h = 1000) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const CATEGORIES = [
  { name: 'Acid Wash', slug: 'acid-wash' },
  { name: 'Boxy Fit', slug: 'boxy-fit' },
  { name: 'Oversized', slug: 'oversized' },
  { name: 'Hoodies', slug: 'hoodies' },
  { name: 'Joggers', slug: 'joggers' },
  { name: 'Cargo Pants', slug: 'cargo-pants' },
];

const PRODUCTS = [
  { name: 'Acid Wash Hoodie', slug: 'acid-wash-hoodie', price: 189, compare: 239, color: '#3a3a3a', cat: 'acid-wash' },
  { name: 'Boxy Fit Tee SS26', slug: 'boxy-fit-tee-ss26', price: 79, color: '#0f0f0f', cat: 'boxy-fit' },
  { name: 'Cargo Pants Urban Tech', slug: 'cargo-pants-urban-tech', price: 159, color: '#4b4b3a', cat: 'cargo-pants' },
  { name: 'SS26 Set · Hoodie + Jogger', slug: 'ss26-set-hoodie-jogger', price: 279, compare: 329, color: '#1c1c1c', cat: 'hoodies' },
  { name: 'Oversized Tech Jacket', slug: 'oversized-tech-jacket', price: 229, color: '#202020', cat: 'oversized' },
  { name: 'Relaxed Cargo Jogger', slug: 'relaxed-cargo-jogger', price: 139, color: '#2e2e26', cat: 'joggers' },
  { name: 'Heavyweight Box Hoodie', slug: 'heavyweight-box-hoodie', price: 199, compare: 249, color: '#111', cat: 'hoodies' },
  { name: 'Faded Street Tee', slug: 'faded-street-tee', price: 69, color: '#5a5a5a', cat: 'boxy-fit' },
];

async function clean() {
  await prisma.productImage.deleteMany({ where: { product: { slug: { in: PRODUCTS.map((p) => p.slug) } } } });
  await prisma.variant.deleteMany({ where: { product: { slug: { in: PRODUCTS.map((p) => p.slug) } } } });
  await prisma.product.deleteMany({ where: { slug: { in: PRODUCTS.map((p) => p.slug) } } });
  await prisma.mediaAsset.deleteMany({ where: { filename: { startsWith: 'demo-' } } });
  await prisma.category.deleteMany({ where: { slug: { in: CATEGORIES.map((c) => c.slug) } } });
  console.log('Demo data eliminada.');
}

async function seed() {
  const catBySlug = new Map();
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { imageUrl: img(`cat-${c.slug}`, 800, 800), imageAlt: c.name, status: 'active', sortOrder: i },
      create: {
        name: c.name, slug: c.slug, status: 'active', sortOrder: i,
        imageUrl: img(`cat-${c.slug}`, 800, 800), imageAlt: c.name,
      },
    });
    catBySlug.set(c.slug, cat.id);
  }

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: { featured: true, status: 'active' } });
      continue;
    }
    const asset = await prisma.mediaAsset.create({
      data: {
        filename: `demo-${p.slug}.jpg`, originalName: `${p.name}.jpg`,
        url: img(`prod-${p.slug}`, 800, 1000), thumbnailUrl: img(`prod-${p.slug}`, 500, 625),
        mimeType: 'image/jpeg', sizeBytes: 100000, width: 800, height: 1000,
      },
    });
    await prisma.product.create({
      data: {
        name: p.name, slug: p.slug, status: 'active', featured: true, sortOrder: i,
        shortDescription: 'Edición limitada Ninetysix.',
        categories: { connect: { id: catBySlug.get(p.cat) } },
        images: { create: { assetId: asset.id, altText: p.name, isCover: true, sortOrder: 0 } },
        variants: {
          create: {
            sku: `DEMO-${p.slug}`.toUpperCase(), price: p.price,
            comparePrice: p.compare ?? null, stock: 25, stockPolicy: 'deny',
            color: p.color, isDefault: true, active: true, sortOrder: 0,
          },
        },
      },
    });
  }
  const cats = await prisma.category.count({ where: { status: 'active' } });
  const feats = await prisma.product.count({ where: { status: 'active', featured: true } });
  console.log(`Demo data lista. Categorías activas: ${cats} · Productos destacados: ${feats}`);
}

const run = process.argv.includes('--clean') ? clean : seed;
run()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
