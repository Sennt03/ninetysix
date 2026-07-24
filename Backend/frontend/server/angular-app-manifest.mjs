
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "preload": [
      "chunk-5ONLL7B2.js",
      "chunk-LETD7HGX.js",
      "chunk-GGXHRUM6.js",
      "chunk-YCWLEQTB.js",
      "chunk-6XIZZUPB.js",
      "chunk-DDUXNOMB.js",
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
      "chunk-5ONLL7B2.js",
      "chunk-LETD7HGX.js",
      "chunk-GGXHRUM6.js",
      "chunk-YCWLEQTB.js",
      "chunk-6XIZZUPB.js",
      "chunk-DDUXNOMB.js",
      "chunk-DONDJ5VG.js",
      "chunk-3PA6JS77.js",
      "chunk-4IFMCUFL.js",
      "chunk-D6FYXCZX.js"
    ],
    "route": "/catalogo"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-5ONLL7B2.js",
      "chunk-LETD7HGX.js",
      "chunk-GGXHRUM6.js",
      "chunk-YCWLEQTB.js",
      "chunk-6XIZZUPB.js",
      "chunk-DDUXNOMB.js",
      "chunk-DONDJ5VG.js",
      "chunk-XGPQJLLR.js",
      "chunk-4IFMCUFL.js",
      "chunk-D6FYXCZX.js"
    ],
    "route": "/destacados"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-5ONLL7B2.js",
      "chunk-LETD7HGX.js",
      "chunk-GGXHRUM6.js",
      "chunk-YCWLEQTB.js",
      "chunk-6XIZZUPB.js",
      "chunk-DDUXNOMB.js",
      "chunk-DONDJ5VG.js",
      "chunk-WIOCH3F2.js",
      "chunk-4IFMCUFL.js",
      "chunk-D6FYXCZX.js"
    ],
    "route": "/categoria/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-5ONLL7B2.js",
      "chunk-LETD7HGX.js",
      "chunk-GGXHRUM6.js",
      "chunk-YCWLEQTB.js",
      "chunk-6XIZZUPB.js",
      "chunk-DDUXNOMB.js",
      "chunk-DONDJ5VG.js",
      "chunk-BNHBY3BV.js",
      "chunk-D6FYXCZX.js"
    ],
    "route": "/producto/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-5ONLL7B2.js",
      "chunk-LETD7HGX.js",
      "chunk-GGXHRUM6.js",
      "chunk-YCWLEQTB.js",
      "chunk-6XIZZUPB.js",
      "chunk-DDUXNOMB.js",
      "chunk-DONDJ5VG.js",
      "chunk-JKRGC3YE.js",
      "chunk-LJXDOO7Y.js",
      "chunk-KAWDDAOS.js"
    ],
    "route": "/ubicaciones"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-5ONLL7B2.js",
      "chunk-LETD7HGX.js",
      "chunk-GGXHRUM6.js",
      "chunk-YCWLEQTB.js",
      "chunk-6XIZZUPB.js",
      "chunk-DDUXNOMB.js",
      "chunk-DONDJ5VG.js"
    ],
    "redirectTo": "/ubicaciones",
    "route": "/tiendas"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-5ONLL7B2.js",
      "chunk-LETD7HGX.js",
      "chunk-GGXHRUM6.js",
      "chunk-YCWLEQTB.js",
      "chunk-6XIZZUPB.js",
      "chunk-DDUXNOMB.js",
      "chunk-DONDJ5VG.js",
      "chunk-LHCRA5OH.js",
      "chunk-LJXDOO7Y.js",
      "chunk-KAWDDAOS.js"
    ],
    "route": "/redes"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-5ONLL7B2.js",
      "chunk-LETD7HGX.js",
      "chunk-GGXHRUM6.js",
      "chunk-YCWLEQTB.js",
      "chunk-6XIZZUPB.js",
      "chunk-DDUXNOMB.js",
      "chunk-DONDJ5VG.js",
      "chunk-47RFYD2U.js",
      "chunk-LJXDOO7Y.js",
      "chunk-7NX4FS6X.js"
    ],
    "route": "/datos-envio"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-5ONLL7B2.js",
      "chunk-LETD7HGX.js",
      "chunk-GGXHRUM6.js",
      "chunk-YCWLEQTB.js",
      "chunk-6XIZZUPB.js",
      "chunk-DDUXNOMB.js",
      "chunk-DONDJ5VG.js"
    ],
    "redirectTo": "/datos-envio",
    "route": "/contacto"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-5ONLL7B2.js",
      "chunk-LETD7HGX.js",
      "chunk-GGXHRUM6.js",
      "chunk-YCWLEQTB.js",
      "chunk-6XIZZUPB.js",
      "chunk-DDUXNOMB.js",
      "chunk-DONDJ5VG.js",
      "chunk-FXEQB2FC.js"
    ],
    "route": "/orden"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-5ONLL7B2.js",
      "chunk-LETD7HGX.js",
      "chunk-GGXHRUM6.js",
      "chunk-YCWLEQTB.js",
      "chunk-6XIZZUPB.js",
      "chunk-DDUXNOMB.js",
      "chunk-DONDJ5VG.js",
      "chunk-FK7WGLKO.js",
      "chunk-KAWDDAOS.js"
    ],
    "route": "/resenas"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-5ONLL7B2.js",
      "chunk-LETD7HGX.js",
      "chunk-GGXHRUM6.js",
      "chunk-YCWLEQTB.js",
      "chunk-6XIZZUPB.js",
      "chunk-DDUXNOMB.js",
      "chunk-DONDJ5VG.js"
    ],
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 25161, hash: 'aae5518047f540bc248ee37129b818e784a63bae0916a03715d81ce1b45b484d', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17285, hash: '26ce580e6e1f8f3deac92e362f9714069206e32e5c4f9ef4e096a1947cc0485b', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-AFAMJ2SG.css': {size: 9589, hash: '0Pw1iMQAL/4', text: () => import('./assets-chunks/styles-AFAMJ2SG_css.mjs').then(m => m.default)}
  },
};
