import { JSDOM } from "jsdom";
import fs from "fs";

const src = fs.readFileSync(new URL("simple.html", import.meta.url), "utf8");
const dom = new JSDOM(src, { runScripts:"dangerously", pretendToBeVisual:true });
const errs = [], bad = [];
dom.virtualConsole.on("jsdomError", e => errs.push(String(e).split("\n")[0]));
dom.window.onerror = x => errs.push("onerror: " + x);
await new Promise(r => setTimeout(r, 200));
const w = dom.window, d = w.document;
const check = (ok, message) => { if (!ok) bad.push(message); };

w.newGame();
check(w.G.you.rolls === 0, "a round did not begin Ready");
check(d.querySelector("#reroll")?.textContent.includes("Roll 1 of 3"), "first button is not Roll 1 of 3");
check(d.querySelectorAll(".die.ready").length === 5, "the four ships and flagship are not Ready");
d.querySelector("#reroll").click();
check(w.G.you.rolls === 1 && w.G.you.values.every(v => v.dead || v.value > 0), "Roll 1 did not roll every die");

w.G.you.rolls = w.K("rollsPerRound");
w.G.you.energy = 5;
w.render();
d.querySelector("[data-flag]").click();
const paidFlag = d.querySelector("#reroll");
check(!paidFlag.disabled && paidFlag.textContent.includes("1⚡"), "flagship-only Energy reroll is unavailable");
paidFlag.click();
check(w.G.you.energy === 4, "flagship-only Energy reroll did not cost 1 Energy");
check(!d.querySelector("#page-reset"), "roll page still shows Reset choices");

d.querySelector("#costs").click();
check(w.G.phase === "costs", "Upgrade costs did not open");
d.querySelector("#costs").click();
check(w.G.phase === "roll", "tapping Upgrade costs again did not return to the game");

w.G.phase = "shop";
w.G.you.energy = 20;
w.savePageCheckpoint("shop");
w.render();
const firstShip = d.querySelector(".grid > .die:not(.flag)");
const grow = firstShip.querySelector(".growb");
const shipPicture = firstShip.querySelector(".hull");
check(grow && grow.compareDocumentPosition(shipPicture) & w.Node.DOCUMENT_POSITION_FOLLOWING,
  "Grow is not above the ship picture");
grow.click();
check(w.G.you.dice[0].s === 6, "Grow did not change the ship");
d.querySelector("#page-reset").click();
check(w.G.you.dice[0].s === 4 && w.G.you.energy === 20, "shop reset did not undo page choices");
check(!/\bhulls?\b/i.test(d.querySelector("#app").textContent), "the player-facing shop still says hull");
check(!/\d+\s+short\b/i.test(d.querySelector("#app").textContent), "the shop still shows shortfall math");

w.G.phase = "brace";
w.G.you.dice = [4,4,4,4].map(s => ({s, out:0}));
w.pending = { incoming:12, soaked:0, direct:1, you:{heal:0}, fed:[] };
w.render();
d.querySelector("[data-brace]").click();
d.querySelector("[data-brace]").click();
check(w.pending.fed.length === 2 && w.pending.soaked === 8, "could not select multiple ships");
d.querySelector("#brace-reset").click();
check(w.pending.fed.length === 0 && w.G.you.dice.every(s => s.out === 0),
  "brace reset did not restore selected ships");

w.G.phase = "roll";
w.G.you.rolls = 1;
w.G.resume = "roll";
w.G.phase = "help";
w.render();
check(d.querySelectorAll(".krow").length >= 10, "instructions do not list faces 1 through 10");
check(d.body.textContent.includes("War escalation is the long-game timer"),
  "instructions do not explain war escalation");
check(d.body.textContent.includes("Each ship showing 4 earns +2 Energy"),
  "flagship face 4 is not explained");

w.newGame();
w.doReroll();
w.submit();
if (w.G.phase === "brace") d.querySelector("#brace-done").click();
check(w.G.phase === "report", "could not reach a report");
check(d.querySelectorAll(".healthcard").length === 2, "report lacks two flagship health-change cards");
check(w.G.report.youHpAfter === w.G.report.youHpBefore + w.G.report.you.heal - w.G.report.themDealt,
  "your health-change card does not reconcile");
check(w.G.report.themHpAfter === w.G.report.themHpBefore + w.G.report.them.heal - w.G.report.youDealt,
  "Enemy health-change card does not reconcile");

console.log("v81 playtest requests:", bad.length ? bad : "all verified");
console.log("errors:", errs.length ? errs : "none");
dom.window.close();
if (bad.length || errs.length) process.exitCode = 1;
