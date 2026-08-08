import { JSDOM } from "jsdom";
import fs from "fs";

const src = fs.readFileSync(new URL("simple.html", import.meta.url), "utf8");
const dom = new JSDOM(src, {
  runScripts: "dangerously",
  pretendToBeVisual: true,
  url: "https://fleet-dice.test/"
});
const errors = [], bad = [];
dom.virtualConsole.on("jsdomError", e => errors.push(String(e).split("\n")[0]));
dom.window.onerror = x => errors.push("onerror: " + x);
await new Promise(r => setTimeout(r, 200));
const w = dom.window, d = w.document;
const check = (condition, message) => { if (!condition) bad.push(message); };

try { w.localStorage.removeItem("fleet-dice-guided-v85"); } catch {}
w.newGame(true);
check(w.VERSION === "85", "version is not v85");
check(w.G.guide === true, "guided first match did not start");
check(/center die is your flagship/i.test(d.body.textContent), "ready guidance is missing");
check(/How to play/i.test(d.body.textContent), "How to play tip is missing from ready guidance");
check(w.G.you.flag.token && w.G.them.flag.token, "both fleets did not receive a Flagship Token");

d.getElementById("reroll").click();
check(/Choose which dice to reroll/i.test(d.body.textContent), "reroll coaching is missing");
check(/d4 only rolls 1.4/i.test(d.body.textContent), "straight and d4 coaching is missing");
check(!!d.querySelector("#fire"), "Fire button is missing after the first roll");
check(/Fire/i.test(d.querySelector("#fire")?.textContent || ""), "top lock button is not Fire");
check(d.querySelectorAll("[data-flagturn]").length === 2,
  "Flagship Token turn buttons are missing before roll 3");
w.G.you.flag.face = 0;
w.render();
d.querySelector('[data-flagturn="-1"]').click();
check(w.G.you.flag.face === 5, "Flagship Token did not wrap #1 down to #6");
check(w.G.you.flag.token === false, "Flagship Token was not consumed");
check(/Flagship Token used/i.test(d.body.textContent), "spent Flagship Token status is missing");
for (let roll = 2; roll <= 3; roll++){
  d.querySelector("[data-die]").click();
  d.getElementById("reroll").click();
}

w.newGame(true);
d.getElementById("guide-skip").click();
check(w.G.guide === false, "Skip guide did not turn guidance off");

w.newGame(false);
d.getElementById("costs").click();
check(d.querySelectorAll("[data-jump]").length === 6, "upgrade page does not have six jump buttons");
for (const id of ["cost-buy","cost-upgrade","cost-slots","cost-flagship","cost-rerolls","cost-energy"])
  check(!!d.getElementById(id), "missing upgrade jump target " + id);
let jumped = false;
d.getElementById("cost-upgrade").scrollIntoView = () => { jumped = true; };
d.querySelector('[data-jump="cost-upgrade"]').click();
check(jumped, "upgrade jump button did not reach its section");
check(!/\bgrow(?:ing)?\b/i.test(d.querySelector(".wrap").textContent),
  "upgrade costs page still uses grow/growing");

w.G.phase = "shop";
w.G.guide = false;
w.G.you.energy = 40;
w.render();
check(/Upgrade the ships you own/i.test(d.body.textContent), "ship upgrade heading is missing");
check(/Upgrade to d6/i.test(d.body.textContent), "ship upgrade button still says Grow");
check(!/\bgrow(?:ing)?\b/i.test(d.querySelector(".wrap").textContent),
  "between-round upgrade page still uses grow/growing");

w.G.phase = "help";
w.render();
check(d.querySelectorAll(".flagface").length === 6, "instructions do not show all six flagship faces");
check(/Both fleets receive one Flagship Token/i.test(d.body.textContent),
  "instructions do not explain the two Flagship Tokens");
check(!!d.getElementById("guide-start"), "instructions cannot turn guided tips back on");

w.newGame(false);
w.G.them.flag.face = 5;
check(w.useFlagToken(w.G.them, 1), "opponent could not use its Flagship Token");
check(w.G.them.flag.face === 0 && !w.G.them.flag.token,
  "opponent Flagship Token did not wrap #6 up to #1 and consume itself");

w.newGame(false);
w.doReroll();
w.submit();
if (w.G.phase === "brace") d.getElementById("brace-done").click();
check(w.G.phase === "report", "could not reach report for side-contrast check");
check(!!d.querySelector(".healthcard.you") && !!d.querySelector(".healthcard.enemy"),
  "report health cards do not carry distinct You and Enemy styles");
check(!!d.querySelector(".board .you-score") && !!d.querySelector(".board .enemy-score"),
  "top health bar does not carry the same You and Enemy side themes");
const signedHealth = n => n > 0 ? "+" + n : (n < 0 ? "−" + Math.abs(n) : "0");
const youHealthChange = Math.max(0, w.G.report.youHpAfter) - Math.max(0, w.G.report.youHpBefore);
const enemyHealthChange = Math.max(0, w.G.report.themHpAfter) - Math.max(0, w.G.report.themHpBefore);
check(d.querySelector(".healthcard.you .healthnet b").textContent === signedHealth(youHealthChange) &&
      d.querySelector(".healthcard.enemy .healthnet b").textContent === signedHealth(enemyHealthChange),
  "report health cards do not show the signed total health change");
check(!!d.querySelector(".reportside.you .rolls") && !!d.querySelector(".reportside.enemy .rolls") &&
      !!d.querySelector(".reportside.you .led") && !!d.querySelector(".reportside.enemy .led"),
  "report does not keep rolls and damage inside the themed You and Enemy columns");
const yourFlagChip = d.querySelector(".reportside.you .chip.fl");
const enemyFlagChip = d.querySelector(".reportside.enemy .chip.fl");
check(yourFlagChip.style.background === w.flagTint(w.G.report.youFace).fill &&
      enemyFlagChip.style.background === w.flagTint(w.G.report.themFace).fill,
  "report flagship chips do not reuse the rolled flagship face colors");
check(!!d.querySelector(".lr.tone-red") && !!d.querySelector(".lr.tone-blue") &&
      !!d.querySelector(".lr.tone-dir"),
  "report does not apply the Attack, Shields and Direct colors to ledger labels");
check(/Your flagship/i.test(d.body.textContent) && /Enemy flagship/i.test(d.body.textContent),
  "report does not name both flagship sides");
check(!/\bThem\b|\bTheir\b/.test(d.querySelector(".wrap").textContent),
  "report still calls the opponent Them or Their");

console.log("v82 guided match, upgrade navigation, flagship faces and tokens:",
  bad.length ? bad : "all verified");
console.log("errors:", errors.length ? errors : "none");
if (bad.length || errors.length) process.exitCode = 1;
dom.window.close();
