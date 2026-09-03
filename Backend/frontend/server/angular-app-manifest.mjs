
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "preload": [
      "chunk-GSMG3OW2.js",
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
      "chunk-L4RSMZ4Y.js"
    ],
    "redirectTo": "/auth/login",
    "route": "/auth"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-L4RSMZ4Y.js",
      "chunk-JTTSMTL5.js",
      "chunk-JNDKHPEF.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js"
    ],
    "route": "/auth/login"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-L4RSMZ4Y.js"
    ],
    "redirectTo": "/auth/login",
    "route": "/auth/**"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ECSK4BIJ.js",
      "chunk-DONDJ5VG.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js"
    ],
    "route": "/panel"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ECSK4BIJ.js",
      "chunk-DONDJ5VG.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js",
      "chunk-27WVTEH5.js",
      "chunk-J7QMGQZJ.js"
    ],
    "route": "/panel/profile"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ECSK4BIJ.js",
      "chunk-DONDJ5VG.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js",
      "chunk-WA6CFWFI.js",
      "chunk-J7QMGQZJ.js",
      "chunk-354IYZIO.js",
      "chunk-GCORHI6J.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/users"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ECSK4BIJ.js",
      "chunk-DONDJ5VG.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js",
      "chunk-HPRYIWU6.js",
      "chunk-TN4RERRB.js",
      "chunk-E5USQOML.js",
      "chunk-UZBBFGX6.js",
      "chunk-354IYZIO.js",
      "chunk-GCORHI6J.js"
    ],
    "route": "/panel/categories"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ECSK4BIJ.js",
      "chunk-DONDJ5VG.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js",
      "chunk-UPEUVK7K.js",
      "chunk-VMKJFJRS.js",
      "chunk-LQCJWDTU.js",
      "chunk-WQ4ZO6LO.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/categories/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ECSK4BIJ.js",
      "chunk-DONDJ5VG.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js",
      "chunk-H56HNHWS.js",
      "chunk-E5USQOML.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/media"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ECSK4BIJ.js",
      "chunk-DONDJ5VG.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js",
      "chunk-ROUNBJQB.js",
      "chunk-WGT5XFUZ.js",
      "chunk-UZBBFGX6.js",
      "chunk-354IYZIO.js",
      "chunk-GCORHI6J.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/products"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ECSK4BIJ.js",
      "chunk-DONDJ5VG.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js",
      "chunk-2CY2D7PS.js",
      "chunk-WGT5XFUZ.js",
      "chunk-TN4RERRB.js",
      "chunk-E5USQOML.js",
      "chunk-UZBBFGX6.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/products/new"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ECSK4BIJ.js",
      "chunk-DONDJ5VG.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js",
      "chunk-UPEUVK7K.js",
      "chunk-VMKJFJRS.js",
      "chunk-LQCJWDTU.js",
      "chunk-WQ4ZO6LO.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/products/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ECSK4BIJ.js",
      "chunk-DONDJ5VG.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js",
      "chunk-4JEDAVAM.js",
      "chunk-VMKJFJRS.js",
      "chunk-WQ4ZO6LO.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/products/images/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ECSK4BIJ.js",
      "chunk-DONDJ5VG.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js",
      "chunk-2CY2D7PS.js",
      "chunk-WGT5XFUZ.js",
      "chunk-TN4RERRB.js",
      "chunk-E5USQOML.js",
      "chunk-UZBBFGX6.js",
      "chunk-JNDKHPEF.js"
    ],
    "route": "/panel/products/*/edit"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ECSK4BIJ.js",
      "chunk-DONDJ5VG.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js",
      "chunk-BDUI2QYJ.js",
      "chunk-LQCJWDTU.js",
      "chunk-WQ4ZO6LO.js"
    ],
    "route": "/panel/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ECSK4BIJ.js",
      "chunk-DONDJ5VG.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js",
      "chunk-ITSTHDAU.js",
      "chunk-VMKJFJRS.js",
      "chunk-LQCJWDTU.js",
      "chunk-WQ4ZO6LO.js",
      "chunk-GCORHI6J.js"
    ],
    "route": "/panel/import/history"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ECSK4BIJ.js",
      "chunk-DONDJ5VG.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js",
      "chunk-DN7Z7JAX.js",
      "chunk-VMKJFJRS.js",
      "chunk-LQCJWDTU.js",
      "chunk-WQ4ZO6LO.js",
      "chunk-GCORHI6J.js"
    ],
    "route": "/panel/import/jobs/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ECSK4BIJ.js",
      "chunk-DONDJ5VG.js",
      "chunk-2ATG66EP.js",
      "chunk-XVP2ZFS7.js"
    ],
    "redirectTo": "/panel",
    "route": "/panel/**"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-GSMG3OW2.js",
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
      "chunk-GSMG3OW2.js",
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
      "chunk-GSMG3OW2.js",
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
      "chunk-GSMG3OW2.js",
      "chunk-LETD7HGX.js",
      "chunk-GGXHRUM6.js",
      "chunk-YCWLEQTB.js",
      "chunk-6XIZZUPB.js",
      "chunk-DDUXNOMB.js",
      "chunk-DONDJ5VG.js",
      "chunk-M7AZRPES.js",
      "chunk-D6FYXCZX.js"
    ],
    "route": "/producto/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-GSMG3OW2.js",
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
      "chunk-GSMG3OW2.js",
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
      "chunk-GSMG3OW2.js",
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
      "chunk-GSMG3OW2.js",
      "chunk-LETD7HGX.js",
      "chunk-GGXHRUM6.js",
      "chunk-YCWLEQTB.js",
      "chunk-6XIZZUPB.js",
      "chunk-DDUXNOMB.js",
      "chunk-DONDJ5VG.js",
      "chunk-MVT2LBBK.js",
      "chunk-LJXDOO7Y.js",
      "chunk-XVP2ZFS7.js"
    ],
    "route": "/datos-envio"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-GSMG3OW2.js",
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
      "chunk-GSMG3OW2.js",
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
      "chunk-GSMG3OW2.js",
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
      "chunk-GSMG3OW2.js",
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
    'index.csr.html': {size: 25161, hash: '7e155656ded804b17821fdbc4c76302870f646902f69e7f965fd3d3805db3245', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17285, hash: '9f13e342dc8a61ddae437ed5c00ba9b4f21361f6389db9ee856fa9e26d50aee7', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-AFAMJ2SG.css': {size: 9589, hash: '0Pw1iMQAL/4', text: () => import('./assets-chunks/styles-AFAMJ2SG_css.mjs').then(m => m.default)}
  },
};
