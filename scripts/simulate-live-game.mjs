import { fileURLToPath } from "node:url";
import {
  GAME_VERSION,
  advanceAfterReveal,
  buyShip,
  buyTrack,
  createInitialState,
  currentThreat,
  forgeFace,
  launchOrders,
  lockOrders,
  overclock,
  previewOrders,
  repairShip,
  rerollSelected,
  setOrder,
  toggleSelection,
  upsizeShip
} from "../fleet-game-engine.js";

const ORDER_BY_SYMBOL = Object.freeze({
  laser: "intercept",
  rocket: "bombard",
  shield: "screen",
  speed: "maneuver"
});

const COUNTER_TO_ENEMY = Object.freeze({
  speed: "laser",
  shield: "rocket",
  laser: "shield",
  rocket: "speed"
});

function preferredSymbol(state, strategy) {
  const threat = currentThreat(state);
  if (["laser", "rocket", "shield", "speed"].includes(threat.objective)) return threat.objective;
  if (strategy === "interceptors") return state.round % 2 ? "laser" : "speed";
  if (strategy === "siege-line") return state.round % 2 ? "shield" : "rocket";
  return COUNTER_TO_ENEMY[threat.wildPriority[0]] || "laser";
}

function chooseOrder(state, strategy) {
  setOrder(state, ORDER_BY_SYMBOL[preferredSymbol(state, strategy)]);
}

function repairFleet(state) {
  const critical = [...state.ships]
    .filter((ship) => ship.stress >= ship.structure)
    .sort((left, right) => left.structure - right.structure);
  for (const ship of critical) {
    if (state.resources.energy < 1) break;
    repairShip(state, ship.id);
  }
  if (state.resources.energy < 4) return;
  const damaged = [...state.ships]
    .filter((ship) => ship.stress > 0)
    .sort((left, right) => right.stress - left.stress);
  if (damaged[0]) repairShip(state, damaged[0].id);
}

function attemptActions(actions) {
  for (const action of actions) {
    const result = action();
    if (result.ok) return true;
  }
  return false;
}

function forgeCandidate(state, preferred, options = {}) {
  const ships = [...state.ships].sort((left, right) => left.sides - right.sides);
  const candidates = ships.flatMap((ship) => ship.faces.map((face, faceIndex) => ({ ship, face, faceIndex })))
    .filter(({ face }) => !face.forged && face.symbol !== preferred && (!options.onlyVoid || face.symbol === "void"))
    .sort((left, right) => {
      const leftReinforced = left.ship.forgeReinforcement ? 1 : 0;
      const rightReinforced = right.ship.forgeReinforcement ? 1 : 0;
      if (options.reinforceFirst && leftReinforced !== rightReinforced) return leftReinforced - rightReinforced;
      const leftVoid = left.face.symbol === "void" ? 0 : 1;
      const rightVoid = right.face.symbol === "void" ? 0 : 1;
      if (options.voidFirst !== false && leftVoid !== rightVoid) return leftVoid - rightVoid;
      if (left.face.value !== right.face.value) return right.face.value - left.face.value;
      return left.ship.sides - right.ship.sides;
    });
  return candidates[0];
}

function tryForge(state, symbol, options) {
  const candidate = forgeCandidate(state, symbol, options);
  return candidate
    ? forgeFace(state, candidate.ship.id, candidate.faceIndex, symbol)
    : { ok: false };
}

function upsizeTargets(state, familyOrder = []) {
  const priority = new Map(familyOrder.map((family, index) => [family, index]));
  return [...state.ships].sort((left, right) => {
    const familyDifference = (priority.get(left.family) ?? 99) - (priority.get(right.family) ?? 99);
    if (familyDifference) return familyDifference;
    return right.sides - left.sides;
  });
}

function takeMajorAction(state, strategy) {
  if (state.workshopActionTaken) return;
  const symbol = preferredSymbol(state, strategy);
  const upsize = (families) => upsizeTargets(state, families).map((ship) => () => upsizeShip(state, ship.id));

  if (strategy === "capital") {
    attemptActions([
      ...upsize(["core", "engineer", "bulwark", "siege", "interceptor"]),
      () => buyTrack(state, "reactor"),
      () => tryForge(state, symbol)
    ]);
    return;
  }

  if (strategy === "swarm") {
    attemptActions([
      ...(state.ships.length < 5 ? [() => buyShip(state, state.ships.length % 2 ? "bulwark" : "interceptor")] : []),
      () => buyTrack(state, ["laser", "rocket"].includes(symbol) ? "gunnery" : "operations"),
      () => tryForge(state, symbol),
      ...upsize([])
    ]);
    return;
  }

  if (strategy === "forge") {
    const forgedFaces = state.ships.flatMap((ship) => ship.faces).filter((face) => face.forged).length;
    attemptActions([
      () => tryForge(state, symbol, { onlyVoid: true }),
      ...(state.tracks.foundry < 1 ? [() => buyTrack(state, "foundry")] : []),
      ...(forgedFaces < 5 ? [() => tryForge(state, symbol, { reinforceFirst: true })] : []),
      ...upsize(["engineer", "core"]),
      () => buyShip(state, "engineer")
    ]);
    return;
  }

  if (strategy === "sidegrade") {
    attemptActions([
      ...(state.ships.length < 4 ? [() => buyShip(state, "bulwark")] : []),
      ...(state.tracks.foundry < 1 ? [() => buyTrack(state, "foundry")] : []),
      () => tryForge(state, symbol, { reinforceFirst: true }),
      ...upsize(["engineer", "core"])
    ]);
    return;
  }

  if (strategy === "reactor") {
    attemptActions([
      () => buyTrack(state, "reactor"),
      ...upsize(["core", "engineer"]),
      () => tryForge(state, symbol),
      () => buyShip(state, "engineer")
    ]);
    return;
  }

  if (strategy === "interceptors") {
    const interceptorCount = state.ships.filter((ship) => ship.family === "interceptor").length;
    attemptActions([
      ...(interceptorCount < 3
        ? [() => buyShip(state, "interceptor")]
        : []),
      ...upsize(["interceptor", "core"]),
      () => tryForge(state, symbol),
      () => buyTrack(state, ["laser", "rocket"].includes(symbol) ? "gunnery" : "operations")
    ]);
    return;
  }

  if (strategy === "siege-line") {
    const specialists = state.ships.filter((ship) => ["siege", "bulwark"].includes(ship.family)).length;
    attemptActions([
      ...(specialists < 2 ? [() => buyShip(state, specialists ? "bulwark" : "siege")] : []),
      ...upsize(["siege", "bulwark", "core"]),
      () => tryForge(state, symbol),
      () => buyTrack(state, ["laser", "rocket"].includes(symbol) ? "gunnery" : "operations")
    ]);
    return;
  }

  const track = state.round % 2 ? "operations" : "gunnery";
  attemptActions([
    ...(state.ships.length < 4 ? [() => buyShip(state, "bulwark")] : []),
    ...upsize(["core", "engineer", "interceptor", "bulwark"]),
    () => buyTrack(state, track),
    () => tryForge(state, symbol)
  ]);
}

function shapeOrders(state, strategy) {
  const reserve = strategy === "reactor" ? 1 : 0;
  const undesirable = Object.entries(state.rolls)
    .filter(([, roll]) => roll.symbol === "void" || (state.round === 10 && roll.symbol === "credits"))
    .map(([shipId]) => shipId)
    .slice(0, Math.max(0, state.resources.energy - reserve));

  if (undesirable.length) {
    for (const shipId of undesirable) toggleSelection(state, shipId);
    rerollSelected(state);
  }

  const preview = previewOrders(state);
  const usefulOutput = Object.values(preview.totals).reduce((total, value) => total + value, 0)
    + preview.gains.energy + preview.gains.credits;
  if (!state.overclockUsed && state.round >= 7 && usefulOutput < Object.keys(state.rolls).length) overclock(state);
}

export function simulateProductionRun(strategy = "balanced", seed = 1) {
  const state = createInitialState(strategy, seed);
  while (state.phase !== "complete") {
    if (state.phase === "workshop") {
      repairFleet(state);
      chooseOrder(state, strategy);
      takeMajorAction(state, strategy);
      const launched = launchOrders(state);
      if (!launched.ok) throw new Error(`${strategy} could not launch round ${state.round}: ${launched.message}`);
    } else if (state.phase === "rolling") {
      shapeOrders(state, strategy);
      const locked = lockOrders(state);
      if (!locked.ok) throw new Error(`${strategy} could not lock round ${state.round}: ${locked.message}`);
    } else if (state.phase === "reveal") {
      advanceAfterReveal(state);
    }
  }
  return {
    version: GAME_VERSION,
    strategy,
    seed,
    score: state.score,
    ships: state.ships.length,
    largestShip: Math.max(...state.ships.map((ship) => ship.sides)),
    forgedFaces: state.ships.flatMap((ship) => ship.faces).filter((face) => face.forged).length,
    tracks: { ...state.tracks },
    distress: state.distress,
    hits: state.roundHistory.reduce((total, round) => total + round.battle.teams.player.hits, 0)
  };
}

function percentile(sorted, fraction) {
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

export function summarizeProductionStrategy(strategy, iterations = 2000, seedOffset = 0) {
  const runs = Array.from({ length: iterations }, (_, index) => simulateProductionRun(strategy, seedOffset + index + 1));
  const scores = runs.map((run) => run.score).sort((left, right) => left - right);
  const average = scores.reduce((total, score) => total + score, 0) / scores.length;
  return {
    strategy,
    iterations,
    average: Number(average.toFixed(1)),
    p10: percentile(scores, 0.1),
    median: percentile(scores, 0.5),
    p90: percentile(scores, 0.9),
    maximum: scores.at(-1),
    averageHits: Number((runs.reduce((total, run) => total + run.hits, 0) / runs.length).toFixed(1)),
    averageDistress: Number((runs.reduce((total, run) => total + run.distress, 0) / runs.length).toFixed(2))
  };
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const iterations = Number.parseInt(process.argv[2] || "2000", 10);
  const strategies = ["balanced", "swarm", "capital", "forge", "sidegrade", "reactor", "interceptors", "siege-line"];
  console.table(strategies.map((strategy, index) => summarizeProductionStrategy(strategy, iterations, index * iterations)));
}
