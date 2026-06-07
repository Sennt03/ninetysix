// Definición de columnas y límites de la carga masiva.
// Fuente: requerimientos/04.carga_masiva.md §2 y §3.
// Las cabeceras canónicas (header) se usan en la plantilla y la exportación;
// los `aliases` permiten aceptar variantes (Shopify en inglés, sin tildes, etc.).

export interface ColumnDef {
  /** Clave interna del campo. */
  key: string;
  /** Cabecera canónica que se escribe en plantillas/export. */
  header: string;
  /** Otras cabeceras aceptadas al leer (normalizadas: sin tildes, minúsculas). */
  aliases?: string[];
  /** Requerido a nivel estructural (se valida en el parseo). */
  required?: boolean;
  /** Texto de ayuda para la hoja "Instrucciones" / diálogo del front. */
  help: string;
  /** Valor de ejemplo para la plantilla. */
  example?: string;
}

// --- Límites (coinciden con la spec y con media) ---
export const LIMITS = {
  xlsxBytes: 10 * 1024 * 1024, // 10 MB
  maxRows: 50_000,
  previewCap: 200, // filas devueltas en el preview
  zipBytes: 50 * 1024 * 1024, // 50 MB
  maxImages: 500,
  imageBytes: 5 * 1024 * 1024, // 5 MB por imagen
} as const;

export const PRODUCT_COLUMNS: ColumnDef[] = [
  {
    key: 'handle',
    header: 'Handle',
    aliases: ['handle', 'codigo', 'code', 'identificador'],
    required: true,
    help: 'Código único que agrupa las filas de un mismo producto. Si el producto ya existe (mismo slug), se actualiza; si no, se crea.',
    example: 'camiseta-basica',
  },
  {
    key: 'name',
    header: 'Nombre',
    aliases: ['nombre', 'title', 'nombre del producto', 'producto'],
    help: 'Nombre del producto. Obligatorio en la primera fila de cada Handle. Máx 255.',
    example: 'Camiseta básica',
  },
  {
    key: 'slug',
    header: 'Slug',
    aliases: ['slug', 'url'],
    help: 'URL amigable (a-z, 0-9, guiones). Si se deja vacío se genera desde el Handle/Nombre.',
    example: 'camiseta-basica',
  },
  {
    key: 'description',
    header: 'Descripción',
    aliases: ['descripcion', 'body', 'body html', 'descripcion larga', 'descripción larga'],
    help: 'Descripción larga. Admite HTML. Solo se lee de la primera fila del Handle.',
    example: 'Camiseta de algodón 100%.',
  },
  {
    key: 'shortDescription',
    header: 'Descripción corta',
    aliases: ['descripcion corta', 'resumen'],
    help: 'Resumen breve para listados. Máx 500.',
    example: 'Algodón suave, corte regular.',
  },
  {
    key: 'status',
    header: 'Estado',
    aliases: ['estado', 'status'],
    help: 'active, draft o archived (también vale activo/borrador/archivado). Por defecto: draft.',
    example: 'active',
  },
  {
    key: 'featured',
    header: 'Destacado',
    aliases: ['destacado', 'featured'],
    help: 'sí/no. Marca el producto como destacado.',
    example: 'no',
  },
  {
    key: 'categories',
    header: 'Categorías',
    aliases: ['categorias', 'categoria', 'category', 'categories'],
    help: 'Slugs de categoría separados por |. Deben existir previamente.',
    example: 'ropa|hombre',
  },
  {
    key: 'metaTitle',
    header: 'Meta título',
    aliases: ['meta titulo', 'meta título', 'titulo seo', 'título seo', 'seo title'],
    help: 'Título SEO. Máx 255.',
    example: 'Camiseta básica de algodón',
  },
  {
    key: 'metaDescription',
    header: 'Meta descripción',
    aliases: ['meta descripcion', 'meta descripción', 'descripcion seo', 'descripción seo'],
    help: 'Descripción SEO. Máx 500.',
    example: 'Compra la camiseta básica…',
  },
  {
    key: 'imageUrl',
    header: 'Imagen URL',
    aliases: ['imagen url', 'image src', 'imagen', 'imagenes', 'imágenes', 'fotos'],
    help: 'URL(s) de imagen. Varias separadas por |, o repite filas con el mismo Handle. La primera imagen del producto es la portada.',
    example: 'https://midominio.com/fotos/cam-1.jpg|https://midominio.com/fotos/cam-2.jpg',
  },
  {
    key: 'imageAlt',
    header: 'Imagen Alt',
    aliases: ['imagen alt', 'image alt', 'alt'],
    help: 'Texto alternativo de la(s) imagen(es) de esa fila.',
    example: 'Camiseta básica blanca',
  },
  {
    key: 'option1Name',
    header: 'Opción1 Nombre',
    aliases: ['opcion1 nombre', 'opción1 nombre', 'option1 name'],
    help: 'Nombre del primer tipo de opción (ej: Color). Deja vacías las columnas de opción para productos simples.',
    example: 'Color',
  },
  {
    key: 'option1Value',
    header: 'Opción1 Valor',
    aliases: ['opcion1 valor', 'opción1 valor', 'option1 value'],
    help: 'Valor del primer tipo de opción (ej: Rojo).',
    example: 'Rojo',
  },
  {
    key: 'option2Name',
    header: 'Opción2 Nombre',
    aliases: ['opcion2 nombre', 'opción2 nombre', 'option2 name'],
    help: 'Nombre del segundo tipo de opción (ej: Talla).',
    example: 'Talla',
  },
  {
    key: 'option2Value',
    header: 'Opción2 Valor',
    aliases: ['opcion2 valor', 'opción2 valor', 'option2 value'],
    help: 'Valor del segundo tipo de opción (ej: M).',
    example: 'M',
  },
  {
    key: 'option3Name',
    header: 'Opción3 Nombre',
    aliases: ['opcion3 nombre', 'opción3 nombre', 'option3 name'],
    help: 'Nombre del tercer tipo de opción.',
    example: '',
  },
  {
    key: 'option3Value',
    header: 'Opción3 Valor',
    aliases: ['opcion3 valor', 'opción3 valor', 'option3 value'],
    help: 'Valor del tercer tipo de opción.',
    example: '',
  },
  {
    key: 'sku',
    header: 'SKU',
    aliases: ['sku', 'variant sku'],
    help: 'Código SKU de la variante. Único si se indica.',
    example: 'CAM-ROJ-M',
  },
  {
    key: 'price',
    header: 'Precio',
    aliases: ['precio', 'variant price', 'price'],
    required: true,
    help: 'Precio de la variante (decimal ≥ 0). Obligatorio en cada variante.',
    example: '19.99',
  },
  {
    key: 'comparePrice',
    header: 'Precio comparado',
    aliases: ['precio comparado', 'variant compare price', 'compare price', 'precio anterior'],
    help: 'Precio tachado (debe ser mayor que el precio).',
    example: '24.99',
  },
  {
    key: 'costPrice',
    header: 'Costo',
    aliases: ['costo', 'precio de costo', 'cost'],
    help: 'Precio de costo (uso interno, nunca público).',
    example: '8.50',
  },
  {
    key: 'stock',
    header: 'Stock',
    aliases: ['stock', 'variant stock', 'inventario', 'existencias'],
    help: 'Unidades en stock (entero ≥ 0). Por defecto 0.',
    example: '50',
  },
  {
    key: 'stockPolicy',
    header: 'Política stock',
    aliases: ['politica stock', 'política stock', 'stock policy'],
    help: 'deny (no vender sin stock) o allow (permitir). Por defecto deny.',
    example: 'deny',
  },
  {
    key: 'weight',
    header: 'Peso',
    aliases: ['peso', 'variant weight', 'weight'],
    help: 'Peso en gramos.',
    example: '180',
  },
  {
    key: 'color',
    header: 'Color',
    aliases: ['color', 'color hex'],
    help: 'Color hex de la variante (#RRGGBB), para pintar el botón en la tienda.',
    example: '#FF0000',
  },
  {
    key: 'isDefault',
    header: 'Variante por defecto',
    aliases: ['variante por defecto', 'default', 'por defecto'],
    help: 'sí/no. Variante mostrada por defecto. Si ninguna se marca, se usa la primera.',
    example: 'sí',
  },
  {
    key: 'active',
    header: 'Variante activa',
    aliases: ['variante activa', 'activo', 'active'],
    help: 'sí/no. Por defecto sí.',
    example: 'sí',
  },
];

export const CATEGORY_COLUMNS: ColumnDef[] = [
  {
    key: 'name',
    header: 'Nombre',
    aliases: ['nombre', 'name'],
    required: true,
    help: 'Nombre de la categoría. Obligatorio. Máx 255.',
    example: 'Ropa de hombre',
  },
  {
    key: 'slug',
    header: 'Slug',
    aliases: ['slug', 'url'],
    help: 'URL amigable única. Si se deja vacío se genera desde el nombre.',
    example: 'ropa-de-hombre',
  },
  {
    key: 'description',
    header: 'Descripción',
    aliases: ['descripcion', 'descripción'],
    help: 'Descripción de la categoría.',
    example: 'Toda la ropa para hombre.',
  },
  {
    key: 'parent',
    header: 'Categoría padre',
    aliases: ['categoria padre', 'categoría padre', 'padre', 'parent'],
    help: 'Slug de la categoría padre. Puede definirse en una fila posterior. Máx 3 niveles.',
    example: 'ropa',
  },
  {
    key: 'imageUrl',
    header: 'Imagen URL',
    aliases: ['imagen url', 'imagen', 'image src'],
    help: 'URL de la imagen de la categoría (una sola).',
    example: 'https://midominio.com/fotos/ropa.jpg',
  },
  {
    key: 'imageAlt',
    header: 'Imagen Alt',
    aliases: ['imagen alt', 'alt'],
    help: 'Texto alternativo. Obligatorio si hay imagen.',
    example: 'Ropa de hombre',
  },
  {
    key: 'status',
    header: 'Estado',
    aliases: ['estado', 'status'],
    help: 'active o inactive (también activo/inactivo). Por defecto active.',
    example: 'active',
  },
  {
    key: 'sortOrder',
    header: 'Orden',
    aliases: ['orden', 'sort', 'sort order'],
    help: 'Orden entre hermanas (entero).',
    example: '0',
  },
  {
    key: 'metaTitle',
    header: 'Meta título',
    aliases: ['meta titulo', 'meta título', 'titulo seo'],
    help: 'Título SEO.',
    example: 'Ropa de hombre',
  },
  {
    key: 'metaDescription',
    header: 'Meta descripción',
    aliases: ['meta descripcion', 'meta descripción', 'descripcion seo'],
    help: 'Descripción SEO.',
    example: 'Descubre la ropa…',
  },
];
