import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
const errs=[]; dom.virtualConsole.on("jsdomError",e=>errs.push(String(e).split("\n")[0]));
dom.window.onerror=x=>errs.push("onerror: "+x);
await new Promise(r=>setTimeout(r,220));
const w=dom.window,d=dom.window.document;

function text(el){
  const out=[];
  (function walk(n,depth){
    for(const c of n.childNodes){
      if(c.nodeType===3){ const t=c.textContent.replace(/\s+/g," ").trim(); if(t) out.push(t); }
      else if(c.nodeType===1){
        const tag=c.tagName.toLowerCase();
        const block=/^(div|p|h1|h2|h3|tr|button|li|table)$/.test(tag);
        if(block) out.push("\n");
        walk(c,depth+1);
        if(block) out.push("\n");
      }
    }
  })(el,0);
  return out.join(" ").replace(/ *\n[ \n]*/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
}
function screen(title){
  console.log("\n\n████████ "+title+" ████████");
  console.log(text(d.getElementById("app")));
}
w.newGame();
screen("ROLL — round 1, fresh fleet of four d4s");
w.G.you.values=[{sides:10,value:3},{sides:8,value:4},{sides:6,value:5},{sides:4,value:1},{sides:10,value:2}];
w.G.you.dice=[{s:10,out:0},{s:8,out:0},{s:6,out:0},{s:4,out:0},{s:10,out:0}];
w.G.you.rolls=1; w.G.you.flag.face=5; w.G.you.energy=9; w.render();
screen("ROLL — mid fleet with a straight and an Attack flagship");
console.log("\nerrors:", errs.length?errs:"none");
