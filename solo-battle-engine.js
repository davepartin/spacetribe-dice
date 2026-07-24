import {
  COMBAT_KEYS,
  assignStress,
  resolveLockedBattle
} from "./battle-engine.js";
import {
  BATTLE_SYMBOLS,
  BATTLE_SHIP_SIZES,
  SOLO_THREAT_SCHEDULE,
  createPrototypeShip,
  createThreatFleet
} from "./battle-content.js";

const DEFAULT_WILD_PRIORITY = Object.freeze(["laser", "rocket", "shield", "speed"]);

function isNonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function clonePlanShips(ships) {
  return ships.map((ship) => ({
    ...ship,
    forges: (ship.forges ?? []).map((forge) => ({ ...forge }))
  }));
}

function nextSize(sides) {
  const index = BATTLE_SHIP_SIZES.indexOf(sides);
  if (index < 0 || index >= BATTLE_SHIP_SIZES.length - 1) {
    throw new TypeError(`Ship-${sides} cannot Size Up`);
  }
  return BATTLE_SHIP_SIZES[index + 1];
}

const COMMON_START = Object.freeze([
  Object.freeze({ id: "core", family: "core", sides: 6 }),
  Object.freeze({ id: "engineer", family: "engineer", sides: 4 }),
  Object.freeze({ id: "interceptor-1", family: "interceptor", sides: 4 })
]);

const SIZE_COSTS = Object.freeze({
  6: Object.freeze({ credits: 2, energy: 1 }),
  8: Object.freeze({ credits: 3, energy: 1 }),
  10: Object.freeze({ credits: 4, energy: 1 }),
  12: Object.freeze({ credits: 5, energy: 1 }),
  20: Object.freeze({ credits: 6, energy: 2 })
});

const BUY_COST = Object.freeze({ credits: 4, energy: 0 });
const REPLACE_COST = Object.freeze({ credits: 2, energy: 0 });

const STRATEGY_DEFS = {
  balanced: {
    name: "Balanced Command",
    wildPriority: ["laser", "rocket", "shield", "speed"],
    spreadWilds: true,
    rerollPriority: ["void"],
    rerolls: 1,
    reserveEnergy: 1,
    damage: "small-first",
    base: COMMON_START,
    actions: [
      { round: 2, type: "buy", id: "bulwark", family: "bulwark" },
      { round: 3, type: "size", id: "core" },
      { round: 4, type: "size", id: "interceptor-1" },
      { round: 5, type: "size", id: "bulwark" },
      { round: 6, type: "size", id: "engineer" },
      { round: 7, type: "size", id: "core" },
      { round: 8, type: "size", id: "interceptor-1" },
      { round: 9, type: "size", id: "bulwark" },
      { round: 10, type: "size", id: "engineer" }
    ]
  },
  swarm: {
    name: "Six-Ship Swarm",
    wildPriority: ["laser", "rocket", "speed", "shield"],
    rerollPriority: ["void"],
    rerolls: 1,
    reserveEnergy: 0,
    damage: "large-first",
    base: COMMON_START,
    actions: [
      { round: 2, type: "buy", id: "siege-1", family: "siege" },
      { round: 3, type: "buy", id: "bulwark", family: "bulwark" },
      { round: 4, type: "buy", id: "interceptor-2", family: "interceptor" },
      { round: 5, type: "size", id: "engineer" },
      { round: 6, type: "size", id: "interceptor-1" },
      { round: 7, type: "size", id: "siege-1" },
      { round: 8, type: "size", id: "bulwark" },
      { round: 9, type: "size", id: "interceptor-2" }
    ]
  },
  capital: {
    name: "Capital Breakthrough",
    wildPriority: ["rocket", "laser", "shield", "speed"],
    rerollPriority: ["void"],
    rerolls: 1,
    reserveEnergy: 1,
    damage: "small-first",
    base: COMMON_START,
    actions: [
      { round: 2, type: "buy", id: "siege", family: "siege" },
      { round: 3, type: "size", id: "core" },
      { round: 4, type: "size", id: "core" },
      { round: 5, type: "size", id: "engineer" },
      { round: 6, type: "size", id: "core" },
      { round: 7, type: "size", id: "core" },
      { round: 8, type: "size", id: "siege" },
      { round: 9, type: "size", id: "interceptor-1" }
    ]
  },
  interceptor: {
    name: "Laser Interceptors",
    wildPriority: ["laser", "speed", "shield", "rocket"],
    rerollPriority: ["void", "rocket"],
    rerolls: 1,
    reserveEnergy: 1,
    damage: "small-first",
    base: COMMON_START,
    actions: [
      { round: 2, type: "buy", id: "interceptor-2", family: "interceptor" },
      { round: 3, type: "size", id: "interceptor-1" },
      { round: 4, type: "size", id: "interceptor-1" },
      { round: 5, type: "size", id: "interceptor-2" },
      { round: 6, type: "size", id: "core" },
      { round: 7, type: "size", id: "interceptor-1" },
      { round: 8, type: "size", id: "interceptor-2" },
      { round: 9, type: "size", id: "engineer" }
    ]
  },
  bulwark: {
    name: "Shield and Siege",
    wildPriority: ["shield", "rocket", "speed", "laser"],
    rerollPriority: ["void", "laser"],
    rerolls: 1,
    reserveEnergy: 1,
    damage: "small-first",
    base: COMMON_START,
    actions: [
      { round: 2, type: "buy", id: "bulwark", family: "bulwark" },
      { round: 3, type: "replace", removeId: "engineer", id: "siege", family: "siege" },
      { round: 4, type: "size", id: "bulwark" },
      { round: 5, type: "size", id: "siege" },
      { round: 6, type: "size", id: "bulwark" },
      { round: 7, type: "size", id: "core" },
      { round: 8, type: "size", id: "siege" },
      { round: 9, type: "size", id: "interceptor-1" },
      { round: 10, type: "size", id: "bulwark" }
    ]
  },
  forge: {
    name: "Forged Specialists",
    wildPriority: ["shield", "laser", "rocket", "speed"],
    spreadWilds: true,
    rerollPriority: ["void"],
    rerolls: 1,
    reserveEnergy: 1,
    damage: "small-first",
    base: COMMON_START,
    actions: [
      { round: 2, type: "buy", id: "siege", family: "siege" },
      { round: 3, type: "forge", id: "engineer", faceIndex: 3, symbol: "shield" },
      { round: 4, type: "forge", id: "interceptor-1", faceIndex: 3, symbol: "speed" },
      { round: 5, type: "forge", id: "siege", faceIndex: 3, symbol: "rocket" },
      { round: 6, type: "size", id: "core" },
      { round: 7, type: "forge", id: "core", faceIndex: 2, symbol: "shield" },
      { round: 8, type: "size", id: "siege" },
      { round: 9, type: "size", id: "engineer" },
      { round: 10, type: "forge", id: "engineer", faceIndex: 2, symbol: "rocket" }
    ]
  },
  reactor: {
    name: "Reactor Control",
    wildPriority: ["speed", "shield", "laser", "rocket"],
    spreadWilds: true,
    rerollPriority: ["void", "credits"],
    rerolls: 1,
    reserveEnergy: 2,
    damage: "small-first",
    base: COMMON_START,
    actions: [
      { round: 2, type: "track", track: "reactor" },
      { round: 3, type: "buy", id: "engineer-2", family: "engineer" },
      { round: 4, type: "track", track: "reactor" },
      { round: 5, type: "size", id: "engineer" },
      { round: 6, type: "size", id: "engineer-2" },
      { round: 7, type: "track", track: "reactor" },
      { round: 8, type: "size", id: "core" },
      { round: 9, type: "size", id: "engineer" },
      { round: 10, type: "track", track: "reactor" }
    ]
  }
};

export const PROTOTYPE_STRATEGIES = Object.freeze(Object.fromEntries(
  Object.entries(STRATEGY_DEFS).map(([id, strategy]) => [
    id,
    Object.freeze({ id, name: strategy.name })
  ])
));

export function createSeededRandom(seed) {
  if (!isNonNegativeInteger(seed)) throw new TypeError("Seed must be a non-negative integer");
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function planFleet(ships) {
  return ships.map((ship) => {
    const prototype = createPrototypeShip(ship.family, ship.sides, ship.id);
    for (const forge of ship.forges ?? []) {
      if (forge.faceIndex >= prototype.faces.length) {
        throw new RangeError(`Forged face ${forge.faceIndex} is not present on ${ship.id}`);
      }
      prototype.faces[forge.faceIndex] = {
        ...prototype.faces[forge.faceIndex],
        symbol: forge.symbol,
        value: forge.value,
        charge: forge.charge,
        fallback: forge.fallback,
        forged: true
      };
    }
    return prototype;
  });
}

function applyPlanAction(ships, action) {
  if (action.type === "buy") {
    if (ships.some((ship) => ship.id === action.id)) throw new TypeError(`Duplicate planned ship: ${action.id}`);
    ships.push({ id: action.id, family: action.family, sides: 4 });
    return;
  }
  if (action.type === "replace") {
    const index = ships.findIndex((ship) => ship.id === action.removeId);
    if (index < 0) throw new TypeError(`Unknown trade-in ship: ${action.removeId}`);
    if (ships.some((ship) => ship.id === action.id && ship.id !== action.removeId)) {
      throw new TypeError(`Duplicate planned ship: ${action.id}`);
    }
    ships.splice(index, 1, { id: action.id, family: action.family, sides: 4 });
    return;
  }
  if (action.type === "forge") {
    const ship = ships.find((candidate) => candidate.id === action.id);
    if (!ship) throw new TypeError(`Unknown forge ship: ${action.id}`);
    if (!BATTLE_SYMBOLS.includes(action.symbol) || ["wild", "void"].includes(action.symbol)) {
      throw new TypeError(`Invalid forged symbol: ${action.symbol}`);
    }
    const prototype = planFleet([ship])[0];
    const face = prototype.faces[action.faceIndex];
    if (!face) throw new RangeError(`Unknown face ${action.faceIndex} on ${action.id}`);
    const forge = {
      faceIndex: action.faceIndex,
      symbol: action.symbol,
      value: face.symbol === "void" ? 1 : face.value + 1,
      charge: face.symbol === "void" ? 0 : face.charge,
      fallback: face.symbol === "void" ? 1 : face.fallback + 1
    };
    ship.forges = (ship.forges ?? []).filter((entry) => entry.faceIndex !== action.faceIndex);
    ship.forges.push(forge);
    return;
  }
  if (action.type !== "size") throw new TypeError(`Unknown workshop action: ${action.type}`);
  const ship = ships.find((candidate) => candidate.id === action.id);
  if (!ship) throw new TypeError(`Unknown planned ship: ${action.id}`);
  ship.sides = nextSize(ship.sides);
}

function actionCost(ships, action, tracks = { reactor: 0 }) {
  if (action.type === "buy") return { ...BUY_COST };
  if (action.type === "replace") return { ...REPLACE_COST };
  if (action.type === "track") {
    if (action.track !== "reactor") throw new TypeError(`Unknown strategy track: ${action.track}`);
    return { credits: 2 + tracks.reactor, energy: 0 };
  }
  if (action.type === "forge") {
    const ship = ships.find((candidate) => candidate.id === action.id);
    if (!ship) throw new TypeError(`Unknown forge ship: ${action.id}`);
    const face = planFleet([ship])[0].faces[action.faceIndex];
    if (!face) throw new RangeError(`Unknown face ${action.faceIndex} on ${action.id}`);
    return { credits: face.symbol === "void" ? 3 : 2, energy: 0 };
  }
  const ship = ships.find((candidate) => candidate.id === action.id);
  if (!ship) throw new TypeError(`Unknown planned ship: ${action.id}`);
  const destination = nextSize(ship.sides);
  return { ...SIZE_COSTS[destination] };
}

function validatePlanCapacity(strategyName, ships) {
  const fleet = planFleet(ships);
  const command = fleet.reduce((total, ship) => total + ship.command, 0);
  if (fleet.length > 6) throw new RangeError(`${strategyName} exceeds six ship bays`);
  if (command > 12) throw new RangeError(`${strategyName} exceeds 12 Command`);
  return fleet;
}

export function buildStrategyFleet(strategyId, round) {
  const strategy = STRATEGY_DEFS[strategyId];
  if (!strategy) throw new TypeError(`Unknown prototype strategy: ${strategyId}`);
  if (!Number.isInteger(round) || round < 1 || round > 10) throw new TypeError("Round must be 1–10");

  const ships = clonePlanShips(strategy.base);
  for (const action of strategy.actions) {
    if (action.round > round) continue;
    if (action.type === "track") continue;
    applyPlanAction(ships, action);
  }
  return validatePlanCapacity(strategy.name, ships);
}

function drawFace(ship, random) {
  const index = Math.floor(random() * ship.faces.length);
  return { index, face: { ...ship.faces[index] } };
}

function priorityIndex(symbol, priority) {
  const index = priority.indexOf(symbol);
  return index < 0 ? Number.POSITIVE_INFINITY : index;
}

function weakestCombatKeyForTotals(totals, priority) {
  return priority.reduce((weakest, symbol) => (
    totals[symbol] < totals[weakest] ? symbol : weakest
  ), priority[0]);
}

function validateCombatPriority(priority, label) {
  if (!Array.isArray(priority) || priority.length === 0) {
    throw new TypeError(`${label} must be a non-empty array`);
  }
  for (const symbol of priority) {
    if (!COMBAT_KEYS.includes(symbol)) throw new TypeError(`${label} contains ${symbol}`);
  }
}

export function rollPrototypeFleet({
  ships,
  random,
  energy = 0,
  rerolls = 0,
  reserveEnergy = 0,
  wildPriority = DEFAULT_WILD_PRIORITY,
  rerollPriority = ["void"],
  spreadWilds = false
}) {
  if (!Array.isArray(ships) || ships.length === 0) throw new TypeError("A fleet requires ships");
  if (typeof random !== "function") throw new TypeError("A fleet roll requires a random function");
  if (!isNonNegativeInteger(energy)) throw new TypeError("Energy must be a non-negative integer");
  if (!isNonNegativeInteger(rerolls)) throw new TypeError("Rerolls must be a non-negative integer");
  if (!isNonNegativeInteger(reserveEnergy)) throw new TypeError("reserveEnergy must be non-negative");
  validateCombatPriority(wildPriority, "wildPriority");
  if (!Array.isArray(rerollPriority)) throw new TypeError("rerollPriority must be an array");

  const shipIds = new Set();
  const rolls = ships.map((ship) => {
    if (shipIds.has(ship.id)) throw new TypeError(`Duplicate ship id: ${ship.id}`);
    shipIds.add(ship.id);
    return { shipId: ship.id, rerolled: false, ...drawFace(ship, random) };
  });

  let energyRemaining = energy;
  let rerollsUsed = 0;
  const candidates = rolls
    .filter((roll) => rerollPriority.includes(roll.face.symbol))
    .sort((left, right) => (
      priorityIndex(left.face.symbol, rerollPriority) - priorityIndex(right.face.symbol, rerollPriority)
    ));

  for (const roll of candidates) {
    if (rerollsUsed >= rerolls || energyRemaining <= reserveEnergy) break;
    const ship = ships.find((candidate) => candidate.id === roll.shipId);
    const replacement = drawFace(ship, random);
    roll.index = replacement.index;
    roll.face = replacement.face;
    roll.rerolled = true;
    rerollsUsed += 1;
    energyRemaining -= 1;
  }

  const totals = { laser: 0, rocket: 0, shield: 0, speed: 0 };
  const counts = { laser: 0, rocket: 0, shield: 0, speed: 0, void: 0 };
  const gains = { energy: 0, credits: 0 };
  const spreadCounts = { laser: 0, rocket: 0, shield: 0, speed: 0 };
  for (const roll of rolls) {
    if (COMBAT_KEYS.includes(roll.face.symbol)) spreadCounts[roll.face.symbol] += 1;
  }
  const chooseWildSymbol = () => {
    if (!spreadWilds) return wildPriority[0];
    const choice = wildPriority.reduce((weakest, symbol) => (
      spreadCounts[symbol] < spreadCounts[weakest] ? symbol : weakest
    ), wildPriority[0]);
    spreadCounts[choice] += 1;
    return choice;
  };
  const resolved = rolls.map((roll) => {
    const symbol = roll.face.symbol === "wild" ? chooseWildSymbol() : roll.face.symbol;
    return {
      ...roll,
      resolvedSymbol: symbol,
      resolvedValue: roll.face.value,
      powered: roll.face.charge === 0
    };
  });

  const charged = resolved
    .filter((roll) => COMBAT_KEYS.includes(roll.resolvedSymbol) && roll.face.charge > 0)
    .sort((left, right) => {
      const leftEfficiency = (left.face.value - left.face.fallback) / left.face.charge;
      const rightEfficiency = (right.face.value - right.face.fallback) / right.face.charge;
      return rightEfficiency - leftEfficiency;
    });

  for (const roll of charged) {
    if (energyRemaining - roll.face.charge >= reserveEnergy) {
      energyRemaining -= roll.face.charge;
      roll.powered = true;
    } else {
      roll.resolvedValue = roll.face.fallback;
      roll.powered = false;
    }
  }

  for (const roll of resolved) {
    if (COMBAT_KEYS.includes(roll.resolvedSymbol)) {
      totals[roll.resolvedSymbol] += roll.resolvedValue;
      counts[roll.resolvedSymbol] += 1;
    } else if (roll.resolvedSymbol === "energy") {
      gains.energy += roll.resolvedValue;
    } else if (roll.resolvedSymbol === "credits") {
      gains.credits += roll.resolvedValue;
    } else if (roll.resolvedSymbol === "void") {
      counts.void += 1;
    }
  }

  const systems = ships
    .filter((ship) => ship.installedSystem.value > 0)
    .map((ship) => ({
      shipId: ship.id,
      signature: ship.signature,
      symbol: ship.signature === "wild" ? null : ship.signature,
      value: ship.installedSystem.value,
      charge: ship.installedSystem.charge,
      powered: false
    }))
    .sort((left, right) => (
      right.value / right.charge - left.value / left.charge
    ));

  for (const system of systems) {
    if (system.signature === "wild") {
      system.symbol = spreadWilds
        ? weakestCombatKeyForTotals(totals, wildPriority)
        : wildPriority[0];
    }
    if (energyRemaining - system.charge < reserveEnergy) continue;
    energyRemaining -= system.charge;
    system.powered = true;
    totals[system.symbol] += system.value;
  }

  return {
    totals,
    counts,
    rolls: resolved,
    systems,
    activeDice: ships.length,
    rerollsUsed,
    energySpent: energy - energyRemaining,
    energyRemaining,
    gains
  };
}

function lockedPacket({ result, playerId, teamId, round, matchId }) {
  return {
    version: 1,
    matchId,
    round,
    playerId,
    teamId,
    locked: true,
    activeDice: result.activeDice,
    totals: result.totals,
    counts: result.counts
  };
}

function objectiveScore(threat, teamResult) {
  const objective = threat.objective ?? "damage";
  if (COMBAT_KEYS.includes(objective)) return Math.min(3, teamResult.remaining[objective]);
  if (objective === "combined") {
    return COMBAT_KEYS.filter((key) => teamResult.remaining[key] > 0).length;
  }
  if (objective === "survive") return Math.max(0, 3 - teamResult.stressToAssign);
  return Math.min(4, teamResult.hits);
}

export function scoreSoloVolley(threat, playerResult, enemyResult = null) {
  const hitScore = playerResult.hits * 2;
  const tacticalScore = playerResult.tacticalEdge * 2;
  const enemyOffense = enemyResult
    ? enemyResult.totals.laser + enemyResult.totals.rocket
    : playerResult.incomingHits;
  const defenseScore = Math.min(4, Math.max(0, enemyOffense - playerResult.incomingHits));
  const integrityBonus = playerResult.stressToAssign === 0 ? 1 : 0;
  const missionScore = objectiveScore(threat, playerResult);
  const tacticScore = playerResult.effects.objectivePoints;
  return {
    hitScore,
    tacticalScore,
    defenseScore,
    integrityBonus,
    missionScore,
    tacticScore,
    total: hitScore + tacticalScore + defenseScore + integrityBonus + missionScore + tacticScore
  };
}

function repairCriticalStress(fleet, stressById, energy, reserveEnergy) {
  let energyRemaining = energy;
  let repaired = 0;
  const shipsByRisk = [...fleet].sort((left, right) => (
    (stressById.get(right.id) ?? 0) / right.structure
    - (stressById.get(left.id) ?? 0) / left.structure
  ));

  for (const ship of shipsByRisk) {
    let stress = stressById.get(ship.id) ?? 0;
    while (stress >= ship.structure && energyRemaining > reserveEnergy) {
      const removed = Math.min(2, stress);
      stress -= removed;
      repaired += removed;
      energyRemaining -= 1;
    }
    stressById.set(ship.id, stress);
  }

  return { energyRemaining, repaired };
}

function damageOrderFor(fleet, mode) {
  const direction = mode === "large-first" ? -1 : 1;
  return [...fleet]
    .sort((left, right) => direction * (left.structure - right.structure))
    .map((ship) => ship.id);
}

function attemptPlannedWorkshop({ strategy, planShips, tracks, actionIndex, round, credits, energy }) {
  const action = strategy.actions[actionIndex];
  if (!action || action.round > round) {
    return {
      actionIndex,
      credits,
      energy,
      tracks,
      workshop: { status: "none", action: null, cost: null }
    };
  }

  const cost = actionCost(planShips, action, tracks);
  const canAfford = credits >= cost.credits
    && energy >= cost.energy;
  if (!canAfford) {
    return {
      actionIndex,
      credits,
      energy,
      tracks,
      workshop: { status: "waiting", action: { ...action }, cost }
    };
  }

  const candidateShips = clonePlanShips(planShips);
  const candidateTracks = { ...tracks };
  if (action.type === "track") {
    if (candidateTracks.reactor >= 5) throw new RangeError("Reactor track is already complete");
    candidateTracks.reactor += 1;
  } else {
    applyPlanAction(candidateShips, action);
  }
  validatePlanCapacity(strategy.name, candidateShips);
  planShips.splice(0, planShips.length, ...candidateShips);
  return {
    actionIndex: actionIndex + 1,
    credits: credits - cost.credits,
    energy: energy - cost.energy,
    tracks: candidateTracks,
    workshop: { status: "completed", action: { ...action }, cost }
  };
}

export function runSoloPrototype(strategyId, seed = 1) {
  const strategy = STRATEGY_DEFS[strategyId];
  if (!strategy) throw new TypeError(`Unknown prototype strategy: ${strategyId}`);
  const random = createSeededRandom(seed);
  const stressById = new Map();
  const history = [];
  const planShips = clonePlanShips(strategy.base);
  let tracks = { reactor: 0 };
  let actionIndex = 0;
  let energy = 2;
  let credits = 4;
  let score = 0;
  let disabledRounds = 0;
  let distress = 0;

  for (const threat of SOLO_THREAT_SCHEDULE) {
    const workshopResult = attemptPlannedWorkshop({
      strategy,
      planShips,
      tracks,
      actionIndex,
      round: threat.round,
      credits,
      energy
    });
    actionIndex = workshopResult.actionIndex;
    credits = workshopResult.credits;
    energy = workshopResult.energy;
    tracks = workshopResult.tracks;
    const fleet = validatePlanCapacity(strategy.name, planShips);
    for (const ship of fleet) {
      if (!stressById.has(ship.id)) stressById.set(ship.id, 0);
    }

    const repair = repairCriticalStress(fleet, stressById, energy, strategy.reserveEnergy);
    energy = repair.energyRemaining;
    const disabledIds = new Set();
    for (const ship of fleet) {
      if ((stressById.get(ship.id) ?? 0) >= ship.structure) {
        disabledIds.add(ship.id);
        stressById.set(ship.id, 0);
      }
    }
    disabledRounds += disabledIds.size;

    let activeFleet = fleet.filter((ship) => !disabledIds.has(ship.id));
    if (activeFleet.length === 0) {
      distress += 1;
      const fallback = fleet[0];
      activeFleet = [fallback];
      stressById.set(fallback.id, 0);
    }

    const extraShips = Math.max(0, activeFleet.length - 4);
    const affordableUpkeep = Math.max(0, energy - strategy.reserveEnergy);
    const commandUpkeep = Math.min(extraShips, affordableUpkeep);
    const deployedCount = Math.min(activeFleet.length, 4 + commandUpkeep);
    const reserveShips = activeFleet.slice(deployedCount).map((ship) => ship.id);
    activeFleet = activeFleet.slice(0, deployedCount);
    energy -= commandUpkeep;

    const playerRoll = rollPrototypeFleet({
      ships: activeFleet,
      random,
      energy,
      rerolls: strategy.rerolls + (tracks.reactor >= 2 ? 1 : 0) + (tracks.reactor >= 4 ? 1 : 0),
      reserveEnergy: strategy.reserveEnergy,
      wildPriority: strategy.wildPriority,
      rerollPriority: strategy.rerollPriority,
      spreadWilds: strategy.spreadWilds === true
    });
    energy = playerRoll.energyRemaining;

    const enemyRoll = rollPrototypeFleet({
      ships: createThreatFleet(threat),
      random,
      energy: threat.energy,
      rerolls: 0,
      wildPriority: threat.wildPriority,
      rerollPriority: []
    });

    const matchId = `solo-${seed}`;
    const battle = resolveLockedBattle([
      lockedPacket({
        result: playerRoll,
        playerId: "pilot",
        teamId: "player",
        round: threat.round,
        matchId
      }),
      lockedPacket({
        result: enemyRoll,
        playerId: `enemy-${threat.round}`,
        teamId: "enemy",
        round: threat.round,
        matchId
      })
    ]);
    const playerBattle = battle.teams.player;
    const enemyBattle = battle.teams.enemy;
    const scoring = scoreSoloVolley(threat, playerBattle, enemyBattle);
    const apogeeBonus = threat.round === 10 ? playerBattle.hits : 0;
    const battleRoundScore = Math.max(
      0,
      scoring.total + apogeeBonus - (activeFleet.length === 1 && distress > 0 ? 2 : 0)
    );

    const stressShips = activeFleet.map((ship) => ({
      id: ship.id,
      structure: ship.structure,
      stress: Math.min(stressById.get(ship.id) ?? 0, ship.structure)
    }));
    const stressResult = assignStress(
      stressShips,
      playerBattle.stressToAssign,
      damageOrderFor(activeFleet, strategy.damage)
    );
    for (const ship of stressResult.ships) stressById.set(ship.id, ship.stress);
    if (stressResult.unassignedStress > 0) distress += 1;

    energy = Math.min(12, energy + playerRoll.gains.energy + 1 + tracks.reactor);
    credits += playerRoll.gains.credits
      + playerBattle.effects.credits
      + (threat.round < 10 ? 1 : 0);
    const apogeeEnergyBonus = threat.round === 10 ? energy : 0;
    const roundScore = battleRoundScore + apogeeEnergyBonus;
    score += roundScore;
    history.push({
      round: threat.round,
      threatId: threat.id,
      command: fleet.reduce((total, ship) => total + ship.command, 0),
      fleet: fleet.map((ship) => ({ id: ship.id, family: ship.family, sides: ship.sides })),
      activeDice: activeFleet.length,
      disabledShips: [...disabledIds],
      reserveShips,
      commandUpkeep,
      workshop: workshopResult.workshop,
      tracks: { ...tracks },
      playerRoll,
      enemyRoll,
      playerBattle,
      enemyBattle,
      scoring,
      apogeeBonus,
      apogeeEnergyBonus,
      roundScore,
      energy,
      credits,
      repairedStress: repair.repaired,
      unassignedStress: stressResult.unassignedStress
    });
  }

  return {
    strategyId,
    strategyName: strategy.name,
    seed,
    score,
    energy,
    credits,
    disabledRounds,
    distress,
    actionsCompleted: actionIndex,
    tracks,
    history
  };
}
