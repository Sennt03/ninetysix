
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "preload": [
      "chunk-CVIOSEHB.js",
      "chunk-SET3VYIX.js",
      "chunk-BJLVXPYC.js",
      "chunk-DM5JIE2W.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js"
    ],
    "route": "/"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-2THBNHQC.js"
    ],
    "redirectTo": "/auth/login",
    "route": "/auth"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-2THBNHQC.js",
      "chunk-GVCHMCTR.js",
      "chunk-4BY5IG6W.js",
      "chunk-OVVWOLES.js"
    ],
    "route": "/auth/login"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-2THBNHQC.js"
    ],
    "redirectTo": "/auth/login",
    "route": "/auth/**"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYFOUFC5.js",
      "chunk-NCDDPRO4.js",
      "chunk-OVVWOLES.js"
    ],
    "route": "/panel"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYFOUFC5.js",
      "chunk-NCDDPRO4.js",
      "chunk-OVVWOLES.js",
      "chunk-UFX6PTA5.js",
      "chunk-FJELYRM3.js"
    ],
    "route": "/panel/profile"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYFOUFC5.js",
      "chunk-NCDDPRO4.js",
      "chunk-OVVWOLES.js",
      "chunk-3W4MT6HY.js",
      "chunk-FJELYRM3.js",
      "chunk-4D3EWZ6E.js",
      "chunk-EKU5BVJJ.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/users"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYFOUFC5.js",
      "chunk-NCDDPRO4.js",
      "chunk-OVVWOLES.js",
      "chunk-IBCPV542.js",
      "chunk-2A4NB37M.js",
      "chunk-OBPZAIUY.js",
      "chunk-WQK4SIFT.js",
      "chunk-4D3EWZ6E.js",
      "chunk-EKU5BVJJ.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/categories"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYFOUFC5.js",
      "chunk-NCDDPRO4.js",
      "chunk-OVVWOLES.js",
      "chunk-4TXF6MOK.js",
      "chunk-XTSKIHZF.js",
      "chunk-LQCJWDTU.js",
      "chunk-KICB4Q3H.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/categories/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYFOUFC5.js",
      "chunk-NCDDPRO4.js",
      "chunk-OVVWOLES.js",
      "chunk-PM5XZUHR.js",
      "chunk-OBPZAIUY.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/media"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYFOUFC5.js",
      "chunk-NCDDPRO4.js",
      "chunk-OVVWOLES.js",
      "chunk-YUE5ROLN.js",
      "chunk-DM4JVPMG.js",
      "chunk-WQK4SIFT.js",
      "chunk-4D3EWZ6E.js",
      "chunk-EKU5BVJJ.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/products"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYFOUFC5.js",
      "chunk-NCDDPRO4.js",
      "chunk-OVVWOLES.js",
      "chunk-AESLLJ7D.js",
      "chunk-DM4JVPMG.js",
      "chunk-2A4NB37M.js",
      "chunk-OBPZAIUY.js",
      "chunk-WQK4SIFT.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/products/new"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYFOUFC5.js",
      "chunk-NCDDPRO4.js",
      "chunk-OVVWOLES.js",
      "chunk-4TXF6MOK.js",
      "chunk-XTSKIHZF.js",
      "chunk-LQCJWDTU.js",
      "chunk-KICB4Q3H.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/products/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYFOUFC5.js",
      "chunk-NCDDPRO4.js",
      "chunk-OVVWOLES.js",
      "chunk-MWBDRDV2.js",
      "chunk-XTSKIHZF.js",
      "chunk-KICB4Q3H.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/products/images/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYFOUFC5.js",
      "chunk-NCDDPRO4.js",
      "chunk-OVVWOLES.js",
      "chunk-AESLLJ7D.js",
      "chunk-DM4JVPMG.js",
      "chunk-2A4NB37M.js",
      "chunk-OBPZAIUY.js",
      "chunk-WQK4SIFT.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/products/*/edit"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYFOUFC5.js",
      "chunk-NCDDPRO4.js",
      "chunk-OVVWOLES.js",
      "chunk-Z5ORAMRO.js",
      "chunk-LQCJWDTU.js",
      "chunk-KICB4Q3H.js"
    ],
    "route": "/panel/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYFOUFC5.js",
      "chunk-NCDDPRO4.js",
      "chunk-OVVWOLES.js",
      "chunk-5UK22S25.js",
      "chunk-XTSKIHZF.js",
      "chunk-LQCJWDTU.js",
      "chunk-KICB4Q3H.js",
      "chunk-EKU5BVJJ.js"
    ],
    "route": "/panel/import/history"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYFOUFC5.js",
      "chunk-NCDDPRO4.js",
      "chunk-OVVWOLES.js",
      "chunk-PJ6RRPNO.js",
      "chunk-XTSKIHZF.js",
      "chunk-LQCJWDTU.js",
      "chunk-KICB4Q3H.js",
      "chunk-EKU5BVJJ.js"
    ],
    "route": "/panel/import/jobs/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYFOUFC5.js",
      "chunk-NCDDPRO4.js",
      "chunk-OVVWOLES.js"
    ],
    "redirectTo": "/panel",
    "route": "/panel/**"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-CVIOSEHB.js",
      "chunk-SET3VYIX.js",
      "chunk-BJLVXPYC.js",
      "chunk-DM5JIE2W.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-56HH3Y7W.js",
      "chunk-NWEAKU24.js",
      "chunk-7DRQHWI2.js",
      "chunk-ZYGKC5SE.js"
    ],
    "route": "/catalogo"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-CVIOSEHB.js",
      "chunk-SET3VYIX.js",
      "chunk-BJLVXPYC.js",
      "chunk-DM5JIE2W.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-BLOAF7OC.js",
      "chunk-2SZXGFWD.js",
      "chunk-7DRQHWI2.js",
      "chunk-CMZU3R3T.js"
    ],
    "route": "/categoria/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-CVIOSEHB.js",
      "chunk-SET3VYIX.js",
      "chunk-BJLVXPYC.js",
      "chunk-DM5JIE2W.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-XNPF257L.js",
      "chunk-7DRQHWI2.js"
    ],
    "route": "/producto/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-CVIOSEHB.js",
      "chunk-SET3VYIX.js",
      "chunk-BJLVXPYC.js",
      "chunk-DM5JIE2W.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-USP7HULG.js",
      "chunk-LIT5MJCD.js",
      "chunk-ZYGKC5SE.js",
      "chunk-CMZU3R3T.js"
    ],
    "route": "/historia"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-CVIOSEHB.js",
      "chunk-SET3VYIX.js",
      "chunk-BJLVXPYC.js",
      "chunk-DM5JIE2W.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-ZA75EEI5.js",
      "chunk-LIT5MJCD.js",
      "chunk-ZYGKC5SE.js",
      "chunk-CMZU3R3T.js"
    ],
    "route": "/resenas"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-CVIOSEHB.js",
      "chunk-SET3VYIX.js",
      "chunk-BJLVXPYC.js",
      "chunk-DM5JIE2W.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-5FRSXCIZ.js",
      "chunk-ZYGKC5SE.js",
      "chunk-CMZU3R3T.js"
    ],
    "route": "/redes"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-CVIOSEHB.js",
      "chunk-SET3VYIX.js",
      "chunk-BJLVXPYC.js",
      "chunk-DM5JIE2W.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-OFPEGKN4.js",
      "chunk-ZYGKC5SE.js",
      "chunk-CMZU3R3T.js"
    ],
    "route": "/tiendas"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-CVIOSEHB.js",
      "chunk-SET3VYIX.js",
      "chunk-BJLVXPYC.js",
      "chunk-DM5JIE2W.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js"
    ],
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 23236, hash: '6450ad5332fae7b812e653bc5b26987a8f113a5ed3a156f2468b485fe847393f', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 15356, hash: '929f39dd8962e592e1f6a6786b3ab4a26547687d5ca321360635087def488275', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-AFAMJ2SG.css': {size: 9589, hash: '0Pw1iMQAL/4', text: () => import('./assets-chunks/styles-AFAMJ2SG_css.mjs').then(m => m.default)}
  },
};
