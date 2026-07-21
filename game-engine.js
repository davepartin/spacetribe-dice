export const DIE_SIZES = [4, 6, 8, 10, 12, 20];

export const SYMBOLS = {
  attack: { label: "Attack", short: "ATK", color: "#ff5c57" },
  energy: { label: "Energy", short: "NRG", color: "#68e7ff" },
  tech: { label: "Tech", short: "TEC", color: "#b6f36b" },
  forge: { label: "Forge", short: "FRG", color: "#ffb45e" },
  flux: { label: "Flux", short: "FLX", color: "#d68cff" },
  wild: { label: "Wild", short: "ANY", color: "#fff2a8" },
  void: { label: "Void", short: "—", color: "#8290a8" }
};

const FAMILY_DEFS = {
  core: {
    name: "Vanguard Core",
    callSign: "CORE",
    color: "#e7eef9",
    accent: "#ffffff",
    pattern: ["attack", "energy", "tech", "forge", "attack", "wild", "flux", "attack", "energy", "tech", "attack", "forge", "attack", "wild", "energy", "tech", "attack", "flux", "attack", "wild"],
    values:  [1, 1, 1, 1, 2, 1, 1, 2, 2, 2, 3, 2, 3, 2, 3, 3, 4, 3, 4, 3]
  },
  scout: {
    name: "Pathfinder",
    callSign: "SCOUT",
    color: "#57d7b7",
    accent: "#b8fff0",
    pattern: ["attack", "tech", "energy", "forge", "wild", "tech", "attack", "flux", "energy", "attack", "tech", "forge", "wild", "attack", "flux", "tech", "attack", "energy", "attack", "wild"],
    values:  [1, 1, 1, 1, 1, 2, 2, 1, 2, 2, 3, 2, 2, 3, 2, 3, 4, 3, 4, 3]
  },
  assault: {
    name: "Siege Ember",
    callSign: "ASSAULT",
    color: "#f25955",
    accent: "#ffb19d",
    pattern: ["attack", "attack", "void", "attack", "attack", "wild", "attack", "flux", "attack", "attack", "void", "attack", "wild", "attack", "forge", "attack", "attack", "energy", "attack", "wild"],
    values:  [1, 2, 0, 1, 2, 1, 3, 1, 2, 3, 0, 4, 2, 3, 2, 4, 5, 2, 5, 3]
  },
  reactor: {
    name: "Ion Heart",
    callSign: "REACTOR",
    color: "#43bde4",
    accent: "#b7f2ff",
    pattern: ["energy", "energy", "void", "energy", "wild", "energy", "tech", "energy", "flux", "energy", "energy", "forge", "wild", "energy", "tech", "energy", "attack", "energy", "flux", "wild"],
    values:  [1, 1, 0, 2, 1, 2, 1, 3, 1, 2, 3, 2, 2, 4, 2, 4, 2, 5, 3, 3]
  },
  research: {
    name: "Quantum Loom",
    callSign: "RESEARCH",
    color: "#92cf56",
    accent: "#e5ffb2",
    pattern: ["tech", "tech", "forge", "wild", "tech", "flux", "tech", "energy", "tech", "forge", "wild", "tech", "attack", "tech", "flux", "tech", "energy", "tech", "forge", "wild"],
    values:  [1, 1, 1, 1, 2, 1, 2, 1, 3, 2, 2, 3, 2, 4, 2, 4, 2, 5, 3, 3]
  },
  modifier: {
    name: "Prism Spindle",
    callSign: "MOD",
    color: "#a86be8",
    accent: "#ecc7ff",
    pattern: ["flux", "wild", "flux", "void", "flux", "tech", "wild", "flux", "forge", "flux", "energy", "wild", "flux", "tech", "flux", "attack", "wild", "flux", "forge", "flux"],
    values:  [1, 1, 1, 0, 2, 1, 2, 2, 1, 3, 1, 2, 3, 2, 4, 2, 3, 4, 3, 5]
  }
};

export const MARKET = [
  { family: "assault", title: "Siege Ember", detail: "Attack-heavy, volatile", cost: { tech: 3, energy: 2 } },
  { family: "reactor", title: "Ion Heart", detail: "Energy and reroll fuel", cost: { tech: 3, forge: 1 } },
  { family: "research", title: "Quantum Loom", detail: "Tech and forging support", cost: { tech: 2, energy: 2 } },
  { family: "modifier", title: "Prism Spindle", detail: "Flux accelerates die growth", cost: { tech: 2, forge: 2 } }
];

export const TRACKS = {
  arsenal: {
    name: "Arsenal",
    color: "attack",
    description: "+1 base attack per level. Formation volleys grow stronger."
  },
  reactor: {
    name: "Reactor",
    color: "energy",
    description: "+1 energy each round. Gain another reroll at levels 2 and 4."
  },
  foundry: {
    name: "Foundry",
    color: "forge",
    description: "Forge stronger faces. Face-forging gets cheaper at level 3."
  }
};

const MAX_TRACK = 5;
const SCORE_VERSION = 1;

function makeId(prefix = "die") {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

function makeFace(family, index) {
  const def = FAMILY_DEFS[family];
  return {
    symbol: def.pattern[index],
    value: def.values[index],
    forged: false
  };
}

export function createDie(family, sides = 4, id = makeId(family)) {
  const def = FAMILY_DEFS[family];
  if (!def || !DIE_SIZES.includes(sides)) throw new Error("Unknown die specification");
  return {
    id,
    family,
    name: def.name,
    callSign: def.callSign,
    color: def.color,
    accent: def.accent,
    sides,
    faces: Array.from({ length: sides }, (_, index) => makeFace(family, index))
  };
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

function rollOne(state, die) {
  const index = Math.floor(nextRandom(state) * die.faces.length);
  const face = die.faces[index];
  return {
    index,
    symbol: face.symbol,
    value: face.value,
    forged: face.forged,
    wildChoice: face.symbol === "wild" ? "attack" : null
  };
}

export function createInitialState(playerName = "Pilot", seed = initialSeed()) {
  const safeName = String(playerName).trim().slice(0, 18) || "Pilot";
  const state = {
    version: SCORE_VERSION,
    runId: makeId("run"),
    playerName: safeName,
    createdAt: new Date().toISOString(),
    seed: seed >>> 0 || 1,
    rng: seed >>> 0 || 1,
    round: 1,
    phase: "rolling",
    score: 0,
    lastRound: null,
    roundHistory: [],
    resources: { energy: 1, tech: 1, forge: 1, flux: 1 },
    tracks: { arsenal: 0, reactor: 0, foundry: 0 },
    dice: [
      createDie("core", 6, "core-1"),
      createDie("reactor", 4, "reactor-1"),
      createDie("scout", 4, "scout-1")
    ],
    rolls: {},
    selected: [],
    rerollsUsed: 0,
    overclockUsed: false,
    messages: [],
    actions: []
  };
  beginRound(state, true);
  return state;
}

export function baseAttack(state) {
  return 2 + state.tracks.arsenal;
}

export function rerollsAvailable(state) {
  return 1 + Math.floor(state.tracks.reactor / 2);
}

export function maxDice(state) {
  return 6 + Math.floor(state.tracks.reactor / 2);
}

export function beginRound(state, initial = false) {
  if (state.phase === "complete") return state;
  state.phase = "rolling";
  state.rerollsUsed = 0;
  state.selected = [];
  state.rolls = {};
  const charge = 1 + state.tracks.reactor;
  state.resources.energy += charge;
  state.dice.forEach((die) => {
    state.rolls[die.id] = rollOne(state, die);
  });
  state.messages = [{ type: "energy", text: `Reactor charge +${charge} energy` }];
  state.actions.push({ action: initial ? "start" : "round", round: state.round, rng: state.rng });
  return state;
}

export function toggleSelection(state, dieId) {
  if (state.phase !== "rolling" || !state.rolls[dieId]) return state;
  state.selected = state.selected.includes(dieId)
    ? state.selected.filter((id) => id !== dieId)
    : [...state.selected, dieId];
  return state;
}

export function cycleWild(state, dieId) {
  const roll = state.rolls[dieId];
  if (state.phase !== "rolling" || roll?.symbol !== "wild") return state;
  const choices = ["attack", "energy", "tech", "forge", "flux"];
  const next = (choices.indexOf(roll.wildChoice) + 1) % choices.length;
  roll.wildChoice = choices[next];
  state.selected = state.selected.filter((id) => id !== dieId);
  return state;
}

export function rerollSelected(state) {
  if (state.phase !== "rolling") return { ok: false, message: "The roll is already locked." };
  const ids = [...state.selected];
  if (!ids.length) return { ok: false, message: "Select at least one die." };
  if (state.rerollsUsed >= rerollsAvailable(state)) return { ok: false, message: "No rerolls remain this round." };
  if (state.resources.energy < ids.length) return { ok: false, message: `You need ${ids.length} energy.` };
  state.resources.energy -= ids.length;
  ids.forEach((id) => {
    const die = state.dice.find((item) => item.id === id);
    if (die) state.rolls[id] = rollOne(state, die);
  });
  state.rerollsUsed += 1;
  state.selected = [];
  state.messages = [{ type: "energy", text: `Rerolled ${ids.length} ${ids.length === 1 ? "die" : "dice"}` }];
  state.actions.push({ action: "reroll", round: state.round, ids, rng: state.rng });
  return { ok: true };
}

export function overclock(state) {
  if (state.phase !== "rolling") return { ok: false, message: "The roll is already locked." };
  if (state.overclockUsed) return { ok: false, message: "Overclock was already spent this run." };
  state.dice.forEach((die) => {
    state.rolls[die.id] = rollOne(state, die);
  });
  state.overclockUsed = true;
  state.selected = [];
  state.messages = [{ type: "flux", text: "Overclock! Every die rerolled for free." }];
  state.actions.push({ action: "overclock", round: state.round, rng: state.rng });
  return { ok: true };
}

function resolvedSymbol(roll) {
  return roll.symbol === "wild" ? roll.wildChoice : roll.symbol;
}

export function previewRoll(state) {
  const gains = { energy: 0, tech: 0, forge: 0, flux: 0 };
  let attack = 0;
  let attackDice = 0;
  const attackFamilies = new Set();
  Object.entries(state.rolls).forEach(([id, roll]) => {
    const symbol = resolvedSymbol(roll);
    if (symbol === "attack") {
      attack += roll.value;
      attackDice += 1;
      const die = state.dice.find((item) => item.id === id);
      if (die) attackFamilies.add(die.family);
    } else if (symbol in gains) {
      gains[symbol] += roll.value;
    }
  });
  const formation = attackDice >= 3 ? 2 + state.tracks.arsenal : 0;
  const spectrum = attackFamilies.size >= 3 ? 3 : 0;
  const totalAttack = baseAttack(state) + attack + formation + spectrum;
  return {
    gains,
    attack,
    attackDice,
    formation,
    spectrum,
    base: baseAttack(state),
    totalAttack
  };
}

export function commitRoll(state) {
  if (state.phase !== "rolling") return { ok: false, message: "Nothing to commit." };
  const preview = previewRoll(state);
  Object.entries(preview.gains).forEach(([key, value]) => {
    state.resources[key] += value;
  });
  const salvage = state.round < 10 ? 1 : 0;
  state.resources.tech += salvage;

  let apogeeBonus = 0;
  if (state.round === 10) {
    const engineAmplifier = Math.floor((state.tracks.reactor + state.tracks.foundry) / 2);
    apogeeBonus = preview.totalAttack * (1 + engineAmplifier)
      + Math.floor(state.resources.energy / 2)
      + state.resources.tech
      + state.resources.forge * 2
      + state.resources.flux * 2
      + Object.values(state.tracks).reduce((sum, level) => sum + level, 0) * 3;
  }
  const scored = preview.totalAttack + apogeeBonus;
  state.score += scored;
  state.lastRound = { round: state.round, ...preview, salvage, apogeeBonus, scored };
  state.roundHistory.push(state.lastRound);
  state.actions.push({ action: "commit", round: state.round, scored, rng: state.rng });
  state.selected = [];

  if (state.round === 10) {
    state.phase = "complete";
    state.messages = [{ type: "attack", text: `Apogee strike: +${scored} fleet power` }];
  } else {
    state.phase = "workshop";
    state.messages = [
      { type: "attack", text: `Volley banked +${preview.totalAttack}` },
      ...(salvage ? [{ type: "tech", text: "+1 command salvage" }] : []),
      ...Object.entries(preview.gains)
        .filter(([, value]) => value > 0)
        .map(([type, value]) => ({ type, text: `+${value} ${SYMBOLS[type].label.toLowerCase()}` }))
    ];
  }
  return { ok: true, preview, scored, apogeeBonus };
}

function canAfford(resources, cost) {
  return Object.entries(cost).every(([key, value]) => resources[key] >= value);
}

function pay(resources, cost) {
  Object.entries(cost).forEach(([key, value]) => {
    resources[key] -= value;
  });
}

export function trackCost(state, track) {
  const level = state.tracks[track];
  const support = 1 + Math.floor((level + 1) / 2);
  if (track === "arsenal") return { tech: 2 + level, forge: support };
  if (track === "reactor") return { tech: 2 + level, energy: support };
  return { tech: 2 + level, forge: support };
}

export function buyTrack(state, track) {
  if (state.phase !== "workshop" || !(track in TRACKS)) return { ok: false, message: "Tracks can only advance in the workshop." };
  if (state.tracks[track] >= MAX_TRACK) return { ok: false, message: "That track is already mastered." };
  const cost = trackCost(state, track);
  if (!canAfford(state.resources, cost)) return { ok: false, message: "Not enough resources." };
  pay(state.resources, cost);
  state.tracks[track] += 1;
  state.actions.push({ action: "track", round: state.round, track, level: state.tracks[track] });
  return { ok: true, message: `${TRACKS[track].name} advanced to ${state.tracks[track]}.` };
}

export function upgradeCost(die) {
  const tier = DIE_SIZES.indexOf(die.sides);
  if (tier < 0 || tier >= DIE_SIZES.length - 1) return null;
  return { tech: 2 + tier, flux: Math.max(1, Math.ceil(tier / 2)) };
}

export function upgradeDie(state, dieId) {
  if (state.phase !== "workshop") return { ok: false, message: "Dice can only be upgraded in the workshop." };
  const die = state.dice.find((item) => item.id === dieId);
  if (!die) return { ok: false, message: "Die not found." };
  const cost = upgradeCost(die);
  if (!cost) return { ok: false, message: "That die has reached d20." };
  if (!canAfford(state.resources, cost)) return { ok: false, message: "Not enough tech and flux." };
  pay(state.resources, cost);
  const nextSides = DIE_SIZES[DIE_SIZES.indexOf(die.sides) + 1];
  for (let index = die.sides; index < nextSides; index += 1) die.faces.push(makeFace(die.family, index));
  die.sides = nextSides;
  state.actions.push({ action: "upgrade-die", round: state.round, dieId, sides: nextSides });
  return { ok: true, message: `${die.name} grew into a d${nextSides}.` };
}

export function forgeCost(state) {
  return { tech: 1, forge: state.tracks.foundry >= 3 ? 1 : 2 };
}

export function forgeFace(state, dieId, symbol) {
  if (state.phase !== "workshop") return { ok: false, message: "Faces can only be forged in the workshop." };
  if (!["attack", "energy", "tech", "forge", "flux"].includes(symbol)) return { ok: false, message: "Choose a forge symbol." };
  const die = state.dice.find((item) => item.id === dieId);
  if (!die) return { ok: false, message: "Die not found." };
  const cost = forgeCost(state);
  if (!canAfford(state.resources, cost)) return { ok: false, message: "Not enough forge and tech." };
  const candidates = die.faces
    .map((face, index) => ({ face, index }))
    .filter(({ face }) => !face.forged)
    .sort((a, b) => {
      if (a.face.symbol === "void" && b.face.symbol !== "void") return -1;
      if (b.face.symbol === "void" && a.face.symbol !== "void") return 1;
      return a.face.value - b.face.value;
    });
  if (!candidates.length) return { ok: false, message: "Every face on that die is already forged." };
  pay(state.resources, cost);
  const target = candidates[0];
  die.faces[target.index] = {
    symbol,
    value: 2 + Math.floor(state.tracks.foundry / 2),
    forged: true
  };
  state.actions.push({ action: "forge-face", round: state.round, dieId, face: target.index, symbol });
  return { ok: true, message: `Forged ${SYMBOLS[symbol].label} ${die.faces[target.index].value} onto ${die.name}.` };
}

export function buyDie(state, family) {
  if (state.phase !== "workshop") return { ok: false, message: "Dice can only be acquired in the workshop." };
  const item = MARKET.find((entry) => entry.family === family);
  if (!item) return { ok: false, message: "Unknown market die." };
  if (state.dice.length >= maxDice(state)) return { ok: false, message: `Your bay is full (${maxDice(state)} dice).` };
  if (!canAfford(state.resources, item.cost)) return { ok: false, message: "Not enough resources." };
  pay(state.resources, item.cost);
  const die = createDie(family, 4);
  state.dice.push(die);
  state.actions.push({ action: "buy-die", round: state.round, family, dieId: die.id });
  return { ok: true, message: `${die.name} joined the bay.` };
}

export function scrapDie(state, dieId) {
  if (state.phase !== "workshop") return { ok: false, message: "Dice can only be scrapped in the workshop." };
  const die = state.dice.find((item) => item.id === dieId);
  if (!die || die.family === "core") return { ok: false, message: "The Vanguard Core cannot be scrapped." };
  if (state.dice.length <= 2) return { ok: false, message: "Keep at least two dice in your fleet." };
  state.dice = state.dice.filter((item) => item.id !== dieId);
  state.resources.tech += 1;
  state.resources.flux += Math.floor(DIE_SIZES.indexOf(die.sides) / 2);
  state.actions.push({ action: "scrap-die", round: state.round, dieId });
  return { ok: true, message: `Scrapped ${die.name}: +1 tech.` };
}

export function nextRound(state) {
  if (state.phase !== "workshop") return { ok: false, message: "Finish the current roll first." };
  state.round += 1;
  beginRound(state);
  return { ok: true };
}

export function costLabel(cost) {
  return Object.entries(cost)
    .map(([key, value]) => `${value} ${SYMBOLS[key].short}`)
    .join(" · ");
}

export function scoreRank(score) {
  if (score >= 120) return { title: "Mythic Forge", tier: "S" };
  if (score >= 95) return { title: "Nova Architect", tier: "A" };
  if (score >= 75) return { title: "Starforged", tier: "B" };
  if (score >= 55) return { title: "Fleet Smith", tier: "C" };
  return { title: "Drift Cadet", tier: "D" };
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}
