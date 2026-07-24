import {
  PROTOTYPE_STRATEGIES,
  runSoloPrototype
} from "../solo-battle-engine.js";

function readRuns() {
  const index = process.argv.indexOf("--runs");
  if (index < 0) return 2000;
  const value = Number(process.argv[index + 1]);
  if (!Number.isSafeInteger(value) || value < 1 || value > 100000) {
    throw new TypeError("--runs must be an integer from 1 to 100000");
  }
  return value;
}

function percentile(sorted, fraction) {
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * fraction));
  return sorted[index];
}

function mean(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function summarize(strategyId, runs) {
  const results = [];
  for (let seed = 1; seed <= runs; seed += 1) {
    results.push(runSoloPrototype(strategyId, seed));
  }

  const scores = results.map((result) => result.score).sort((left, right) => left - right);
  return {
    strategy: PROTOTYPE_STRATEGIES[strategyId].name,
    average: mean(scores).toFixed(1),
    median: percentile(scores, 0.5),
    p75: percentile(scores, 0.75),
    maximum: scores.at(-1),
    disabled: mean(results.map((result) => result.disabledRounds)).toFixed(2),
    distress: mean(results.map((result) => result.distress)).toFixed(2),
    actions: mean(results.map((result) => result.actionsCompleted)).toFixed(1),
    credits: mean(results.map((result) => result.credits)).toFixed(1),
    energy: mean(results.map((result) => result.energy)).toFixed(1)
  };
}

const runs = readRuns();
const summaries = Object.keys(PROTOTYPE_STRATEGIES).map((strategyId) => summarize(strategyId, runs));

console.log(`Prototype enemy-battle simulation — ${runs} seeds per strategy`);
console.table(summaries);
