import './polyfills.server.mjs';
import{w as o}from"./chunk-YRGS2LCD.mjs";function s(e,n="Ha ocurrido un error"){if(e instanceof o){let r=e.error?.message;if(Array.isArray(r))return r[0]??n;if(typeof r=="string")return r}return n}export{s as a};
