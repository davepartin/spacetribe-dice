import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
await new Promise(r=>setTimeout(r,200));
const w=dom.window,d=dom.window.document;
// Straight fight: fixed fleets, no shopping, both sides play their rolls the same way.
function fight(mine,theirs,N){
  let wins=0,done=0,rd=0;
  for(let m=0;m<N;m++){
    w.newGame();
    w.G.you.dice=mine.map(s=>({s,out:0}));
    w.G.them.dice=theirs.map(s=>({s,out:0}));
    for(let r=0;r<200 && w.G.phase!=="over";r++){
      if(w.G.phase==="shop"){ w.startRound(); continue; }   // themGrow still runs; accept it
      if(w.G.phase==="roll"){
        for(let k=1;k<w.K("rollsPerRound");k++){
          const keep=w.botHolds(w.G.you.values);
          for(let i=0;i<w.G.you.values.length;i++)
            if(!keep[i]) w.G.you.values[i].value=w.roll(w.G.you.values[i].sides); }
        w.submit(); continue; }
      if(w.G.phase==="brace"){ const p=d.querySelector("[data-brace]"); if(p) p.click();
        (d.getElementById("brace-done")||{click(){}}).click(); continue; }
      if(w.G.phase==="report"){ w.nextRound(); continue; }
      break; }
    if(w.G.phase==="over"){ done++; rd+=w.G.round; if(w.G.them.hp<=0&&w.G.you.hp>0) wins++; }
  }
  return (100*wins/done).toFixed(0)+"% over "+done+" ("+(rd/done).toFixed(1)+" rounds)";
}
const eight4=Array(8).fill(4), eight10=Array(8).fill(10), eight6=Array(8).fill(6);
console.log("Both sides frozen at eight ships. Bot growth is off because its fleet is set.\n");
console.log("  8 d4  vs 8 d10 :", fight(eight4, eight10, 26));
console.log("  8 d10 vs 8 d4  :", fight(eight10, eight4, 26));
console.log("  8 d6  vs 8 d10 :", fight(eight6, eight10, 26));
console.log("\nSame money instead of same count (about 100 Energy each):");
console.log("  8 d4 + nothing (32) vs 2 d10 (26):", fight(eight4, [10,10], 22));
