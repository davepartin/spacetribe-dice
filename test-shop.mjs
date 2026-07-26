import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync("/sessions/lucid-amazing-edison/mnt/spacetribe-dice/simple.html","utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
const errs=[]; dom.virtualConsole.on("jsdomError",e=>errs.push(String(e).split("\n")[0]));
dom.window.onerror=x=>errs.push("onerror: "+x);
await new Promise(r=>setTimeout(r,200));
const w=dom.window,d=dom.window.document;
w.newGame();
w.submit();
if(w.G.phase==="brace") (d.getElementById("brace-done")||{click(){}}).click();
w.nextRound();                       // lands in the shop
w.G.you.energy=26; w.render();
console.log("phase:", w.G.phase, "· screen:", d.querySelector("h2").textContent, "\n");
console.log("PURSE:", [...d.querySelectorAll(".purse > div")].map(x=>
  x.querySelector(".l").textContent+" = "+x.querySelector(".n").textContent).join("  |  "));
console.log("\nSECTIONS, in order:");
[...d.querySelectorAll(".shead")].forEach((h,i)=>console.log("  "+(i+1)+". ["+
  [...h.classList].filter(c=>c!=="shead")[0]+"] "+h.querySelector("h3").textContent+
  "  —  "+h.querySelector(".ssub").textContent));
console.log("\nflagship panel store present?", d.body.textContent.includes("Fit which panel")||d.body.textContent.includes("Flagship panels")?"YES (!!)":"no");
console.log("\nSHIPYARD");
[...d.querySelectorAll(".ship")].forEach(c=>{
  const g=q=>c.querySelector(q)?.textContent.trim().replace(/\s+/g," ")??"";
  console.log("  "+g(".sname").padEnd(4), [...c.querySelectorAll(".sfaces")].map(x=>x.textContent.trim()).join(" · ").padEnd(34),
    g(".sline"),
    "| "+g(".sbuy"), c.classList.contains("can")?"":"(dimmed)");
});
// the face counts must equal what the engine scores
console.log("\nface counts vs the engine:");
for(const sd of [4,6,8,10]){
  let hit=0,blk=0;
  for(let v=1;v<=sd;v++){ const t=w.tally([{sides:sd,value:v}],null,2,null);
    hit+=t.attack?1:0; blk+=t.defense?1:0; }
  const card=[...d.querySelectorAll(".ship")].find(c=>c.querySelector(".sname").textContent==="d"+sd);
  const said=card.querySelector(".sfaces").textContent.match(/\d+/g).map(Number);
  console.log("  d"+sd, "engine", hit+"hit/"+blk+"block", "· card says", said[0]+"hit/"+said[1]+"block",
    (hit===said[0]&&blk===said[1])?"✓":"✗ MISMATCH");
}
console.log("\nFLEET GRID:", [...d.querySelectorAll(".card")].length, "cards ·",
  d.querySelectorAll(".grid > div").length, "cells");
[...d.querySelectorAll(".grid > div")].forEach((c,i)=>{
  const t=c.classList.contains("flag")?"FLAGSHIP "+c.querySelector(".fcap").textContent+" ("+c.querySelector(".chg").textContent+")"
    :c.classList.contains("slot")?"berth "+c.querySelector(".slotno").textContent+" free"
    :c.querySelector(".kind").textContent+" — "+c.querySelector(".scrapb").textContent;
  console.log("  "+(i+1)+". "+t);
});
console.log("\nSHARED-FACES NOTE:", d.querySelector(".samefaces").textContent.replace(/\s+/g," ").trim());
console.log("\nerrors:", errs.length?errs:"none");
