import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
const errs=[]; dom.virtualConsole.on("jsdomError",e=>errs.push(String(e).split("\n")[0]));
dom.window.onerror=x=>errs.push("onerror: "+x);
await new Promise(r=>setTimeout(r,200));
const w=dom.window,d=dom.window.document;
w.newGame();
// both reference pages must open and return cleanly from every phase that has a dock
const bad=[];
const reach=["roll","report","shop"];
for(const target of reach){
  // drive to the phase
  w.newGame();
  for(let i=0;i<40 && w.G.phase!==target;i++){
    if(w.G.phase==="roll") w.submit();
    else if(w.G.phase==="brace") (d.getElementById("brace-done")||{click(){}}).click();
    else if(w.G.phase==="report") w.nextRound();
    else if(w.G.phase==="shop") w.startRound();
    else break;
  }
  if(w.G.phase!==target){ bad.push("could not reach "+target); continue; }
  for(const [btn,page] of [["costs","costs"],["help","help"]]){
    const b=d.getElementById(btn);
    if(!b){ bad.push(target+": no #"+btn+" button"); continue; }
    b.click();
    if(w.G.phase!==page) bad.push(target+" → #"+btn+" landed on "+w.G.phase);
    if(!d.getElementById("back")) bad.push(page+" has no Back button");
    if(d.querySelector(".dock")) bad.push(page+" still shows the dock");
    d.getElementById("back").click();
    if(w.G.phase!==target) bad.push("Back from "+page+" landed on "+w.G.phase+" not "+target);
  }
  console.log(target.padEnd(7), "→ Energy and How-to-play both open and return ✓");
}
console.log("\nfaults:", bad.length?bad:"none");
console.log("errors:", errs.length?[...new Set(errs)]:"none");
