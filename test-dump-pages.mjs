import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
const errs=[]; dom.virtualConsole.on("jsdomError",e=>errs.push(String(e).split("\n")[0]));
dom.window.onerror=x=>errs.push("onerror: "+x);
await new Promise(r=>setTimeout(r,220));
const w=dom.window,d=dom.window.document;
function text(el){ const out=[];
  (function walk(n){ for(const c of n.childNodes){
    if(c.nodeType===3){const t=c.textContent.replace(/\s+/g," ").trim(); if(t) out.push(t);}
    else if(c.nodeType===1){ const b=/^(div|p|h1|h2|h3|tr|button|table)$/.test(c.tagName.toLowerCase());
      if(b) out.push("\n"); walk(c); if(b) out.push("\n"); } } })(el);
  return out.join(" ").replace(/ *\n[ \n]*/g,"\n").replace(/\n{3,}/g,"\n\n").trim(); }
const screen=t=>console.log("\n\n████ "+t+" ████\n"+text(d.getElementById("app")));
w.newGame();
w.G.phase="help"; w.render(); screen("HOW TO PLAY");
// three endings
w.G.you.hp=0; w.G.them.hp=14; w.G.you.damage=40; w.G.them.damage=90; w.G.phase="over"; w.render();
screen("GAME OVER — you lost");
w.G.you.hp=0; w.G.them.hp=0; w.G.you.damage=95; w.G.them.damage=60; w.render();
screen("GAME OVER — both flagships fell in the same round");
console.log("\nerrors:", errs.length?errs:"none");
