
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "preload": [
      "chunk-BXWS44JC.js",
      "chunk-2ERBPL3P.js",
      "chunk-NNPBICQU.js",
      "chunk-3KXZMR46.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js"
    ],
    "route": "/"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-K3IK5D5P.js"
    ],
    "redirectTo": "/auth/login",
    "route": "/auth"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-K3IK5D5P.js",
      "chunk-G7WAFYIC.js",
      "chunk-KIMVZVSG.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js"
    ],
    "route": "/auth/login"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-K3IK5D5P.js"
    ],
    "redirectTo": "/auth/login",
    "route": "/auth/**"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GWROU5CC.js",
      "chunk-S6VNU3D5.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js"
    ],
    "route": "/panel"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GWROU5CC.js",
      "chunk-S6VNU3D5.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js",
      "chunk-JYYK5HI3.js",
      "chunk-A6ZE7J2E.js"
    ],
    "route": "/panel/profile"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GWROU5CC.js",
      "chunk-S6VNU3D5.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js",
      "chunk-MQPRJ5DX.js",
      "chunk-A6ZE7J2E.js",
      "chunk-3W3WFUML.js",
      "chunk-PUJN6AQ2.js",
      "chunk-KIMVZVSG.js"
    ],
    "route": "/panel/users"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GWROU5CC.js",
      "chunk-S6VNU3D5.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js",
      "chunk-4SK7BMXI.js",
      "chunk-MTSPUGLN.js",
      "chunk-HBZTPEJN.js",
      "chunk-DUDWYSSS.js",
      "chunk-3W3WFUML.js",
      "chunk-PUJN6AQ2.js"
    ],
    "route": "/panel/categories"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GWROU5CC.js",
      "chunk-S6VNU3D5.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js",
      "chunk-H2RIWJM3.js",
      "chunk-K7NIF7KF.js",
      "chunk-LQCJWDTU.js",
      "chunk-SA7JP52P.js",
      "chunk-KIMVZVSG.js"
    ],
    "route": "/panel/categories/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GWROU5CC.js",
      "chunk-S6VNU3D5.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js",
      "chunk-NINPPDGQ.js",
      "chunk-HBZTPEJN.js",
      "chunk-KIMVZVSG.js"
    ],
    "route": "/panel/media"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GWROU5CC.js",
      "chunk-S6VNU3D5.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js",
      "chunk-ZZ6R7MAL.js",
      "chunk-ZH2YSXBE.js",
      "chunk-DUDWYSSS.js",
      "chunk-3W3WFUML.js",
      "chunk-PUJN6AQ2.js",
      "chunk-KIMVZVSG.js"
    ],
    "route": "/panel/products"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GWROU5CC.js",
      "chunk-S6VNU3D5.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js",
      "chunk-QA4CAPIQ.js",
      "chunk-ZH2YSXBE.js",
      "chunk-MTSPUGLN.js",
      "chunk-HBZTPEJN.js",
      "chunk-DUDWYSSS.js",
      "chunk-KIMVZVSG.js"
    ],
    "route": "/panel/products/new"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GWROU5CC.js",
      "chunk-S6VNU3D5.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js",
      "chunk-H2RIWJM3.js",
      "chunk-K7NIF7KF.js",
      "chunk-LQCJWDTU.js",
      "chunk-SA7JP52P.js",
      "chunk-KIMVZVSG.js"
    ],
    "route": "/panel/products/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GWROU5CC.js",
      "chunk-S6VNU3D5.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js",
      "chunk-TEUXCL46.js",
      "chunk-K7NIF7KF.js",
      "chunk-SA7JP52P.js",
      "chunk-KIMVZVSG.js"
    ],
    "route": "/panel/products/images/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GWROU5CC.js",
      "chunk-S6VNU3D5.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js",
      "chunk-QA4CAPIQ.js",
      "chunk-ZH2YSXBE.js",
      "chunk-MTSPUGLN.js",
      "chunk-HBZTPEJN.js",
      "chunk-DUDWYSSS.js",
      "chunk-KIMVZVSG.js"
    ],
    "route": "/panel/products/*/edit"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GWROU5CC.js",
      "chunk-S6VNU3D5.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js",
      "chunk-NE75NFL3.js",
      "chunk-LQCJWDTU.js",
      "chunk-SA7JP52P.js"
    ],
    "route": "/panel/import"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GWROU5CC.js",
      "chunk-S6VNU3D5.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js",
      "chunk-VB7LCSRR.js",
      "chunk-K7NIF7KF.js",
      "chunk-LQCJWDTU.js",
      "chunk-SA7JP52P.js",
      "chunk-PUJN6AQ2.js"
    ],
    "route": "/panel/import/history"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GWROU5CC.js",
      "chunk-S6VNU3D5.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js",
      "chunk-CZKRMQMZ.js",
      "chunk-K7NIF7KF.js",
      "chunk-LQCJWDTU.js",
      "chunk-SA7JP52P.js",
      "chunk-PUJN6AQ2.js"
    ],
    "route": "/panel/import/jobs/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GWROU5CC.js",
      "chunk-S6VNU3D5.js",
      "chunk-LZJDMQMV.js",
      "chunk-24L2WF3N.js"
    ],
    "redirectTo": "/panel",
    "route": "/panel/**"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BXWS44JC.js",
      "chunk-2ERBPL3P.js",
      "chunk-NNPBICQU.js",
      "chunk-3KXZMR46.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js",
      "chunk-FUPQ6D24.js",
      "chunk-FEO7MBF6.js",
      "chunk-LGQI72ZN.js"
    ],
    "route": "/catalogo"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BXWS44JC.js",
      "chunk-2ERBPL3P.js",
      "chunk-NNPBICQU.js",
      "chunk-3KXZMR46.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js",
      "chunk-UZ2V2BF4.js",
      "chunk-FEO7MBF6.js",
      "chunk-LGQI72ZN.js"
    ],
    "route": "/destacados"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BXWS44JC.js",
      "chunk-2ERBPL3P.js",
      "chunk-NNPBICQU.js",
      "chunk-3KXZMR46.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js",
      "chunk-4JLJZP6H.js",
      "chunk-FEO7MBF6.js",
      "chunk-LGQI72ZN.js"
    ],
    "route": "/categoria/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BXWS44JC.js",
      "chunk-2ERBPL3P.js",
      "chunk-NNPBICQU.js",
      "chunk-3KXZMR46.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js",
      "chunk-EN23KCTE.js",
      "chunk-LGQI72ZN.js"
    ],
    "route": "/producto/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BXWS44JC.js",
      "chunk-2ERBPL3P.js",
      "chunk-NNPBICQU.js",
      "chunk-3KXZMR46.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js",
      "chunk-YR36MJLM.js",
      "chunk-2DBXHFST.js",
      "chunk-MHB6RSWJ.js"
    ],
    "route": "/ubicaciones"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BXWS44JC.js",
      "chunk-2ERBPL3P.js",
      "chunk-NNPBICQU.js",
      "chunk-3KXZMR46.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js"
    ],
    "redirectTo": "/ubicaciones",
    "route": "/tiendas"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BXWS44JC.js",
      "chunk-2ERBPL3P.js",
      "chunk-NNPBICQU.js",
      "chunk-3KXZMR46.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js",
      "chunk-V53I4X27.js",
      "chunk-2DBXHFST.js",
      "chunk-MHB6RSWJ.js"
    ],
    "route": "/redes"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BXWS44JC.js",
      "chunk-2ERBPL3P.js",
      "chunk-NNPBICQU.js",
      "chunk-3KXZMR46.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js",
      "chunk-JGZGT4ZS.js",
      "chunk-2DBXHFST.js",
      "chunk-24L2WF3N.js"
    ],
    "route": "/contacto"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BXWS44JC.js",
      "chunk-2ERBPL3P.js",
      "chunk-NNPBICQU.js",
      "chunk-3KXZMR46.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js",
      "chunk-QITVEHUS.js"
    ],
    "route": "/orden"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BXWS44JC.js",
      "chunk-2ERBPL3P.js",
      "chunk-NNPBICQU.js",
      "chunk-3KXZMR46.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js",
      "chunk-QUINZ7LE.js",
      "chunk-MHB6RSWJ.js"
    ],
    "route": "/resenas"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BXWS44JC.js",
      "chunk-2ERBPL3P.js",
      "chunk-NNPBICQU.js",
      "chunk-3KXZMR46.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js"
    ],
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 24809, hash: '879e106f9b06c72638d4ae712fecc93bbb04aaab43f0d6aae5a024bf8e9443e0', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 16928, hash: 'b34303959ab627790f4e8092564c0a839c61cf254a39e7fadb67a80daac40b60', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-AFAMJ2SG.css': {size: 9589, hash: '0Pw1iMQAL/4', text: () => import('./assets-chunks/styles-AFAMJ2SG_css.mjs').then(m => m.default)}
  },
};
