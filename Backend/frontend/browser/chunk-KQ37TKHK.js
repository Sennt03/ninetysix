import{c}from"./chunk-6XIZZUPB.js";function u(r){let e="";for(let n of r)e+=String.fromCharCode(n);return btoa(e).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function l(r){let e=r.replace(/-/g,"+").replace(/_/g,"/"),n=atob(e),o=new Uint8Array(n.length);for(let t=0;t<n.length;t++)o[t]=n.charCodeAt(t);return o}function p(r){let e=r.map(n=>[n.slug,n.variantId,n.qty]);return u(new TextEncoder().encode(JSON.stringify(e)))}function f(r){if(!r)return null;try{let e=JSON.parse(new TextDecoder().decode(l(r)));if(!Array.isArray(e))return null;let n=[];for(let o of e){if(!Array.isArray(o)||o.length<3)continue;let[t,i,s]=o,a=Number(s);typeof t!="string"||typeof i!="string"||!Number.isFinite(a)||a<=0||n.push({slug:t,variantId:i,qty:Math.floor(a)})}return n.length?n:null}catch{return null}}function g(r,e){let o=`Hola Ninetysix \u{1F44B} Quiero hacer este pedido:

${r.map(t=>{let i=t.options.map(s=>`${s.type}: ${s.value}`).join(", ");return`\u2022 ${t.name}${i?` (${i})`:""} \xD7${t.qty}`}).join(`
`)}

\u{1F9FE} Detalle, cantidades y total del pedido:
${e}`;return`https://wa.me/${c}?text=${encodeURIComponent(o)}`}export{p as a,f as b,g as c};
