
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "preload": [
      "chunk-XXUT5KTO.js",
      "chunk-WXNVKGRO.js",
      "chunk-NNPBICQU.js",
      "chunk-YCWLEQTB.js",
      "chunk-3O2BZFEJ.js",
      "chunk-WTEWF7K6.js",
      "chunk-DONDJ5VG.js"
    ],
    "route": "/"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ICLWLA26.js"
    ],
    "redirectTo": "/auth/login",
    "route": "/auth"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ICLWLA26.js",
      "chunk-TDMXEMME.js",
      "chunk-JNDKHPEF.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js"
    ],
    "route": "/auth/login"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ICLWLA26.js"
    ],
    "redirectTo": "/auth/login",
    "route": "/auth/**"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C6FJDMJA.js",
      "chunk-DONDJ5VG.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js"
    ],
    "route": "/panel"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C6FJDMJA.js",
      "chunk-DONDJ5VG.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js",
      "chunk-H2DQIQQN.js",
      "chunk-J7QMGQZJ.js"
    ],
    "route": "/panel/profile"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C6FJDMJA.js",
      "chunk-DONDJ5VG.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js",
      "chunk-QYWCEWEM.js",
      "chunk-J7QMGQZJ.js",
      "chunk-56FRJKM4.js",
      "chunk-3JRR67UL.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/users"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C6FJDMJA.js",
      "chunk-DONDJ5VG.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js",
      "chunk-HM4DTFSZ.js",
      "chunk-ATFTEFI7.js",
      "chunk-E5USQOML.js",
      "chunk-UZBBFGX6.js",
      "chunk-56FRJKM4.js",
      "chunk-3JRR67UL.js"
    ],
    "route": "/panel/categories"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C6FJDMJA.js",
      "chunk-DONDJ5VG.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js",
      "chunk-MYQ7RSRF.js",
      "chunk-UI44U2EX.js",
      "chunk-LQCJWDTU.js",
      "chunk-WQ4ZO6LO.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/categories/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C6FJDMJA.js",
      "chunk-DONDJ5VG.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js",
      "chunk-PMMKJAST.js",
      "chunk-E5USQOML.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/media"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C6FJDMJA.js",
      "chunk-DONDJ5VG.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js",
      "chunk-I3JHTWLF.js",
      "chunk-6MTLEEVC.js",
      "chunk-UZBBFGX6.js",
      "chunk-56FRJKM4.js",
      "chunk-3JRR67UL.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/products"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C6FJDMJA.js",
      "chunk-DONDJ5VG.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js",
      "chunk-G5V3L3K4.js",
      "chunk-6MTLEEVC.js",
      "chunk-ATFTEFI7.js",
      "chunk-E5USQOML.js",
      "chunk-UZBBFGX6.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/products/new"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C6FJDMJA.js",
      "chunk-DONDJ5VG.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js",
      "chunk-MYQ7RSRF.js",
      "chunk-UI44U2EX.js",
      "chunk-LQCJWDTU.js",
      "chunk-WQ4ZO6LO.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/products/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C6FJDMJA.js",
      "chunk-DONDJ5VG.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js",
      "chunk-GEIMIISQ.js",
      "chunk-UI44U2EX.js",
      "chunk-WQ4ZO6LO.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/products/images/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C6FJDMJA.js",
      "chunk-DONDJ5VG.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js",
      "chunk-G5V3L3K4.js",
      "chunk-6MTLEEVC.js",
      "chunk-ATFTEFI7.js",
      "chunk-E5USQOML.js",
      "chunk-UZBBFGX6.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/products/*/edit"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C6FJDMJA.js",
      "chunk-DONDJ5VG.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js",
      "chunk-7B7QBIYW.js",
      "chunk-LQCJWDTU.js",
      "chunk-WQ4ZO6LO.js"
    ],
    "route": "/panel/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C6FJDMJA.js",
      "chunk-DONDJ5VG.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js",
      "chunk-RSQHA6G2.js",
      "chunk-UI44U2EX.js",
      "chunk-LQCJWDTU.js",
      "chunk-WQ4ZO6LO.js",
      "chunk-3JRR67UL.js"
    ],
    "route": "/panel/import/history"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C6FJDMJA.js",
      "chunk-DONDJ5VG.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js",
      "chunk-RUDE4HNP.js",
      "chunk-UI44U2EX.js",
      "chunk-LQCJWDTU.js",
      "chunk-WQ4ZO6LO.js",
      "chunk-3JRR67UL.js"
    ],
    "route": "/panel/import/jobs/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C6FJDMJA.js",
      "chunk-DONDJ5VG.js",
      "chunk-FBDWZMLY.js",
      "chunk-7NX4FS6X.js"
    ],
    "redirectTo": "/panel",
    "route": "/panel/**"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-XXUT5KTO.js",
      "chunk-WXNVKGRO.js",
      "chunk-NNPBICQU.js",
      "chunk-YCWLEQTB.js",
      "chunk-3O2BZFEJ.js",
      "chunk-WTEWF7K6.js",
      "chunk-DONDJ5VG.js",
      "chunk-AYQM7K3F.js",
      "chunk-4IFMCUFL.js",
      "chunk-D6FYXCZX.js"
    ],
    "route": "/catalogo"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-XXUT5KTO.js",
      "chunk-WXNVKGRO.js",
      "chunk-NNPBICQU.js",
      "chunk-YCWLEQTB.js",
      "chunk-3O2BZFEJ.js",
      "chunk-WTEWF7K6.js",
      "chunk-DONDJ5VG.js",
      "chunk-JYC5LGRW.js",
      "chunk-4IFMCUFL.js",
      "chunk-D6FYXCZX.js"
    ],
    "route": "/destacados"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-XXUT5KTO.js",
      "chunk-WXNVKGRO.js",
      "chunk-NNPBICQU.js",
      "chunk-YCWLEQTB.js",
      "chunk-3O2BZFEJ.js",
      "chunk-WTEWF7K6.js",
      "chunk-DONDJ5VG.js",
      "chunk-QTOMEA6P.js",
      "chunk-4IFMCUFL.js",
      "chunk-D6FYXCZX.js"
    ],
    "route": "/categoria/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-XXUT5KTO.js",
      "chunk-WXNVKGRO.js",
      "chunk-NNPBICQU.js",
      "chunk-YCWLEQTB.js",
      "chunk-3O2BZFEJ.js",
      "chunk-WTEWF7K6.js",
      "chunk-DONDJ5VG.js",
      "chunk-JDZTKBEE.js",
      "chunk-D6FYXCZX.js"
    ],
    "route": "/producto/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-XXUT5KTO.js",
      "chunk-WXNVKGRO.js",
      "chunk-NNPBICQU.js",
      "chunk-YCWLEQTB.js",
      "chunk-3O2BZFEJ.js",
      "chunk-WTEWF7K6.js",
      "chunk-DONDJ5VG.js",
      "chunk-PVGNLQUC.js",
      "chunk-LJXDOO7Y.js",
      "chunk-KAWDDAOS.js"
    ],
    "route": "/ubicaciones"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-XXUT5KTO.js",
      "chunk-WXNVKGRO.js",
      "chunk-NNPBICQU.js",
      "chunk-YCWLEQTB.js",
      "chunk-3O2BZFEJ.js",
      "chunk-WTEWF7K6.js",
      "chunk-DONDJ5VG.js"
    ],
    "redirectTo": "/ubicaciones",
    "route": "/tiendas"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-XXUT5KTO.js",
      "chunk-WXNVKGRO.js",
      "chunk-NNPBICQU.js",
      "chunk-YCWLEQTB.js",
      "chunk-3O2BZFEJ.js",
      "chunk-WTEWF7K6.js",
      "chunk-DONDJ5VG.js",
      "chunk-HLFVVLVP.js",
      "chunk-LJXDOO7Y.js",
      "chunk-KAWDDAOS.js"
    ],
    "route": "/redes"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-XXUT5KTO.js",
      "chunk-WXNVKGRO.js",
      "chunk-NNPBICQU.js",
      "chunk-YCWLEQTB.js",
      "chunk-3O2BZFEJ.js",
      "chunk-WTEWF7K6.js",
      "chunk-DONDJ5VG.js",
      "chunk-XXFBMJT4.js",
      "chunk-LJXDOO7Y.js",
      "chunk-7NX4FS6X.js"
    ],
    "route": "/contacto"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-XXUT5KTO.js",
      "chunk-WXNVKGRO.js",
      "chunk-NNPBICQU.js",
      "chunk-YCWLEQTB.js",
      "chunk-3O2BZFEJ.js",
      "chunk-WTEWF7K6.js",
      "chunk-DONDJ5VG.js",
      "chunk-PW6TVORE.js"
    ],
    "route": "/orden"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-XXUT5KTO.js",
      "chunk-WXNVKGRO.js",
      "chunk-NNPBICQU.js",
      "chunk-YCWLEQTB.js",
      "chunk-3O2BZFEJ.js",
      "chunk-WTEWF7K6.js",
      "chunk-DONDJ5VG.js",
      "chunk-6AQZEL3E.js",
      "chunk-KAWDDAOS.js"
    ],
    "route": "/resenas"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-XXUT5KTO.js",
      "chunk-WXNVKGRO.js",
      "chunk-NNPBICQU.js",
      "chunk-YCWLEQTB.js",
      "chunk-3O2BZFEJ.js",
      "chunk-WTEWF7K6.js",
      "chunk-DONDJ5VG.js"
    ],
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 24809, hash: 'b64edaa6d591a66f1b401c3046e8f57bb0e518752b11676b523cf5ee9fd212e6', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 16928, hash: '65228da5f91ddef544f2fc856299ef71d6520b21b6a26b3a9afe63b0aafd0bd6', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-AFAMJ2SG.css': {size: 9589, hash: '0Pw1iMQAL/4', text: () => import('./assets-chunks/styles-AFAMJ2SG_css.mjs').then(m => m.default)}
  },
};
