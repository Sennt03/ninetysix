
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "preload": [
      "chunk-7RJNRMIQ.js",
      "chunk-S2BBPNWJ.js",
      "chunk-BQL33CXL.js",
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
      "chunk-7RJNRMIQ.js",
      "chunk-S2BBPNWJ.js",
      "chunk-BQL33CXL.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js",
      "chunk-KKKBZVUU.js",
      "chunk-733MGWJZ.js",
      "chunk-LGQI72ZN.js",
      "chunk-2DBXHFST.js"
    ],
    "route": "/catalogo"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-7RJNRMIQ.js",
      "chunk-S2BBPNWJ.js",
      "chunk-BQL33CXL.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js",
      "chunk-YQ5ODWQK.js",
      "chunk-733MGWJZ.js",
      "chunk-LGQI72ZN.js",
      "chunk-2DBXHFST.js"
    ],
    "route": "/destacados"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-7RJNRMIQ.js",
      "chunk-S2BBPNWJ.js",
      "chunk-BQL33CXL.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js",
      "chunk-EXTQACJF.js",
      "chunk-733MGWJZ.js",
      "chunk-LGQI72ZN.js",
      "chunk-MHB6RSWJ.js"
    ],
    "route": "/categoria/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-7RJNRMIQ.js",
      "chunk-S2BBPNWJ.js",
      "chunk-BQL33CXL.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js",
      "chunk-W5MJPKXR.js",
      "chunk-LGQI72ZN.js"
    ],
    "route": "/producto/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-7RJNRMIQ.js",
      "chunk-S2BBPNWJ.js",
      "chunk-BQL33CXL.js",
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
      "chunk-7RJNRMIQ.js",
      "chunk-S2BBPNWJ.js",
      "chunk-BQL33CXL.js",
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
      "chunk-7RJNRMIQ.js",
      "chunk-S2BBPNWJ.js",
      "chunk-BQL33CXL.js",
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
      "chunk-7RJNRMIQ.js",
      "chunk-S2BBPNWJ.js",
      "chunk-BQL33CXL.js",
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
      "chunk-7RJNRMIQ.js",
      "chunk-S2BBPNWJ.js",
      "chunk-BQL33CXL.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js",
      "chunk-XYU2URGG.js",
      "chunk-5KJJCINA.js",
      "chunk-MHB6RSWJ.js"
    ],
    "route": "/historia"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-7RJNRMIQ.js",
      "chunk-S2BBPNWJ.js",
      "chunk-BQL33CXL.js",
      "chunk-3O2BZFEJ.js",
      "chunk-SHEUIUKE.js",
      "chunk-S6VNU3D5.js",
      "chunk-EZEAEF5W.js",
      "chunk-5KJJCINA.js",
      "chunk-MHB6RSWJ.js"
    ],
    "route": "/resenas"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-7RJNRMIQ.js",
      "chunk-S2BBPNWJ.js",
      "chunk-BQL33CXL.js",
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
    'index.csr.html': {size: 24729, hash: '7dd53fde7cf6a1557cdfb758062d95f3b9d1bf18376bcff5b9474f6b8c5ff853', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 16848, hash: 'f88c80fb058c4ce3b6ae7ea0602624a42c921ae585719e46f0a91b778db3af9f', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-AFAMJ2SG.css': {size: 9589, hash: '0Pw1iMQAL/4', text: () => import('./assets-chunks/styles-AFAMJ2SG_css.mjs').then(m => m.default)}
  },
};
