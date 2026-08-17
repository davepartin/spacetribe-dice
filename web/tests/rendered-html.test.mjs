import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const outDir = fileURLToPath(new URL("../out", import.meta.url));
const base = "spacetribe-dice";

function readPage(...segments) {
  const file = join(outDir, ...segments);
  assert.ok(existsSync(file), `missing export: ${file}`);
  return readFileSync(file, "utf8");
}

test("static export includes the Fleet Dice home screen", () => {
  const html = readPage("index.html");
  assert.match(html, /<title>Fleet Dice<\/title>/i);
  assert.match(html, /fleet-dice-key-art\.png/);
  assert.match(html, /Build the fleet\. Break the flagship/i);
  assert.match(html, /Play solo/);
  assert.match(html, /Battle a friend/);
  assert.match(html, /Fleet Dice 2/);
  assert.match(html, /Join the fight/);
  assert.match(html, /Winners from the last 30 days/);
  assert.match(html, /\/spacetribe-dice\/how-to-play\//);
  assert.doesNotMatch(html, /react-loading-skeleton|Your site is taking shape|chatgpt\.site/i);
});

for (const [segments, expected] of [
  [["solo", "index.html"], "Fleet Dice solo game"],
  [["solo-v2", "index.html"], "Fleet Dice 2 prototype"],
  [["versus", "index.html"], "Create private match"],
  [["join", "index.html"], "Join a Match"],
  [["match", "index.html"], "Opening battlefield"],
  [["how-to-play", "index.html"], "Back to Fleet Dice home"],
]) {
  test(`static export includes ${segments.join("/")}`, () => {
    assert.match(readPage(...segments), new RegExp(expected, "i"));
  });
}

test("versus launcher explains empty rooms get closed", () => {
  assert.match(readPage("versus", "index.html"), /empty room waiting/i);
});

test("solo-v2 iframe cache-busts the prototype file", () => {
  assert.match(readPage("solo-v2", "index.html"), /fleet-dice-2\.html\?v=2\.10/);
});

test("solo page has quit and home controls", () => {
  const html = readPage("solo", "index.html");
  assert.match(html, /Quit game/i);
  assert.match(html, />Home</);
  assert.match(html, /fleet-dice-v88\.html/);
});

test("static export includes the solo game asset", () => {
  const solo = join(outDir, "fleet-dice-v88.html");
  assert.ok(existsSync(solo), "missing fleet-dice-v88.html in out/");
  const html = readFileSync(solo, "utf8");
  assert.match(html, /Fleet Dice|flagship/i);
  assert.match(html, /quitToHome/);
  assert.match(html, /Back home/);
  assert.match(html, /dieBump|playRollBump/);
});

test("static export includes the Fleet Dice 2 prototype", () => {
  const file = join(outDir, "fleet-dice-2.html");
  assert.ok(existsSync(file), "missing fleet-dice-2.html in out/");
  const html = readFileSync(file, "utf8");
  assert.match(html, /Fleet Dice 2/);
  assert.match(html, /dieTumble0/);
  assert.match(html, /VERSION = "2\.10"/);
  assert.match(html, /live-tot/);
  assert.match(html, /Turn flagship/);
  assert.match(html, /Straights earn a bonus/);
  assert.match(html, /nrg-line/);
  assert.match(html, /atk-line/);
  assert.match(html, /linePay/);
  assert.match(html, /sides \* sides \/ 4/);
  assert.match(html, /Formation lines/);
  assert.match(html, /Across · Energy/);
  assert.match(html, /Down · Attack/);
  assert.match(html, /flagship is a <b>d6<\/b>/);
  assert.match(html, /Centre lines only work with/);
  assert.match(html, /idx:\[3,4,5\]/);
  assert.match(html, /idx:\[1,4,7\]/);
  assert.doesNotMatch(html, /never in a line/);
  assert.doesNotMatch(html, /No straight yet/);
  assert.match(html, /reroll-mark/);
  assert.doesNotMatch(html, /\.die\.sel::after\{content:"REROLL"/);
  assert.match(html, /stage-docked/);
  assert.match(html, /energy-score/);
  assert.match(html, /shop-flag-lvl/);
  assert.doesNotMatch(html, /shop-flagship[\s\S]{0,280}brace-flag-hp/);
});

test("asset paths use the GitHub Pages basePath", () => {
  const html = readPage("index.html");
  assert.match(html, new RegExp(`/${base}/`));
});
