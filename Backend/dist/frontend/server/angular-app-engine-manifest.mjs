
export default {
  basePath: '/',
  allowedHosts: [
  "localhost",
  "ninetysixshop.com",
  "www.ninetysixshop.com"
],
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
