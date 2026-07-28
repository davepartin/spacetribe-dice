import { JSDOM } from "jsdom";
import fs from "fs";

const src = fs.readFileSync(new URL("simple.html", import.meta.url), "utf8");
const errors = [], bad = [];
const check = (ok, message) => { if (!ok) bad.push(message); };

async function boot(){
  const dom = new JSDOM(src, { runScripts:"dangerously", pretendToBeVisual:true });
  dom.virtualConsole.on("jsdomError", e => errors.push(String(e).split("\n")[0]));
  await new Promise(r => setTimeout(r, 90));
  return dom;
}

const dom = await boot();
const w = dom.window, d = w.document;
check(w.VERSION === "84", "version is not v84");

w.C.enemyPlan.v = 1;
w.newGame(false);
check(w.G.them.plan === "width", "forced plan 1 is not Width");

w.G.phase = "shop";
w.render();
check(/Enemy · going wide/i.test(d.body.textContent), "shop does not show Width plan");
check(/Enemy is going wide/i.test(d.body.textContent), "shop missing Width sentence");

w.C.enemyPlan.v = 2;
w.newGame(false);
w.G.phase = "shop";
w.render();
check(w.G.them.plan === "capital", "forced plan 2 is not Capital");
check(/Enemy · building capital/i.test(d.body.textContent), "shop does not show Capital plan");

w.C.enemyPlan.v = 3;
w.newGame(false);
w.G.phase = "shop";
w.render();
check(w.G.them.plan === "command", "forced plan 3 is not Command");
check(/Enemy · flagship command/i.test(d.body.textContent), "shop does not show Command plan");

// Plans grow differently at pace 1
function shapeAfter(planId, throughRound, N=80){
  let ships=0, big=0, total=0, lvl=0;
  for (let i=0;i<N;i++){
    w.C.enemyPlan.v = planId;
    w.C.botPace.v = 1;
    w.newGame(false);
    for (let r=1;r<=throughRound;r++){ w.G.round=r; w.themGrow(); }
    ships += w.G.them.dice.length;
    big += Math.max(...w.G.them.dice.map(d=>d.s));
    total += w.G.them.dice.reduce((a,d)=>a+d.s,0);
    lvl += w.G.them.flag.lvl || 1;
  }
  return {
    ships: +(ships/N).toFixed(1),
    biggest: +(big/N).toFixed(1),
    sides: +(total/N).toFixed(1),
    flag: +(lvl/N).toFixed(2)
  };
}

const width = shapeAfter(1, 12);
const capital = shapeAfter(2, 12);
const commandEarly = shapeAfter(3, 6);
const widthEarly = shapeAfter(1, 6);
console.log("After 12 rounds at pace 1:", { width, capital });
console.log("After 6 rounds flagship:", { width: widthEarly.flag, command: commandEarly.flag });

check(width.ships > capital.ships, "Width should own more ships than Capital");
check(capital.biggest > width.biggest, "Capital should grow a bigger largest ship than Width");
check(commandEarly.flag > widthEarly.flag, "Command should hold a higher flagship level than Width by mid-match");
check(w.ENEMY_PLANS.width.name === "Width", "plan catalogue missing");

w.C.enemyPlan.v = 0;
const seen = {};
for (let i=0;i<60;i++){ w.newGame(false); seen[w.G.them.plan] = true; }
check(seen.width && seen.capital && seen.command, "random plan pick never saw all three");

w.G.phase = "help";
w.render();
check(/Width|Capital|Command/.test(d.body.textContent), "How to play does not mention Enemy plans");

console.log("enemy plan:", bad.length ? bad : "all verified");
console.log("errors:", errors.length ? errors : "none");
dom.window.close();
if (bad.length || errors.length) process.exitCode = 1;
