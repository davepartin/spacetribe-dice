import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
const errs=[]; dom.virtualConsole.on("jsdomError",e=>errs.push(String(e).split("\n")[0]));
dom.window.onerror=x=>errs.push("onerror: "+x);
await new Promise(r=>setTimeout(r,220));
const w=dom.window,d=dom.window.document;
function text(el){
  const out=[];
  (function walk(n){ for(const c of n.childNodes){
    if(c.nodeType===3){const t=c.textContent.replace(/\s+/g," ").trim(); if(t) out.push(t);}
    else if(c.nodeType===1){ const b=/^(div|p|h1|h2|h3|tr|button|table)$/.test(c.tagName.toLowerCase());
      if(b) out.push("\n"); walk(c); if(b) out.push("\n"); } } })(el);
  return out.join(" ").replace(/ *\n[ \n]*/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
}
const screen=t=>{ console.log("\n\n████ "+t+" ████\n"+text(d.getElementById("app"))); };
w.newGame();
// drive to a brace with damage on both sides
for(let i=0;i<30;i++){ if(w.G.phase==="brace") break;
  if(w.G.phase==="roll") w.submit(); else if(w.G.phase==="report") w.nextRound();
  else if(w.G.phase==="shop") w.startRound(); else break; }
if(w.G.phase==="brace") screen("BRACE"); else console.log("(could not reach brace)");
if(w.G.phase==="brace"){ const p=d.querySelector("[data-brace]"); if(p) p.click();
  screen("BRACE — after feeding a ship"); d.getElementById("brace-done").click(); }
if(w.G.phase==="report") screen("REPORT");
w.nextRound(); screen("SHOP");
console.log("\nerrors:", errs.length?errs:"none");
