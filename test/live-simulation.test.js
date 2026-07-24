import test from "node:test";
import assert from "node:assert/strict";
import {
  simulateProductionRun,
  summarizeProductionStrategy
} from "../scripts/simulate-live-game.mjs";

test("production strategy runs are deterministic and complete", () => {
  const first = simulateProductionRun("sidegrade", 9173);
  const second = simulateProductionRun("sidegrade", 9173);
  assert.deepEqual(first, second);
  assert.equal(first.version, 2);
  assert.ok(first.score > 0);
  assert.equal(first.ships, 4);
  assert.ok(first.forgedFaces >= 4);
});

test("five distinct production strategies remain competitively viable", () => {
  const strategies = ["balanced", "swarm", "capital", "sidegrade", "reactor"];
  const summaries = strategies.map((strategy) => summarizeProductionStrategy(strategy, 300));
  const averages = summaries.map((summary) => summary.average);
  const lowest = Math.min(...averages);
  const highest = Math.max(...averages);
  assert.ok(lowest >= highest * 0.82, JSON.stringify(summaries, null, 2));
  assert.ok(summaries.every((summary) => summary.p90 > summary.median));
});

