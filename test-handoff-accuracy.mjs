import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
await new Promise(r=>setTimeout(r,200));
const w=dom.window; w.newGame();
const claims=[
 ["face 1 pays 2 Energy", w.energyOf(1)===2],
 ["face 2 fires 2 Direct", w.directOf(2)===2],
 ["face 3 repairs 3", w.healOf(3)===3],
 ["face 4 pays 1 Energy", w.energyOf(4)===1],
 ["grown faces escalate repair on 5/7/9", w.healOf(5)===1&&w.healOf(7)===2&&w.healOf(9)===3],
 ["grown faces escalate Direct on 6/8/10", w.directOf(6)===1&&w.directOf(8)===2&&w.directOf(10)===3],
 ["flagship faces are 1 Reactor 2 Direct 3 Repair 4 Energy 5 Shields 6 Attack",
   w.G.you.flag.faces.map(f=>w.FACES[f].name).join(",")==="Reactor,Direct,Repair,Energy,Shields,Attack"],
 ["level 1 bonus is 2", w.flagMul(w.G.you)===2],
 ["you start with 4 d4s, 4 open slots and 0 Energy",
   w.G.you.dice.length===4 && w.G.you.dice.every(d=>d.s===4) &&
   w.openSlots(w.G.you)===4 && w.G.you.energy===0],
 ["flagship health 60", w.G.you.hp===60],
 ["8 slots", w.K("maxDice")===8],
 ["a ship blocks its own size", w.soakOf(10)===10 && w.soakOf(4)===4],
 ["up to eight ships may absorb a volley", w.K("soakMax")===8],
 ["straights need 5", w.K("runMin")===5],
 ["prices 4/6/9/13", [4,6,9,13].every((p,i)=>w.priceOf([4,6,8,10][i])===p)],
 ["growth costs 2/3/4", [4,6,8].every((s,i)=>w.growCost(s)===[2,3,4][i])],
 ["slots 5/6/7/8 cost 7/8/9/10", [5,6,7,8].every((s,i)=>w.slotCost(s)===[7,8,9,10][i])],
 ["scrap 50%", w.K("sellBack")===50],
 ["upgrades 10 then 16", w.K("flagUp2")===10 && w.K("flagUp3")===16],
 ["reactor cap 6, overflow 2", w.K("reactorCap")===6 && w.K("reactorNow")===2],
 ["escalates after 8 by 4", w.K("escFrom")===8 && w.K("escPer")===4],
 ["botPace default 1", w.K("botPace")===1],
 ["5 in a row on d10 pays 15 Energy", w.straightReward(5,10).label==="15 Energy"],
 ["7 in a row on d10 pays 30 attack", w.straightReward(7,10).label==="30 attack"],
 ["8 in a row on d10 also pays as a 7", w.straightReward(8,10).label==="30 attack"],
];
let bad=0;
for(const [c,ok] of claims){ if(!ok){ bad++; console.log("  ✗ HANDOFF CLAIM WRONG:", c); } }
console.log(bad? "\n"+bad+" claims do not match the engine" : "all "+claims.length+" rule claims in HANDOFF match the engine");
