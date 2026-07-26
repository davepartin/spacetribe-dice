import { JSDOM } from "jsdom"; import fs from "fs";
const file=process.argv[2];
const src=fs.readFileSync(file,"utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
await new Promise(r=>setTimeout(r,200));
const w=dom.window;
const rows=[];
for(const sd of [4,6,8,10]){
  let atk=0,def=0,nrg=0,rep=0,dir=0,N=4000;
  for(let i=0;i<N;i++){
    w.G.you.dice=Array.from({length:8},()=>({s:sd,out:0}));
    w.G.you.values=Array.from({length:8},()=>({sides:sd,value:w.roll(sd)}));
    w.G.you.flag.face=Math.floor(Math.random()*6);
    for(let k=1;k<w.K("rollsPerRound");k++){
      const keep=w.botHolds(w.G.you.values);
      for(let j=0;j<8;j++) if(!keep[j]) w.G.you.values[j].value=w.roll(sd);
    }
    const t=w.tally(w.runDice(w.G.you), w.flagFace(w.G.you), 2, null);
    atk+=t.attack; def+=t.defense; nrg+=t.energy; rep+=t.heal; dir+=t.direct;
  }
  const unblockable=(dir/N);
  rows.push({fleet:"8 x d"+sd, cost:8*w.priceOf(sd),
    attack:+(atk/N).toFixed(1), shields:+(def/N).toFixed(1),
    Energy:+(nrg/N).toFixed(1), repair:+(rep/N).toFixed(1), DIRECT:+unblockable.toFixed(2),
    "per 10 energy spent":+((atk/N/1 + unblockable*3 + rep/N*1.5)/(8*w.priceOf(sd))*10).toFixed(2)});
}
console.table(rows);
