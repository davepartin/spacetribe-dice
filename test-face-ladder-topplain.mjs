import { JSDOM } from "jsdom"; import fs from "fs";
const base=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const CURRENT_DIRECT=`function directOf(n){
  if (n === 2) return K("twoDirect");
  return { 6:1, 8:2, 10:3 }[n] || 0;
}`;
const CURRENT_HEAL=`function healOf(n){
  if (n === 3) return K("healThree");
  return { 5:1, 7:2, 9:3 }[n] || 0;
}`;
const VARIANTS={
 "A · v78 as it stood": {heal:"", dir:""},
 "B · your idea: 5 repairs 1, 6 fires 1 Direct":
   {heal:"if (n === 5) return 1;", dir:"if (n === 6) return 1;"},
 "C · B plus 8 fires 1, 9 repairs 1":
   {heal:"if (n === 5) return 1; if (n === 9) return 1;",
    dir:"if (n === 6) return 1; if (n === 8) return 1;"},
 "E · escalating but the TOP face stays plain (your preference)":
   {heal:"if (n === 5) return 1; if (n === 7) return 2; if (n === 9) return 3;",
    dir:"if (n === 6) return 1; if (n === 8) return 2;"},
};
for(const [label,v] of Object.entries(VARIANTS)){
  let src=base;
  if(!src.includes(CURRENT_DIRECT)||!src.includes(CURRENT_HEAL))
    throw new Error("face helpers changed; update this historical comparison");
  src=src.replace(CURRENT_DIRECT,
    'function directOf(n){ if (n === 2) return K("twoDirect"); '+v.dir+' return 0; }');
  src=src.replace(CURRENT_HEAL,
    'function healOf(n){ if (n === 3) return K("healThree"); '+v.heal+' return 0; }');
  const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
  await new Promise(r=>setTimeout(r,120));
  const w=dom.window; const rows=[];
  for(const sd of [4,6,8,10]){
    let atk=0,rep=0,dir=0,marked=0,N=2500;
    for(let n=1;n<=sd;n++) if(w.energyOf(n)||w.healOf(n)||w.directOf(n)) marked++;
    for(let i=0;i<N;i++){
      w.G.you.dice=Array.from({length:8},()=>({s:sd,out:0}));
      w.G.you.values=Array.from({length:8},()=>({sides:sd,value:w.roll(sd)}));
      w.G.you.flag.face=Math.floor(Math.random()*6);
      for(let k=1;k<w.K("rollsPerRound");k++){
        const keep=w.botHolds(w.G.you.values);
        for(let j=0;j<8;j++) if(!keep[j]) w.G.you.values[j].value=w.roll(sd);
      }
      const t=w.tally(w.runDice(w.G.you), w.flagFace(w.G.you), 2, null);
      atk+=t.attack; rep+=t.heal; dir+=t.direct;
    }
    rows.push({fleet:"8 x d"+sd, cost:8*w.priceOf(sd), "marked faces":marked+"/"+sd,
      attack:+(atk/N).toFixed(1), repair:+(rep/N).toFixed(1), DIRECT:+(dir/N).toFixed(2)});
  }
  console.log("\n"+label);
  console.table(rows);
  dom.window.close();
}
