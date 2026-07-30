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
  assert.doesNotMatch(html, /react-loading-skeleton|Your site is taking shape|chatgpt\.site/i);
});

for (const [segments, expected] of [
  [["solo", "index.html"], "Fleet Dice solo game"],
  [["versus", "index.html"], "Create private match"],
  [["join", "index.html"], "Join a Match"],
  [["match", "index.html"], "Opening battlefield"],
]) {
  test(`static export includes ${segments.join("/")}`, () => {
    assert.match(readPage(...segments), new RegExp(expected, "i"));
  });
}

test("static export includes the solo game asset", () => {
  const solo = join(outDir, "fleet-dice-v83.html");
  assert.ok(existsSync(solo), "missing fleet-dice-v83.html in out/");
  assert.match(readFileSync(solo, "utf8"), /Fleet Dice|flagship/i);
});

test("asset paths use the GitHub Pages basePath", () => {
  const html = readPage("index.html");
  assert.match(html, new RegExp(`/${base}/`));
});
