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

w.newGame();
check(w.VERSION === "86", "version is not v86");
check(w.G.guide === false, "guided first match should stay off");
check(!/Guided first match/i.test(d.body.textContent), "guided first match copy is still on the board");
check(!d.querySelector(".coach"), "coach tip box is still rendering");
check(w.G.you.flag.token && w.G.them.flag.token, "both fleets did not receive a Flagship Token");

d.getElementById("reroll").click();
check(!!d.querySelector("#fire"), "Fire button is missing after the first roll");
check(/Fire/i.test(d.querySelector("#fire")?.textContent || ""), "top lock button is not Fire");
check(d.querySelectorAll("[data-flagturn]").length === 2,
  "Flagship Token turn buttons are missing before roll 3");
w.G.you.flag.face = 0;
w.render();
d.querySelector('[data-flagturn="-1"]').click();
check(w.G.you.flag.face === 5, "Flagship Token did not wrap #1 down to #6");
check(w.G.you.flag.token === false, "Flagship Token was not consumed");
check(/Token spent/i.test(d.body.textContent), "spent Flagship Token status is missing");

w.newGame();
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
check(/Your ships/i.test(d.body.textContent), "ship upgrade heading is missing");
check(/Upgrade to d6/i.test(d.body.textContent), "ship upgrade button still says Grow");
check(!/\bgrow(?:ing)?\b/i.test(d.querySelector(".wrap").textContent),
  "between-round upgrade page still uses grow/growing");
check(!/Guided first match/i.test(d.body.textContent), "shop still shows guided tips");

w.G.phase = "help";
w.render();
check(d.querySelectorAll(".flagface").length === 6, "instructions do not show all six flagship faces");
check(/Both fleets receive one Flagship Token/i.test(d.body.textContent),
  "instructions do not explain the two Flagship Tokens");
check(!d.getElementById("guide-start"), "How to play still offers guided tips");
check(!/Guided first match/i.test(d.body.textContent), "How to play still advertises guided tips");

w.newGame();
w.G.them.flag.face = 5;
check(w.useFlagToken(w.G.them, 1), "opponent could not use its Flagship Token");
check(w.G.them.flag.face === 0 && !w.G.them.flag.token,
  "opponent Flagship Token did not wrap #6 up to #1 and consume itself");

w.newGame();
w.doReroll();
w.submit();
if (w.G.phase === "brace") d.querySelector("#brace-done").click();
check(w.G.phase === "report", "could not reach report for side-contrast check");
const youCard = d.querySelector(".reportside.you");
const enemyCard = d.querySelector(".reportside.enemy");
check(!!youCard && !!enemyCard, "report sides are missing");
check(/Your flagship/i.test(youCard.textContent) && /Enemy flagship/i.test(enemyCard.textContent),
  "report sides are not labeled You / Enemy");

console.log("v86 quiet solo board:", bad.length ? bad : "all verified");
console.log("errors:", errors.length ? errors : "none");
dom.window.close();
if (bad.length || errors.length) process.exitCode = 1;
