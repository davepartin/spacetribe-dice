import { JSDOM } from "jsdom";
import fs from "fs";

const src = fs.readFileSync(new URL("simple.html", import.meta.url), "utf8");
const sizes = [4, 6, 8, 10];

function growFirst(w, order = "small"){
  const candidates = w.G.you.dice
    .map((d, i) => ({ d, i, cost: w.growCost(d.s) }))
    .filter(x => w.nextSize(x.d.s) && !w.isDamaged(x.d) && x.cost <= w.G.you.energy)
    .sort((a, b) => order === "large" ? b.d.s - a.d.s : a.d.s - b.d.s);
  if (!candidates.length) return false;
  w.growDie(candidates[0].i);
  return true;
}

function buy(w, sides){
  if (w.G.you.dice.length >= w.openSlots(w.G.you) || w.G.you.energy < w.priceOf(sides)) return false;
  w.buyDie(sides);
  return true;
}

function openAndBuy(w, sides){
  const next = w.openSlots(w.G.you) + 1;
  if (next > w.K("maxDice")) return false;
  if (w.G.you.energy < w.slotCost(next) + w.priceOf(sides)) return false;
  w.unlockSlot();
  return buy(w, sides);
}

const PLANS = {
  formation(w){
    if (openAndBuy(w, 4)) return true;
    return false;
  },
  capital(w){
    if (w.openSlots(w.G.you) < 5 && openAndBuy(w, 6)) return true;
    return growFirst(w, "large");
  },
  balanced(w){
    if (w.openSlots(w.G.you) < 6 && openAndBuy(w, 6)) return true;
    if (growFirst(w, "small")) return true;
    return openAndBuy(w, 6);
  },
  command(w){
    const lvl = w.G.you.flag.lvl || 1;
    if (lvl < 3 && w.G.you.energy >= w.flagLvlCost(lvl + 1)){
      w.G.you.energy -= w.flagLvlCost(lvl + 1);
      w.G.you.flag.lvl = lvl + 1;
      w.render();
      return true;
    }
    return PLANS.balanced(w);
  },
  fillThenGrow(w){
    if (openAndBuy(w, 4)) return true;
    return growFirst(w, "small");
  },
};

async function run(name, matches, pace, escalationPer){
  let wins = 0, done = 0, rounds = 0, ships = 0, sides = 0, levels = 0;
  for (let m = 0; m < matches; m++){
    const dom = new JSDOM(src, { runScripts:"dangerously", pretendToBeVisual:true });
    await new Promise(r => setTimeout(r, 90));
    const w = dom.window, d = w.document;
    w.C.botPace.v = pace;
    if (escalationPer !== null) w.C.escPer.v = escalationPer;
    w.newGame();
    for (let guard = 0; guard < 400 && w.G.phase !== "over"; guard++){
      if (w.G.phase === "shop"){
        for (let action = 0; action < 20 && PLANS[name](w); action++);
        w.startRound();
      } else if (w.G.phase === "roll"){
        if (w.G.you.rolls === 0) w.doReroll();
        for (let r = 1; r < w.K("rollsPerRound"); r++){
          const keep = w.botHolds(w.G.you.values);
          for (let i = 0; i < w.G.you.values.length; i++)
            if (!keep[i]) w.G.you.values[i].value = w.roll(w.G.you.values[i].sides);
        }
        w.submit();
      } else if (w.G.phase === "brace"){
        while (w.G.you.hp -
          (Math.max(0,w.pending.incoming-w.pending.soaked)+w.pending.direct) <= 25){
          const options = [...d.querySelectorAll("[data-brace]")];
          if (!options.length) break;
          options[options.length - 1].click();
        }
        d.getElementById("brace-done").click();
      } else if (w.G.phase === "report"){
        w.nextRound();
      }
    }
    if (w.G.phase === "over"){
      done++;
      rounds += w.G.round;
      ships += w.G.you.dice.length;
      sides += w.G.you.dice.reduce((n, ship) => n + ship.s, 0);
      levels += w.G.you.flag.lvl || 1;
      if (w.G.them.hp <= 0 && w.G.you.hp > 0) wins++;
    }
    dom.window.close();
  }
  return {
    plan:name,
    pace,
    matches:done,
    "win%":Math.round(100 * wins / done),
    rounds:+(rounds / done).toFixed(1),
    ships:+(ships / done).toFixed(1),
    "total sides":+(sides / done).toFixed(1),
    flagship:+(levels / done).toFixed(1),
  };
}

const which = process.argv[2] || "all";
const N = +(process.argv[3] || 14);
const pace = +(process.argv[4] || 1);
const escalationPer = process.argv[5] === undefined ? null : +process.argv[5];
const names = which === "all" ? Object.keys(PLANS) : [which];
console.table(await Promise.all(names.map(name => run(name, N, pace, escalationPer))));
