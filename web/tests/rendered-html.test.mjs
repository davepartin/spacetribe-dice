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
  assert.match(html, /Join the fight/);
  assert.match(html, /Winners from the last 30 days/);
  assert.match(html, /\/spacetribe-dice\/how-to-play\//);
  assert.doesNotMatch(html, /react-loading-skeleton|Your site is taking shape|chatgpt\.site/i);
});

for (const [segments, expected] of [
  [["solo", "index.html"], "Fleet Dice solo game"],
  [["versus", "index.html"], "Create private match"],
  [["join", "index.html"], "Join a Match"],
  [["match", "index.html"], "Opening battlefield"],
  [["how-to-play", "index.html"], "Back to Fleet Dice home"],
]) {
  test(`static export includes ${segments.join("/")}`, () => {
    assert.match(readPage(...segments), new RegExp(expected, "i"));
  });
}

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

test("asset paths use the GitHub Pages basePath", () => {
  const html = readPage("index.html");
  assert.match(html, new RegExp(`/${base}/`));
});
