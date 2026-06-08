
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "preload": [
      "chunk-W5BUK3LG.js",
      "chunk-2ZE2ZDDU.js",
      "chunk-WDC6CEFL.js",
      "chunk-6EOQXX2P.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js"
    ],
    "route": "/"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-CFEJJDJF.js"
    ],
    "redirectTo": "/auth/login",
    "route": "/auth"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-CFEJJDJF.js",
      "chunk-OZ2ZV26N.js",
      "chunk-4BY5IG6W.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js"
    ],
    "route": "/auth/login"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-CFEJJDJF.js"
    ],
    "redirectTo": "/auth/login",
    "route": "/auth/**"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QUTSBRHZ.js",
      "chunk-NCDDPRO4.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js"
    ],
    "route": "/panel"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QUTSBRHZ.js",
      "chunk-NCDDPRO4.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js",
      "chunk-JBO4PCZG.js",
      "chunk-FJELYRM3.js"
    ],
    "route": "/panel/profile"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QUTSBRHZ.js",
      "chunk-NCDDPRO4.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js",
      "chunk-7FYIS3X5.js",
      "chunk-FJELYRM3.js",
      "chunk-5POAPMBY.js",
      "chunk-AC77O4JQ.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/users"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QUTSBRHZ.js",
      "chunk-NCDDPRO4.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js",
      "chunk-YOSYNLCD.js",
      "chunk-L57DH2VM.js",
      "chunk-OBPZAIUY.js",
      "chunk-WQK4SIFT.js",
      "chunk-5POAPMBY.js",
      "chunk-AC77O4JQ.js"
    ],
    "route": "/panel/categories"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QUTSBRHZ.js",
      "chunk-NCDDPRO4.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js",
      "chunk-F2SDB3VG.js",
      "chunk-VQK6P5O5.js",
      "chunk-LQCJWDTU.js",
      "chunk-KICB4Q3H.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/categories/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QUTSBRHZ.js",
      "chunk-NCDDPRO4.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js",
      "chunk-2OX5L4MF.js",
      "chunk-OBPZAIUY.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/media"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QUTSBRHZ.js",
      "chunk-NCDDPRO4.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js",
      "chunk-YCST7EQP.js",
      "chunk-DM4JVPMG.js",
      "chunk-WQK4SIFT.js",
      "chunk-5POAPMBY.js",
      "chunk-AC77O4JQ.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/products"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QUTSBRHZ.js",
      "chunk-NCDDPRO4.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js",
      "chunk-P63EZAEN.js",
      "chunk-DM4JVPMG.js",
      "chunk-L57DH2VM.js",
      "chunk-OBPZAIUY.js",
      "chunk-WQK4SIFT.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/products/new"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QUTSBRHZ.js",
      "chunk-NCDDPRO4.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js",
      "chunk-F2SDB3VG.js",
      "chunk-VQK6P5O5.js",
      "chunk-LQCJWDTU.js",
      "chunk-KICB4Q3H.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/products/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QUTSBRHZ.js",
      "chunk-NCDDPRO4.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js",
      "chunk-D356O62Q.js",
      "chunk-VQK6P5O5.js",
      "chunk-KICB4Q3H.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/products/images/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QUTSBRHZ.js",
      "chunk-NCDDPRO4.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js",
      "chunk-P63EZAEN.js",
      "chunk-DM4JVPMG.js",
      "chunk-L57DH2VM.js",
      "chunk-OBPZAIUY.js",
      "chunk-WQK4SIFT.js",
      "chunk-4BY5IG6W.js"
    ],
    "route": "/panel/products/*/edit"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QUTSBRHZ.js",
      "chunk-NCDDPRO4.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js",
      "chunk-4V32GNV7.js",
      "chunk-LQCJWDTU.js",
      "chunk-KICB4Q3H.js"
    ],
    "route": "/panel/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QUTSBRHZ.js",
      "chunk-NCDDPRO4.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js",
      "chunk-GFC4MF4D.js",
      "chunk-VQK6P5O5.js",
      "chunk-LQCJWDTU.js",
      "chunk-KICB4Q3H.js",
      "chunk-AC77O4JQ.js"
    ],
    "route": "/panel/import/history"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QUTSBRHZ.js",
      "chunk-NCDDPRO4.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js",
      "chunk-F4J4GC2A.js",
      "chunk-VQK6P5O5.js",
      "chunk-LQCJWDTU.js",
      "chunk-KICB4Q3H.js",
      "chunk-AC77O4JQ.js"
    ],
    "route": "/panel/import/jobs/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QUTSBRHZ.js",
      "chunk-NCDDPRO4.js",
      "chunk-62R3B3PI.js",
      "chunk-5ZQOHR2T.js"
    ],
    "redirectTo": "/panel",
    "route": "/panel/**"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-W5BUK3LG.js",
      "chunk-2ZE2ZDDU.js",
      "chunk-WDC6CEFL.js",
      "chunk-6EOQXX2P.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-OQOZFO7F.js",
      "chunk-XKM6OIMV.js",
      "chunk-OORCMEDK.js",
      "chunk-SHQU7J7Z.js"
    ],
    "route": "/catalogo"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-W5BUK3LG.js",
      "chunk-2ZE2ZDDU.js",
      "chunk-WDC6CEFL.js",
      "chunk-6EOQXX2P.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-MA47HVBG.js",
      "chunk-XKM6OIMV.js",
      "chunk-OORCMEDK.js",
      "chunk-SHQU7J7Z.js"
    ],
    "route": "/destacados"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-W5BUK3LG.js",
      "chunk-2ZE2ZDDU.js",
      "chunk-WDC6CEFL.js",
      "chunk-6EOQXX2P.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-US66VF27.js",
      "chunk-XKM6OIMV.js",
      "chunk-OORCMEDK.js",
      "chunk-CMZU3R3T.js"
    ],
    "route": "/categoria/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-W5BUK3LG.js",
      "chunk-2ZE2ZDDU.js",
      "chunk-WDC6CEFL.js",
      "chunk-6EOQXX2P.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-2ZFO7HVN.js",
      "chunk-OORCMEDK.js"
    ],
    "route": "/producto/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-W5BUK3LG.js",
      "chunk-2ZE2ZDDU.js",
      "chunk-WDC6CEFL.js",
      "chunk-6EOQXX2P.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-T74TIPMH.js",
      "chunk-SHQU7J7Z.js",
      "chunk-CMZU3R3T.js"
    ],
    "route": "/ubicaciones"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-W5BUK3LG.js",
      "chunk-2ZE2ZDDU.js",
      "chunk-WDC6CEFL.js",
      "chunk-6EOQXX2P.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js"
    ],
    "redirectTo": "/ubicaciones",
    "route": "/tiendas"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-W5BUK3LG.js",
      "chunk-2ZE2ZDDU.js",
      "chunk-WDC6CEFL.js",
      "chunk-6EOQXX2P.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-PGN4AB56.js",
      "chunk-SHQU7J7Z.js",
      "chunk-CMZU3R3T.js"
    ],
    "route": "/redes"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-W5BUK3LG.js",
      "chunk-2ZE2ZDDU.js",
      "chunk-WDC6CEFL.js",
      "chunk-6EOQXX2P.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-QXURKVP4.js",
      "chunk-SHQU7J7Z.js",
      "chunk-5ZQOHR2T.js"
    ],
    "route": "/contacto"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-W5BUK3LG.js",
      "chunk-2ZE2ZDDU.js",
      "chunk-WDC6CEFL.js",
      "chunk-6EOQXX2P.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-GZRUNASO.js",
      "chunk-ACGSIQPD.js",
      "chunk-CMZU3R3T.js"
    ],
    "route": "/historia"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-W5BUK3LG.js",
      "chunk-2ZE2ZDDU.js",
      "chunk-WDC6CEFL.js",
      "chunk-6EOQXX2P.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js",
      "chunk-PN4REJHU.js",
      "chunk-ACGSIQPD.js",
      "chunk-CMZU3R3T.js"
    ],
    "route": "/resenas"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-W5BUK3LG.js",
      "chunk-2ZE2ZDDU.js",
      "chunk-WDC6CEFL.js",
      "chunk-6EOQXX2P.js",
      "chunk-X7G5E6UM.js",
      "chunk-NCDDPRO4.js"
    ],
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 24729, hash: 'b9c878b54528791bce9ae7715521cd9a56d1e1e594b511f7f1897f14c134ffe2', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 16848, hash: '16144f12185bb0a51ccffc78299504051529d85ba60f2a02bec4fe166f23590c', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-AFAMJ2SG.css': {size: 9589, hash: '0Pw1iMQAL/4', text: () => import('./assets-chunks/styles-AFAMJ2SG_css.mjs').then(m => m.default)}
  },
};
