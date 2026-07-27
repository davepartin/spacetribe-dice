import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync("/sessions/lucid-amazing-edison/mnt/spacetribe-dice/simple.html","utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
await new Promise(r=>setTimeout(r,200));
const w=dom.window; w.newGame();
const claims=[
 ["face 1 pays 2 Energy", w.energyOf(1)===2],
 ["face 2 fires 2 Direct", w.directOf(2)===2],
 ["face 3 repairs 3", w.healOf(3)===3],
 ["face 4 pays 1 Energy", w.energyOf(4)===1],
 ["face 5 pays nothing extra", !w.energyOf(5)&&!w.healOf(5)&&!w.directOf(5)],
 ["flagship faces are 1 Reactor 2 Direct 3 Repair 4 Energy 5 Shields 6 Attack",
   w.G.you.flag.faces.map(f=>w.FACES[f].name).join(",")==="Reactor,Direct,Repair,Energy,Shields,Attack"],
 ["level 1 bonus is 2", w.flagMul(w.G.you)===2],
 ["you start with 4 d4s and 0 Energy",
   w.G.you.dice.length===4 && w.G.you.dice.every(d=>d.s===4) && w.G.you.energy===0],
 ["flagship health 60", w.G.you.hp===60],
 ["8 slots", w.K("maxDice")===8],
 ["a ship blocks its own size", w.soakOf(10)===10 && w.soakOf(4)===4],
 ["one ship a round", w.K("soakMax")===1],
 ["straights need 5", w.K("runMin")===5],
 ["prices 4/6/9/13", [4,6,9,13].every((p,i)=>w.priceOf([4,6,8,10][i])===p)],
 ["scrap 50%", w.K("sellBack")===50],
 ["upgrades 16 then 26", w.K("flagUp2")===16 && w.K("flagUp3")===26],
 ["reactor cap 6, overflow 2", w.K("reactorCap")===6 && w.K("reactorNow")===2],
 ["escalates after 8 by 2", w.K("escFrom")===8 && w.K("escPer")===2],
 ["botPace default 1.75", w.K("botPace")===1.75],
 ["5 in a row on d10 pays 15 Energy", w.straightReward(5,10).label==="15 Energy"],
 ["8 in a row on d10 gives a free d10 and 20 attack", w.straightReward(8,10).label==="a free d10 and 20 attack"],
];
let bad=0;
for(const [c,ok] of claims){ if(!ok){ bad++; console.log("  ✗ HANDOFF CLAIM WRONG:", c); } }
console.log(bad? "\n"+bad+" claims do not match the engine" : "all "+claims.length+" rule claims in HANDOFF match the engine");
