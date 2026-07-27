import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
const errs=[]; dom.virtualConsole.on("jsdomError",e=>errs.push(String(e).split("\n")[0]));
dom.window.onerror=x=>errs.push("onerror: "+x);
await new Promise(r=>setTimeout(r,200));
const w=dom.window,d=dom.window.document;
w.newGame(); w.submit();
if(w.G.phase==="brace")(d.getElementById("brace-done")||{click(){}}).click();
w.nextRound();
const show=t=>{
  const bar=[...d.querySelectorAll(".lvl")].map(x=>x.querySelector(".ln").textContent+
    (x.classList.contains("now")?"◀ now":x.classList.contains("past")?" (past)":"")+
    " ["+x.querySelector(".lp").textContent.trim()+"]");
  const btn=d.querySelector("[data-flagup]");
  console.log(t);
  bar.forEach(b=>console.log("   "+b));
  console.log("   buy: "+(btn?JSON.stringify(btn.textContent)+(btn.disabled?" [off]":" [on]"):"— none, at ceiling"));
  console.log("   every face pays:", w.flagMul(w.G.you), "\n");
};
w.G.you.energy=4; w.render();   show("level 1, only 4 energy:");
w.G.you.energy=80; w.render();  show("level 1, plenty:");
d.querySelector("[data-flagup]").click(); show("after clicking upgrade:");
d.querySelector("[data-flagup]").click(); show("after clicking again:");
// prove the ring/multiplier actually moved with the level
w.G.you.values=[1,2,3,4,5,6].map(v=>({sides:10,value:v}));
w.G.you.flag.face=w.G.you.flag.faces.indexOf("atkEach");
const t=w.tally(w.runDice(w.G.you), "atkEach", w.flagMul(w.G.you), null);
const b=w.tally(w.runDice(w.G.you), null, 2, null);
console.log("level 3 Attack face over 1-6: flagship added", t.attack-b.attack,
  "attack across 3 even dice → +"+((t.attack-b.attack)/3)+" each (want 4)");
console.log("\nerrors:", errs.length?errs:"none");
