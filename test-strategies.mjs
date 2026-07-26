import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync("/sessions/lucid-amazing-edison/mnt/spacetribe-dice/simple.html","utf8");

// Strategies a real person might actually adopt.
const BUY={
  biggest:(w)=>{ for(const sd of [10,8,6,4]) if(w.G.you.energy>=w.priceOf(sd)) return sd; return 0; },
  swarm:(w)=>  { return w.G.you.energy>=w.priceOf(4)?4:0; },
  saveForTen:(w)=>{ if(w.G.you.energy>=w.priceOf(10)) return 10;
                    return w.G.you.dice.length<2 && w.G.you.energy>=w.priceOf(4) ? 4 : 0; },
  levelFirst:(w)=>0,      // handled separately: pour everything into flagship levels
};
async function run(opts,N){
  let wins=0,done=0,rd=0,lens=[];
  for(let m=0;m<N;m++){
    const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
    await new Promise(r=>setTimeout(r,90));
    const w=dom.window,d=dom.window.document; w.newGame();
    for(let r=0;r<400 && w.G.phase!=="over";r++){
      if(w.G.phase==="shop"){
        if(opts.levels){ const lvl=w.G.you.flag.lvl||1;
          const c=lvl<3?w.K("flagUp"+(lvl+1)):1e9;
          if(w.G.you.energy>=c){ w.G.you.energy-=c; w.G.you.flag.lvl=lvl+1; } }
        for(let g=0;g<4;g++){ const sd=opts.buy(w);
          if(!sd||w.G.you.dice.length>=w.K("maxDice")) break;
          w.G.you.energy-=w.priceOf(sd); w.G.you.dice.push(w.newShip(sd)); }
        w.startRound(); continue; }
      if(w.G.phase==="roll"){
        for(let k=1;k<w.K("rollsPerRound");k++){
          const keep=w.botHolds(w.G.you.values);
          for(let i=0;i<w.G.you.values.length;i++)
            if(!keep[i]) w.G.you.values[i].value=w.roll(w.G.you.values[i].sides); }
        w.submit(); continue; }
      if(w.G.phase==="brace"){
        if(opts.brace){ const p=d.querySelector("[data-brace]"); if(p) p.click(); }
        (d.getElementById("brace-done")||{click(){}}).click(); continue; }
      if(w.G.phase==="report"){ w.nextRound(); continue; }
      break;
    }
    if(w.G.phase==="over"){ done++; rd+=w.G.round; lens.push(w.G.round);
      if(w.G.them.hp<=0&&w.G.you.hp>0) wins++; }
    dom.window.close();
  }
  lens.sort((a,b)=>a-b);
  return {name:opts.name, matches:done, winPct:+(100*wins/done).toFixed(0),
          avgLen:+(rd/done).toFixed(1), shortest:lens[0], longest:lens[lens.length-1]};
}
const N=+process.argv[3]||14;
const which=process.argv[2];
const plans={
 "biggest-brace":{name:"buy biggest, always brace",   buy:BUY.biggest, brace:true,  levels:false},
 "biggest-never":{name:"buy biggest, never brace",    buy:BUY.biggest, brace:false, levels:false},
 "swarm":        {name:"only ever buy d4s",           buy:BUY.swarm,   brace:true,  levels:false},
 "saveten":      {name:"hoard for d10s only",         buy:BUY.saveForTen, brace:true, levels:false},
 "levels":       {name:"flagship levels first",       buy:BUY.biggest, brace:true,  levels:true},
 "levelsonly":   {name:"levels only, never buy ships",buy:BUY.levelFirst, brace:true, levels:true},
 "fillthentrade":{name:"fill all 8 slots, then trade up", brace:true, levels:false, buy:(w)=>{
    if(w.G.you.dice.length < w.K("maxDice")) return w.G.you.energy>=w.priceOf(4)?4:0;
    // slots full: scrap the smallest and buy the biggest we can afford
    let sm=0; for(let i=1;i<w.G.you.dice.length;i++) if(w.G.you.dice[i].s<w.G.you.dice[sm].s) sm=i;
    if(w.G.you.dice[sm].s>=10) return 0;
    const target=[10,8,6].find(sd=>sd>w.G.you.dice[sm].s &&
      w.G.you.energy + w.sellValue(w.G.you.dice[sm].s) >= w.priceOf(sd));
    if(!target || w.isDamaged(w.G.you.dice[sm])) return 0;
    w.G.you.energy += w.sellValue(w.G.you.dice[sm].s);
    w.G.you.dice.splice(sm,1);
    return target; }},
};
console.table([await run(plans[which],N)]);
