import test from "node:test";
import assert from "node:assert/strict";
import { cleanEntry, keepTopScoresByVersion } from "../server.js";

test("battle scores keep their score version and battle breakdown", () => {
  const entry = cleanEntry({
    name: "Nova <Pilot>",
    score: 117,
    scoreVersion: 2,
    runId: "run-22_safe",
    breakdown: { apogee: 21, ships: 5, bestTrack: 3, hits: 42, distress: 2 }
  });
  assert.equal(entry.name, "Nova Pilot");
  assert.equal(entry.scoreVersion, 2);
  assert.deepEqual(entry.breakdown, {
    apogee: 21,
    dice: 0,
    ships: 5,
    bestTrack: 3,
    hits: 42,
    distress: 2
  });
});

test("classic and battle leaderboards each retain their own top ten", () => {
  const scores = [];
  for (let version = 1; version <= 2; version += 1) {
    for (let index = 0; index < 12; index += 1) {
      scores.push({
        name: `V${version}-${index}`,
        scoreVersion: version,
        score: index,
        runId: `v${version}-${index}`,
        createdAt: new Date(2026, 0, index + 1).toISOString()
      });
    }
  }
  const top = keepTopScoresByVersion(scores);
  assert.equal(top.length, 20);
  assert.equal(top.filter((entry) => entry.scoreVersion === 1).length, 10);
  assert.equal(top.filter((entry) => entry.scoreVersion === 2).length, 10);
  assert.equal(Math.min(...top.map((entry) => entry.score)), 2);
});

