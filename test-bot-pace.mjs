import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
await new Promise(r=>setTimeout(r,200));
const w=dom.window;
// Force Width so the pace dial is measured against one plan, not a random mix.
w.C.enemyPlan.v = 1;
console.log("Opponent Width plan after 12 rounds, 400 runs each:\n");
const rows=[];
for(const pace of [0.5,0.75,1,1.5,2,3]){
  w.C.botPace.v=pace;
  let ships=0,big=0,lvl=0,total=0,N=400;
  for(let i=0;i<N;i++){
    w.newGame();
    for(let r=1;r<=12;r++){ w.G.round=r; w.themGrow(); }
    ships+=w.G.them.dice.length;
    big+=Math.max(...w.G.them.dice.map(d=>d.s));
    total+=w.G.them.dice.reduce((a,d)=>a+d.s,0);
    lvl+=w.G.them.flag.lvl||1;
  }
  rows.push({pace, ships:+(ships/N).toFixed(1), "biggest hull":"d"+(big/N).toFixed(1),
    "total sides":+(total/N).toFixed(1), "flagship level":+(lvl/N).toFixed(2)});
}
console.table(rows);
