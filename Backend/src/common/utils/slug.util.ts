/**
 * Normaliza un texto a slug: minúsculas, sin tildes (á→a, ñ→n), espacios y
 * caracteres especiales a guiones, sin guiones dobles ni en los extremos.
 *   "Ropa de Hombre" -> "ropa-de-hombre"
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD') // separa los acentos de la letra base
    .replace(/\p{Diacritic}/gu, '') // elimina los diacríticos (tildes, etc.)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // todo lo no alfanumérico -> guion
    .replace(/-{2,}/g, '-') // colapsa guiones repetidos
    .replace(/^-+|-+$/g, ''); // quita guiones de los extremos
}

/**
 * Dado un slug base y una función que comprueba si ya existe, devuelve uno
 * único añadiendo sufijos -2, -3, ... hasta encontrar hueco.
 */
export async function uniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || 'item';
  let candidate = root;
  let n = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${n}`;
    n += 1;
  }
  return candidate;
}
