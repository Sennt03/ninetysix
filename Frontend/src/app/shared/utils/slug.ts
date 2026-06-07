/**
 * Genera un slug desde un texto: minúsculas, sin tildes (á→a, ñ→n), espacios
 * y caracteres especiales a guiones, sin guiones dobles ni en los extremos.
 * Misma lógica que el backend (slug.util.ts).
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}
