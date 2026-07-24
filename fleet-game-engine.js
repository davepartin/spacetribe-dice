import {
  BATTLE_PACKET_VERSION,
  COMBAT_KEYS,
  assignStress,
  deriveFleetTactics,
  resolveLockedBattle
} from "./battle-engine.js";
import {
  BATTLE_SHIP_SIZES,
  BATTLE_SYMBOLS,
  COMMAND_BY_SIZE,
  SOLO_THREAT_SCHEDULE,
  createPrototypeShip,
  createThreatFleet
} from "./battle-content.js";
import { rollPrototypeFleet, scoreSoloVolley } from "./solo-battle-engine.js";

export const GAME_VERSION = 2;
export const MAX_ROUNDS = 10;
export const MAX_COMMAND = 12;
export const MAX_SHIPS = 6;

export const SYMBOLS = Object.freeze({
  laser: { label: "Laser", short: "LAS", color: "#ff5f68" },
  rocket: { label: "Rocket", short: "RKT", color: "#ffad5c" },
  shield: { label: "Shield", short: "SHD", color: "#63d8ff" },
  speed: { label: "Speed", short: "SPD", color: "#73e0b2" },
  energy: { label: "Energy", short: "NRG", color: "#d895ff" },
  credits: { label: "Credits", short: "CR", color: "#d8f26b" },
  wild: { label: "Wild", short: "ANY", color: "#fff1a6" },
  void: { label: "Void", short: "—", color: "#75839d" }
});

export const ORDERS = Object.freeze({
  intercept: {
    name: "Intercept",
    symbol: "laser",
    detail: "Track fast ships and suppress Speed."
  },
  bombard: {
    name: "Bombard",
    symbol: "rocket",
    detail: "Break shield formations with heavy fire."
  },
  screen: {
    name: "Screen",
    symbol: "shield",
    detail: "Absorb Lasers and preserve fleet integrity."
  },
  maneuver: {
    name: "Maneuver",
    symbol: "speed",
    detail: "Evade Rockets and control the engagement."
  }
});

export const TRACKS = Object.freeze({
  gunnery: {
    name: "Gunnery",
    color: "laser",
    description: "Reliable Laser/Rocket output when you choose an offensive order."
  },
  operations: {
    name: "Operations",
    color: "speed",
    description: "Reliable Shield/Speed output when you choose a defensive order."
  },
  reactor: {
    name: "Reactor",
    color: "energy",
    description: "+1 Energy each round. Extra rerolls at levels 2 and 4."
  },
  foundry: {
    name: "Foundry",
    color: "credits",
    description: "Discount Forge and high-tier Size Up actions."
  }
});

export const MARKET = Object.freeze([
  { family: "interceptor", title: "Interceptor", detail: "Laser and Speed specialist", color: "#57d7b7" },
  { family: "siege", title: "Siege Ship", detail: "Rocket and Energy specialist", color: "#f25955" },
  { family: "bulwark", title: "Bulwark", detail: "Shield and Rocket specialist", color: "#43bde4" },
  { family: "engineer", title: "Engineering Ship", detail: "Credits, Energy, and flexible systems", color: "#a86be8" }
]);

const SIZE_COSTS = Object.freeze({
  6: { credits: 2, energy: 1 },
  8: { credits: 3, energy: 1 },
  10: { credits: 4, energy: 1 },
  12: { credits: 5, energy: 1 },
  20: { credits: 6, energy: 2 }
});

function makeId(prefix = "ship") {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

function initialSeed() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint32Array(1))[0] || 1;
  }
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0 || 1;
}

function nextRandom(state) {
  state.rng = (state.rng + 0x6d2b79f5) >>> 0;
  let value = state.rng;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function withRunState(ship, options = {}) {
  return {
    ...ship,
    stress: options.stress ?? 0,
    deployed: options.deployed ?? true,
    disabledRound: options.disabledRound ?? 0
  };
}

function startingShips() {
  return [
    withRunState(createPrototypeShip("core", 6, "core-1")),
    withRunState(createPrototypeShip("engineer", 4, "engineer-1")),
    withRunState(createPrototypeShip("interceptor", 4, "interceptor-1"))
  ];
}

function safeName(playerName) {
  return String(playerName).trim().slice(0, 18) || "Pilot";
}

export function currentThreat(state) {
  return SOLO_THREAT_SCHEDULE[state.round - 1];
}

export function createInitialState(playerName = "Pilot", seed = initialSeed()) {
  const normalizedSeed = seed >>> 0 || 1;
  return {
    version: GAME_VERSION,
    scoreVersion: GAME_VERSION,
    runId: makeId("run"),
    playerName: safeName(playerName),
    createdAt: new Date().toISOString(),
    seed: normalizedSeed,
    rng: normalizedSeed,
    round: 1,
    phase: "workshop",
    score: 0,
    resources: { energy: 2, credits: 4 },
    tracks: { gunnery: 0, operations: 0, reactor: 0, foundry: 0 },
    ships: startingShips(),
    order: "intercept",
    protectedShipId: "core-1",
    workshopActionTaken: true,
    selected: [],
    rolls: {},
    powerSelections: [],
    rerollsUsed: 0,
    freeRerolls: 0,
    overclockUsed: false,
    lastRound: null,
    roundHistory: [],
    messages: [{ type: "laser", text: "Round 1 launch fleet is already commissioned." }],
    actions: [{ action: "start", round: 1, rng: normalizedSeed }],
    distress: 0
  };
}

export function shipLabel(sides) {
  return `Ship-${sides}`;
}

export function commandUsed(state) {
  return state.ships.reduce((total, ship) => total + ship.command, 0);
}

export function rerollsAvailable(state) {
  return 1 + (state.tracks.reactor >= 2 ? 1 : 0) + (state.tracks.reactor >= 4 ? 1 : 0);
}

export function shapingActionsLeft(state) {
  return Math.max(0, rerollsAvailable(state) - state.rerollsUsed) + (state.freeRerolls || 0);
}

function canPay(state, cost) {
  return Object.entries(cost).every(([key, value]) => state.resources[key] >= value);
}

function pay(state, cost) {
  for (const [key, value] of Object.entries(cost)) state.resources[key] -= value;
}

function workshopGuard(state) {
  if (state.phase !== "workshop") return "This action is only available in the workshop.";
  if (state.workshopActionTaken) return "Your major workshop action is already spent this round.";
  return null;
}

export function trackCost(state, track) {
  if (!(track in TRACKS)) return null;
  return { credits: 2 + state.tracks[track] };
}

export function buyTrack(state, track) {
  const blocked = workshopGuard(state);
  if (blocked) return { ok: false, message: blocked };
  if (!(track in TRACKS)) return { ok: false, message: "Unknown strategy track." };
  if (state.tracks[track] >= 5) return { ok: false, message: "That track is already mastered." };
  const cost = trackCost(state, track);
  if (!canPay(state, cost)) return { ok: false, message: "Not enough Credits." };
  pay(state, cost);
  state.tracks[track] += 1;
  state.workshopActionTaken = true;
  state.actions.push({ action: "track", track, level: state.tracks[track], round: state.round });
  return { ok: true, message: `${TRACKS[track].name} advanced to level ${state.tracks[track]}.` };
}

export function buyShip(state, family) {
  const blocked = workshopGuard(state);
  if (blocked) return { ok: false, message: blocked };
  if (!MARKET.some((item) => item.family === family)) return { ok: false, message: "Unknown ship family." };
  if (state.ships.length >= MAX_SHIPS) return { ok: false, message: "All six ship bays are occupied." };
  const cost = { credits: 4 };
  if (!canPay(state, cost)) return { ok: false, message: "A new Ship-4 costs 4 Credits." };
  if (commandUsed(state) + COMMAND_BY_SIZE[4] > MAX_COMMAND) {
    return { ok: false, message: "The fleet does not have 2 Command available." };
  }
  pay(state, cost);
  const ship = withRunState(createPrototypeShip(family, 4, makeId(family)), { deployed: state.ships.length < 4 });
  state.ships.push(ship);
  state.workshopActionTaken = true;
  state.actions.push({ action: "buy-ship", family, shipId: ship.id, round: state.round });
  return { ok: true, message: `${ship.name} joined the fleet.` };
}

function nextShipSize(sides) {
  const index = BATTLE_SHIP_SIZES.indexOf(sides);
  return index >= 0 ? BATTLE_SHIP_SIZES[index + 1] : undefined;
}

export function upsizeCost(state, ship) {
  const next = nextShipSize(ship.sides);
  if (!next) return null;
  const discount = state.tracks.foundry >= 3 ? 1 : 0;
  return {
    credits: Math.max(1, SIZE_COSTS[next].credits - discount),
    energy: SIZE_COSTS[next].energy
  };
}

export function upsizeShip(state, shipId) {
  const blocked = workshopGuard(state);
  if (blocked) return { ok: false, message: blocked };
  const ship = state.ships.find((item) => item.id === shipId);
  if (!ship) return { ok: false, message: "Ship not found." };
  const next = nextShipSize(ship.sides);
  const cost = upsizeCost(state, ship);
  if (!next || !cost) return { ok: false, message: "That ship has reached Ship-20." };
  const commandIncrease = COMMAND_BY_SIZE[next] - ship.command;
  if (commandUsed(state) + commandIncrease > MAX_COMMAND) {
    return { ok: false, message: `Size Up needs ${commandIncrease} more Command.` };
  }
  if (!canPay(state, cost)) return { ok: false, message: `Size Up costs ${costLabel(cost)}.` };
  pay(state, cost);
  const expanded = createPrototypeShip(ship.family, next, ship.id);
  const forgeReinforcement = ship.forgeReinforcement || 0;
  const forgeSystem = ship.forgeSystem ? { ...ship.forgeSystem } : null;
  expanded.structure += forgeReinforcement;
  for (let index = 0; index < ship.faces.length; index += 1) expanded.faces[index] = { ...ship.faces[index] };
  Object.assign(ship, expanded, {
    stress: ship.stress,
    deployed: ship.deployed,
    disabledRound: ship.disabledRound,
    forgeReinforcement,
    forgeSystem
  });
  state.workshopActionTaken = true;
  state.actions.push({ action: "size-up", shipId, sides: next, round: state.round });
  return { ok: true, message: `${ship.name} expanded to ${shipLabel(next)}.` };
}

export function forgeCost(state, ship, faceIndex) {
  const face = ship?.faces?.[faceIndex];
  if (!face) return null;
  const base = face.symbol === "void" ? 3 : 2;
  return { credits: Math.max(1, base - Math.floor(state.tracks.foundry / 2)) };
}

export function forgeFace(state, shipId, faceIndex, symbol) {
  const blocked = workshopGuard(state);
  if (blocked) return { ok: false, message: blocked };
  if (!BATTLE_SYMBOLS.includes(symbol) || ["wild", "void"].includes(symbol)) {
    return { ok: false, message: "Choose a valid system symbol." };
  }
  const ship = state.ships.find((item) => item.id === shipId);
  const face = ship?.faces?.[faceIndex];
  if (!ship || !face) return { ok: false, message: "Face not found." };
  if (face.forged) return { ok: false, message: "That face has already been Forged." };
  const cost = forgeCost(state, ship, faceIndex);
  if (!canPay(state, cost)) return { ok: false, message: `Forge costs ${costLabel(cost)}.` };
  pay(state, cost);
  const firstForgeOnShip = !ship.faces.some((candidate) => candidate.forged);
  const forgedValue = face.symbol === "void" ? 1 : face.value + 1;
  const forgedFallback = face.symbol === "void" ? 1 : face.fallback + 1;
  ship.faces[faceIndex] = {
    ...face,
    symbol,
    value: forgedValue,
    charge: face.symbol === "void" ? 0 : face.charge,
    fallback: forgedFallback,
    forged: true
  };
  if (firstForgeOnShip) {
    ship.forgeReinforcement = 1;
    ship.forgeSystem = { symbol, value: 1, charge: 1 };
    ship.structure += 1;
  }
  state.workshopActionTaken = true;
  state.actions.push({ action: "forge-face", shipId, faceIndex, symbol, round: state.round });
  return { ok: true, message: `${SYMBOLS[symbol].label} Forged onto ${ship.name}.` };
}

export function tradeShip(state, shipId, family) {
  const blocked = workshopGuard(state);
  if (blocked) return { ok: false, message: blocked };
  const index = state.ships.findIndex((ship) => ship.id === shipId);
  const oldShip = state.ships[index];
  if (!oldShip || oldShip.family === "core") return { ok: false, message: "The Core Ship cannot be traded." };
  if (oldShip.sides !== 4) return { ok: false, message: "Only an unexpanded Ship-4 can be traded." };
  if (!MARKET.some((item) => item.family === family) || family === oldShip.family) {
    return { ok: false, message: "Choose a different ship family." };
  }
  const cost = { credits: 2 };
  if (!canPay(state, cost)) return { ok: false, message: "A hull trade costs 2 Credits." };
  pay(state, cost);
  state.ships[index] = withRunState(createPrototypeShip(family, 4, oldShip.id), {
    deployed: oldShip.deployed
  });
  state.workshopActionTaken = true;
  state.actions.push({ action: "trade-ship", shipId, from: oldShip.family, family, round: state.round });
  return { ok: true, message: `${oldShip.name} traded for ${state.ships[index].name}.` };
}

export function repairShip(state, shipId) {
  if (state.phase !== "workshop") return { ok: false, message: "Repairs happen in the workshop." };
  const ship = state.ships.find((item) => item.id === shipId);
  if (!ship || ship.stress <= 0) return { ok: false, message: "That ship does not need repairs." };
  if (state.resources.energy < 1) return { ok: false, message: "Repairs cost 1 Energy." };
  state.resources.energy -= 1;
  const removed = Math.min(2, ship.stress);
  ship.stress -= removed;
  state.actions.push({ action: "repair", shipId, removed, round: state.round });
  return { ok: true, message: `${ship.name} repaired ${removed} Stress.` };
}

export function setOrder(state, order) {
  if (state.phase !== "workshop" || !(order in ORDERS)) return { ok: false, message: "Choose orders in the workshop." };
  state.order = order;
  return { ok: true };
}

export function setProtectedShip(state, shipId) {
  if (state.phase !== "workshop" || !state.ships.some((ship) => ship.id === shipId)) {
    return { ok: false, message: "Choose a ship to protect in the workshop." };
  }
  state.protectedShipId = shipId;
  return { ok: true };
}

export function toggleDeployment(state, shipId) {
  if (state.phase !== "workshop") return { ok: false, message: "Deployment is set in the workshop." };
  const ship = state.ships.find((item) => item.id === shipId);
  if (!ship) return { ok: false, message: "Ship not found." };
  ship.deployed = !ship.deployed;
  if (!state.ships.some((item) => item.deployed)) {
    ship.deployed = true;
    return { ok: false, message: "At least one ship must deploy." };
  }
  return { ok: true, message: `${ship.name} moved ${ship.deployed ? "to active formation" : "into reserve"}.` };
}

function orderSymbol(state) {
  return ORDERS[state.order]?.symbol || "laser";
}

function drawFace(state, ship) {
  const index = Math.floor(nextRandom(state) * ship.faces.length);
  const face = ship.faces[index];
  return {
    index,
    symbol: face.symbol,
    value: face.value,
    charge: face.charge,
    fallback: face.fallback,
    forged: face.forged === true,
    wildChoice: face.symbol === "wild" ? orderSymbol(state) : null
  };
}

function activeShips(state) {
  return state.ships.filter((ship) => ship.deployed && ship.disabledRound !== state.round);
}

export function deploymentPreview(state) {
  const disabled = state.ships.filter((ship) => ship.deployed && ship.stress >= ship.structure);
  const active = state.ships.filter((ship) => ship.deployed && ship.stress < ship.structure);
  const upkeep = Math.max(0, active.length - 4);
  return { active, disabled, upkeep, canLaunch: active.length > 0 && state.resources.energy >= upkeep };
}

function powerCandidates(state) {
  const candidates = [];
  for (const ship of activeShips(state)) {
    const roll = state.rolls[ship.id];
    if (roll?.charge > 0) {
      candidates.push({
        key: `face:${ship.id}`,
        shipId: ship.id,
        kind: "face",
        charge: roll.charge,
        value: roll.value - roll.fallback
      });
    }
    if (ship.installedSystem.value > 0) {
      candidates.push({
        key: `system:${ship.id}`,
        shipId: ship.id,
        kind: "system",
        charge: ship.installedSystem.charge,
        value: ship.installedSystem.value
      });
    }
    if (ship.forgeSystem?.value > 0) {
      candidates.push({
        key: `forge:${ship.id}`,
        shipId: ship.id,
        kind: "forge",
        charge: ship.forgeSystem.charge,
        value: ship.forgeSystem.value
      });
    }
  }
  return candidates;
}

export function selectedPowerCost(state) {
  const selected = new Set(state.powerSelections || []);
  return powerCandidates(state)
    .filter((candidate) => selected.has(candidate.key))
    .reduce((total, candidate) => total + candidate.charge, 0);
}

function autoSelectPower(state) {
  const sorted = powerCandidates(state).sort((left, right) => (
    right.value / right.charge - left.value / left.charge
  ));
  const selected = [];
  let energy = state.resources.energy;
  for (const candidate of sorted) {
    if (candidate.charge > energy) continue;
    selected.push(candidate.key);
    energy -= candidate.charge;
  }
  state.powerSelections = selected;
}

export function launchOrders(state) {
  if (state.phase !== "workshop") return { ok: false, message: "The fleet is not in the workshop." };
  const deployment = deploymentPreview(state);
  if (!deployment.active.length) return { ok: false, message: "At least one operational ship must deploy." };
  if (!deployment.canLaunch) return { ok: false, message: `Deploying this formation costs ${deployment.upkeep} Energy.` };
  for (const ship of deployment.disabled) {
    ship.disabledRound = state.round;
    ship.stress = 0;
  }
  state.resources.energy -= deployment.upkeep;
  state.phase = "rolling";
  state.rolls = {};
  state.selected = [];
  state.powerSelections = [];
  state.rerollsUsed = 0;
  for (const ship of activeShips(state)) state.rolls[ship.id] = drawFace(state, ship);
  autoSelectPower(state);
  state.messages = [
    { type: orderSymbol(state), text: `${ORDERS[state.order].name} orders locked for shaping.` },
    ...(deployment.upkeep ? [{ type: "energy", text: `Fleet coordination spent ${deployment.upkeep} Energy.` }] : [])
  ];
  state.actions.push({ action: "launch-orders", round: state.round, order: state.order, rng: state.rng });
  return { ok: true };
}

export function toggleSelection(state, shipId) {
  if (state.phase !== "rolling" || !state.rolls[shipId]) return state;
  state.selected = state.selected.includes(shipId)
    ? state.selected.filter((id) => id !== shipId)
    : [...state.selected, shipId];
  return state;
}

export function cycleWild(state, shipId) {
  const roll = state.rolls[shipId];
  if (state.phase !== "rolling" || roll?.symbol !== "wild") return state;
  const index = COMBAT_KEYS.indexOf(roll.wildChoice);
  roll.wildChoice = COMBAT_KEYS[(index + 1) % COMBAT_KEYS.length];
  state.selected = state.selected.filter((id) => id !== shipId);
  autoSelectPower(state);
  return state;
}

export function rerollSelected(state) {
  if (state.phase !== "rolling") return { ok: false, message: "Orders are not being shaped." };
  const ids = [...state.selected];
  if (!ids.length) return { ok: false, message: "Select at least one ship." };
  const useFree = state.freeRerolls > 0;
  if (!useFree && state.rerollsUsed >= rerollsAvailable(state)) return { ok: false, message: "No rerolls remain." };
  if (!useFree && state.resources.energy < ids.length) return { ok: false, message: `Rerolling costs ${ids.length} Energy.` };
  if (useFree) state.freeRerolls -= 1;
  else {
    state.resources.energy -= ids.length;
    state.rerollsUsed += 1;
  }
  for (const id of ids) {
    const ship = state.ships.find((item) => item.id === id);
    if (ship) state.rolls[id] = drawFace(state, ship);
  }
  state.selected = [];
  autoSelectPower(state);
  state.messages = [{ type: "energy", text: `${ids.length} ${ids.length === 1 ? "ship" : "ships"} rerolled${useFree ? " for free" : ""}.` }];
  state.actions.push({ action: "reroll", round: state.round, ids, free: useFree, rng: state.rng });
  return { ok: true, free: useFree };
}

export function overclock(state) {
  if (state.phase !== "rolling") return { ok: false, message: "Orders are not being shaped." };
  if (state.overclockUsed) return { ok: false, message: "Reroll All was already used this run." };
  for (const ship of activeShips(state)) state.rolls[ship.id] = drawFace(state, ship);
  state.overclockUsed = true;
  state.selected = [];
  autoSelectPower(state);
  state.messages = [{ type: "energy", text: "Reroll All refreshed the formation." }];
  return { ok: true };
}

export function togglePower(state, key) {
  if (state.phase !== "rolling") return { ok: false, message: "Power is assigned during shaping." };
  const candidate = powerCandidates(state).find((item) => item.key === key);
  if (!candidate) return { ok: false, message: "That system cannot be powered." };
  const selected = new Set(state.powerSelections);
  if (selected.has(key)) selected.delete(key);
  else {
    const otherCost = powerCandidates(state)
      .filter((item) => selected.has(item.key))
      .reduce((total, item) => total + item.charge, 0);
    if (otherCost + candidate.charge > state.resources.energy) return { ok: false, message: "Not enough Energy for that system." };
    selected.add(key);
  }
  state.powerSelections = [...selected];
  return { ok: true };
}

function trackOutput(state, totals) {
  const symbol = orderSymbol(state);
  if (["laser", "rocket"].includes(symbol)) totals[symbol] += Math.ceil(state.tracks.gunnery / 2);
  if (["shield", "speed"].includes(symbol)) totals[symbol] += Math.ceil(state.tracks.operations / 2);
}

export function previewOrders(state) {
  const rawTotals = { laser: 0, rocket: 0, shield: 0, speed: 0 };
  const counts = { laser: 0, rocket: 0, shield: 0, speed: 0, void: 0 };
  const gains = { energy: 0, credits: 0 };
  const selected = new Set(state.powerSelections || []);
  const resolvedRolls = [];
  const systems = [];

  for (const ship of activeShips(state)) {
    const roll = state.rolls[ship.id];
    if (!roll) continue;
    const symbol = roll.symbol === "wild" ? roll.wildChoice : roll.symbol;
    const powered = roll.charge === 0 || selected.has(`face:${ship.id}`);
    const value = powered ? roll.value : roll.fallback;
    resolvedRolls.push({ shipId: ship.id, symbol, value, powered, roll });
    if (COMBAT_KEYS.includes(symbol)) {
      rawTotals[symbol] += value;
      counts[symbol] += 1;
    } else if (symbol === "energy" || symbol === "credits") gains[symbol] += value;
    else if (symbol === "void") counts.void += 1;

    if (ship.installedSystem.value > 0) {
      const systemPowered = selected.has(`system:${ship.id}`);
      const systemSymbol = ship.signature === "wild" ? orderSymbol(state) : ship.signature;
      systems.push({ shipId: ship.id, symbol: systemSymbol, value: ship.installedSystem.value, powered: systemPowered });
      if (systemPowered) rawTotals[systemSymbol] += ship.installedSystem.value;
    }
    if (ship.forgeSystem?.value > 0) {
      const forgePowered = selected.has(`forge:${ship.id}`);
      systems.push({
        shipId: ship.id,
        kind: "forge",
        symbol: ship.forgeSystem.symbol,
        value: ship.forgeSystem.value,
        powered: forgePowered
      });
      if (forgePowered) rawTotals[ship.forgeSystem.symbol] += ship.forgeSystem.value;
    }
  }

  trackOutput(state, rawTotals);
  const prepared = deriveFleetTactics({
    version: BATTLE_PACKET_VERSION,
    matchId: state.runId,
    round: state.round,
    playerId: "pilot",
    teamId: "player",
    locked: true,
    activeDice: activeShips(state).length,
    totals: rawTotals,
    counts
  });
  gains.credits += prepared.effects.credits;
  return {
    rawTotals,
    totals: prepared.totals,
    counts,
    gains,
    tactics: prepared.tactics,
    effects: prepared.effects,
    resolvedRolls,
    systems,
    powerCost: selectedPowerCost(state)
  };
}

function lockedPacket(state, preview, playerId, teamId) {
  return {
    version: BATTLE_PACKET_VERSION,
    matchId: state.runId,
    round: state.round,
    playerId,
    teamId,
    locked: true,
    activeDice: playerId === "pilot" ? activeShips(state).length : preview.activeDice,
    totals: preview.rawTotals || preview.totals,
    counts: preview.counts
  };
}

function damageOrder(state, ships) {
  return [...ships]
    .sort((left, right) => {
      if (left.id === state.protectedShipId) return 1;
      if (right.id === state.protectedShipId) return -1;
      return left.structure - right.structure;
    })
    .map((ship) => ship.id);
}

export function lockOrders(state) {
  if (state.phase !== "rolling") return { ok: false, message: "There are no orders to lock." };
  const playerPreview = previewOrders(state);
  if (playerPreview.powerCost > state.resources.energy) return { ok: false, message: "The power plan exceeds available Energy." };
  state.resources.energy -= playerPreview.powerCost;

  const threat = currentThreat(state);
  const enemyRoll = rollPrototypeFleet({
    ships: createThreatFleet(threat),
    random: () => nextRandom(state),
    energy: threat.energy,
    rerolls: 0,
    wildPriority: threat.wildPriority,
    rerollPriority: []
  });
  const battle = resolveLockedBattle([
    lockedPacket(state, playerPreview, "pilot", "player"),
    lockedPacket(state, enemyRoll, `enemy-${state.round}`, "enemy")
  ]);
  const playerBattle = battle.teams.player;
  const enemyBattle = battle.teams.enemy;
  const scoring = scoreSoloVolley(threat, playerBattle, enemyBattle);

  const deployed = activeShips(state);
  const stressResult = assignStress(
    deployed.map((ship) => ({ id: ship.id, structure: ship.structure, stress: ship.stress })),
    playerBattle.stressToAssign,
    damageOrder(state, deployed)
  );
  for (const result of stressResult.ships) {
    const ship = state.ships.find((item) => item.id === result.id);
    if (ship) ship.stress = result.stress;
  }
  if (stressResult.unassignedStress > 0) state.distress += 1;

  state.resources.energy = Math.min(12, state.resources.energy + playerPreview.gains.energy);
  state.resources.credits += playerPreview.gains.credits + (state.round < MAX_ROUNDS ? 1 : 0);
  const apogeeHitBonus = state.round === MAX_ROUNDS ? playerBattle.hits : 0;
  const apogeeEnergyBonus = state.round === MAX_ROUNDS ? state.resources.energy : 0;
  const distressPenalty = stressResult.unassignedStress > 0 ? 2 : 0;
  const scored = Math.max(0, scoring.total + apogeeHitBonus + apogeeEnergyBonus - distressPenalty);
  state.score += scored;
  state.freeRerolls = playerBattle.effects.nextRoundFreeRerolls;
  state.lastRound = {
    round: state.round,
    threat: clone(threat),
    playerPreview,
    enemyRoll,
    battle,
    scoring,
    apogeeHitBonus,
    apogeeEnergyBonus,
    distressPenalty,
    scored
  };
  state.roundHistory.push(state.lastRound);
  state.phase = "reveal";
  state.selected = [];
  state.actions.push({ action: "lock-orders", round: state.round, scored, rng: state.rng });
  state.messages = [
    { type: playerBattle.hits >= enemyBattle.hits ? "laser" : "shield", text: `${threat.name} resolved: +${scored} fleet score.` }
  ];
  return { ok: true, result: state.lastRound };
}

export function advanceAfterReveal(state) {
  if (state.phase !== "reveal") return { ok: false, message: "Resolve the current battle first." };
  if (state.round >= MAX_ROUNDS) {
    state.phase = "complete";
    state.messages = [{ type: "energy", text: "Apogee run complete." }];
    return { ok: true, complete: true };
  }
  state.round += 1;
  state.phase = "workshop";
  state.workshopActionTaken = false;
  state.resources.energy = Math.min(12, state.resources.energy + 1 + state.tracks.reactor);
  state.rolls = {};
  state.powerSelections = [];
  state.selected = [];
  state.messages = [{ type: "energy", text: `Reactor charge +${1 + state.tracks.reactor} Energy.` }];
  return { ok: true, complete: false };
}

export function costLabel(cost) {
  if (!cost) return "MAX";
  return Object.entries(cost)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${value} ${SYMBOLS[key].short}`)
    .join(" · ");
}

export function scoreRank(score) {
  if (score >= 180) return { title: "Mythic Admiral", tier: "S" };
  if (score >= 150) return { title: "Nova Architect", tier: "A" };
  if (score >= 125) return { title: "Starforged", tier: "B" };
  if (score >= 95) return { title: "Fleet Smith", tier: "C" };
  return { title: "Drift Cadet", tier: "D" };
}

export function cloneState(state) {
  return clone(state);
}

export function hydrateFleetState(state) {
  if (!state || state.version !== GAME_VERSION || !Array.isArray(state.ships)) return null;
  for (const ship of state.ships) {
    const firstForgedFace = ship.faces?.find((face) => face.forged);
    if (!firstForgedFace) continue;
    if (!ship.forgeReinforcement) {
      ship.forgeReinforcement = 1;
      ship.structure += 1;
    }
    if (!ship.forgeSystem) {
      ship.forgeSystem = { symbol: firstForgedFace.symbol, value: 1, charge: 1 };
    } else if (!Number.isInteger(ship.forgeSystem.charge)) {
      ship.forgeSystem.charge = 1;
    }
  }
  return state;
}
