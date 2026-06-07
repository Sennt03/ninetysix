"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = slugify;
exports.uniqueSlug = uniqueSlug;
function slugify(input) {
    return input
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '');
}
async function uniqueSlug(base, exists) {
    const root = slugify(base) || 'item';
    let candidate = root;
    let n = 2;
    while (await exists(candidate)) {
        candidate = `${root}-${n}`;
        n += 1;
    }
    return candidate;
}
//# sourceMappingURL=slug.util.js.map