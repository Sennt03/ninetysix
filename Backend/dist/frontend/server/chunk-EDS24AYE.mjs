import './polyfills.server.mjs';
function n(t,c){let o=URL.createObjectURL(t),e=document.createElement("a");e.href=o,e.download=c,document.body.appendChild(e),e.click(),e.remove(),URL.revokeObjectURL(o)}export{n as a};
