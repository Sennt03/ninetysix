export const environment = {
  production: true,
  // 1 sola app: API y tienda comparten dominio (ninetysixshop.com). Las URLs son
  // absolutas porque el SSR (Node) las usa para hacer fetch durante el render.
  // ⚠️ El path debe coincidir con API_PREFIX del backend (.env -> API_PREFIX=api).
  url_base: 'https://ninetysixshop.com',
  url_api: 'https://ninetysixshop.com/api',
  // Dominio público de la tienda (para canonical / Open Graph / sitemap).
  url_site: 'https://ninetysixshop.com',
};
