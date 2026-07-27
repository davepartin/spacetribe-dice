import { JSDOM } from "jsdom"; import fs from "fs";
const file=process.argv[2], pace=process.argv[3], N=+process.argv[4];
const src=fs.readFileSync(new URL(file, import.meta.url),"utf8");
let wins=0,done=0,rd=0,theirBig=0,yourBig=0;
for(let m=0;m<N;m++){
  const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
  await new Promise(r=>setTimeout(r,95));
  const w=dom.window,d=dom.window.document;
  if(pace!=="-") w.C.botPace.v=+pace;
  w.newGame();
  for(let r=0;r<300 && w.G.phase!=="over";r++){
    if(w.G.phase==="shop"){
      for(let g=0;g<3;g++){ let got=false;
        for(const sd of [10,8,6,4]) if(w.G.you.dice.length<w.K("maxDice") &&
          w.G.you.energy>=w.priceOf(sd)){ w.G.you.energy-=w.priceOf(sd);
          w.G.you.dice.push(w.newShip(sd)); got=true; break; }
        if(!got) break; }
      w.startRound(); continue; }
    if(w.G.phase==="roll"){
      for(let k=1;k<w.K("rollsPerRound");k++){
        const keep=w.botHolds(w.G.you.values);
        for(let i=0;i<w.G.you.values.length;i++)
          if(!keep[i]) w.G.you.values[i].value=w.roll(w.G.you.values[i].sides); }
      w.submit(); continue; }
    if(w.G.phase==="brace"){ const p=d.querySelector("[data-brace]"); if(p)p.click();
      (d.getElementById("brace-done")||{click(){}}).click(); continue; }
    if(w.G.phase==="report"){ w.nextRound(); continue; }
    break;
  }
  if(w.G.phase==="over"){ done++; rd+=w.G.round;
    theirBig+=Math.max(...w.G.them.dice.map(x=>x.s)); yourBig+=Math.max(...w.G.you.dice.map(x=>x.s));
    if(w.G.them.hp<=0&&w.G.you.hp>0) wins++; }
  dom.window.close();
}
console.log("pace="+pace, "→ you win "+wins+"/"+done+" ("+(100*wins/done).toFixed(0)+"%)",
  "· avg length "+(rd/done).toFixed(1), "· biggest hull at the end: you d"+(yourBig/done).toFixed(1)+
  " them d"+(theirBig/done).toFixed(1));
