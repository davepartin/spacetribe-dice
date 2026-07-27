import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
const errs=[]; dom.virtualConsole.on("jsdomError",e=>errs.push(String(e).split("\n")[0]));
dom.window.onerror=x=>errs.push("onerror: "+x);
await new Promise(r=>setTimeout(r,220));
const w=dom.window,d=dom.window.document;
w.newGame();
w.G.you.rolls=1;
function show(label){
  w.render();
  const k=d.querySelector(".strk");
  console.log("\n── "+label+" ──");
  if(!k){ console.log("   no straight banner"); return; }
  console.log("   "+k.querySelector(".stag").textContent+"  |  "+k.querySelector(".st").textContent.replace(/\s+/g," "));
  const flat=k.querySelector(".strkp");
  if(flat) console.log("   "+flat.textContent.replace(/\s+/g," "));
  [...k.querySelectorAll(".pick")].forEach(b=>console.log("   ["+
    (b.classList.contains("on")?"x":" ")+"] "+b.querySelector("b").textContent+" — "+
    b.querySelector("span").textContent+"   ("+b.querySelector("i").textContent+")"));
  console.log("   attack now:", d.querySelector(".tot .a .n").textContent,
              "· energy:", d.querySelector(".tot .e .n").textContent);
}
// no straight
w.G.you.dice=[10,10,10,10].map(s=>({s,out:0}));
w.G.you.values=[{sides:10,value:2},{sides:10,value:2},{sides:10,value:7},{sides:10,value:9}];
w.G.you.flag.face=0; show("2 2 7 9 + flagship 1 — no line");
// exactly runMin
w.G.you.values=[{sides:10,value:1},{sides:10,value:2},{sides:10,value:3},{sides:10,value:4}];
w.G.you.flag.face=4; show("1 2 3 4 + flagship 5 — exactly five, only one tier");
// a long one with choices
w.G.you.dice=[10,10,10,10,10,10,10].map(s=>({s,out:0}));
w.G.you.values=[1,2,3,4,6,7,8].map(v=>({sides:10,value:v}));
w.G.you.flag.face=4; show("1-8 with the flagship 5 filling the gap — eight in a row");
// cash it short
d.querySelectorAll(".pick")[3].click();
console.log("\n   after clicking the 5 tier:");
[...d.querySelectorAll(".pick")].forEach(b=>console.log("   ["+
  (b.classList.contains("on")?"x":" ")+"] "+b.querySelector("b").textContent+" — "+b.querySelector("span").textContent));
console.log("   attack now:", d.querySelector(".tot .a .n").textContent,
            "· energy:", d.querySelector(".tot .e .n").textContent);
// and a reroll must clear that choice
w.sel={0:true}; w.doReroll();
console.log("\n   straightPick after a reroll:", w.straightPick===null?"cleared ✓":"STILL "+w.straightPick);
console.log("\nerrors:", errs.length?errs:"none");
