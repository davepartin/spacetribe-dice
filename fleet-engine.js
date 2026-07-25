// Fleet Dice — rules kernel
// Pure and deterministic. All randomness enters through an injected RNG.
// See FLEET-DICE.md for the design rationale behind every constant here.

export const ENGINE_VERSION = 1;

export const SYMBOLS = Object.freeze({
  laser:   { label: "Laser",   short: "LAS", color: "#ff4d5e", kind: "attack"  },
  missile: { label: "Missile", short: "MSL", color: "#ff9d3d", kind: "attack"  },
  shield:  { label: "Shield",  short: "SHD", color: "#42b8ff", kind: "defense" },
  flak:    { label: "Flak",    short: "FLK", color: "#3fd99b", kind: "defense" },
  wild:    { label: "Wild",    short: "WLD", color: "#ffd75e", kind: "wild"    }
});

export const SIZES = Object.freeze([4, 6, 8, 10]);

export const FAMILIES = Object.freeze({
  interceptor: { label: "Interceptor", attack: "laser",   defense: "shield", rampBonus: 0, color: "#ff6b7a" },
  lancer:      { label: "Lancer",      attack: "missile", defense: "shield", rampBonus: 0, color: "#ffa94d" },
  bulwark:     { label: "Bulwark",     attack: "laser",   defense: "flak",   rampBonus: 0, color: "#4ec3ff" },
  reactor:     { label: "Reactor",     attack: "laser",   defense: "shield", rampBonus: 1, color: "#b98bff" }
});

// ── Economy ────────────────────────────────────────────────────────────────
export const ECONOMY = Object.freeze({
  startingBank: 3,
  stipend: 3,
  salvage: 2,
  freeRerolls: 2,
  rerollCost: 1,
  maxShips: 8,
  freeDeploy: 5,
  deployUpkeep: 1,
  resymbolCost: 2,
  extendRampCost: 4,
  overchargeCost: 6,
  overchargePay: 1,
  repairCost: 1,           // 1 Energy repairs 2 Stress
  repairAmount: 2,
  sizeUpCost: { 6: 3, 8: 5, 10: 8 },
  buyLadder: [0, 0, 0, 4, 5, 6, 8, 10],   // cost of the Nth ship, index = current fleet size
  surplusToEnergy: 2,      // 2 surplus defense -> 1 Energy
  surplusCap: 3,
  preventedCap: 14,        // damage and prevention pay the same rate; see scoreRound
  protocolLevelCost: { 2: 6, 3: 12 }
});

export const STRUCTURE = Object.freeze({ 4: 2, 6: 3, 8: 5, 10: 7 });

// ── Dice construction ──────────────────────────────────────────────────────

/**
 * The factory printing of face `n` on a `size`-sided hull of the given family.
 *  n === 1        -> Wild, and the richest Energy face
 *  odd (3,5,7,9)  -> the family's attack symbol
 *  even           -> the family's defense symbol
 *  n <= size/2    -> carries Energy on a descending ramp
 * Attack and defense averages are exactly equal on every size once 1 is Wild.
 */
export function factoryFace(size, family, n) {
  const fam = FAMILIES[family];
  if (!fam) throw new Error(`Unknown family: ${family}`);
  const half = size / 2;
  const rampTop = half + fam.rampBonus;
  const symbol = n === 1 ? "wild" : (n % 2 === 1 ? fam.attack : fam.defense);
  const energy = n <= rampTop ? Math.max(1, Math.round(half) - n + 1) : 0;
  return { n, symbol, energy };
}

export function createShip(id, family, size = 4) {
  if (!SIZES.includes(size)) throw new Error(`Bad size: ${size}`);
  return {
    id,
    family,
    size,
    overrides: {},          // faceNumber -> symbol
    ramped: [],             // face numbers granted an Energy pip by upgrade
    overcharged: [],        // face numbers that roll +3 when powered
    stress: 0,
    disabled: false
  };
}

/** The full, current face map of a ship, after every upgrade it carries. */
export function shipFaces(ship) {
  const out = [];
  for (let n = 1; n <= ship.size; n++) {
    const face = factoryFace(ship.size, ship.family, n);
    if (ship.overrides[n]) face.symbol = ship.overrides[n];
    if (ship.ramped.includes(n) && face.energy === 0) face.energy = 1;
    face.overcharge = ship.overcharged.includes(n);
    face.upgraded = Boolean(ship.overrides[n]) || ship.ramped.includes(n) || face.overcharge;
    out.push(face);
  }
  return out;
}

export function structureOf(ship) {
  return STRUCTURE[ship.size];
}

// ── Rolling ────────────────────────────────────────────────────────────────

export function makeRng(seed) {
  let s = (seed >>> 0) || 0x9e3779b9;
  return function rng() {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 0x100000000;
  };
}

export function rollFleet(ships, rng) {
  return ships
    .filter((s) => !s.disabled)
    .map((ship) => {
      const n = 1 + Math.floor(rng() * ship.size);
      const face = shipFaces(ship)[n - 1];
      return { shipId: ship.id, size: ship.size, family: ship.family, ...face };
    });
}

export function rerollDice(ships, dice, shipIds, rng) {
  const byId = new Map(ships.map((s) => [s.id, s]));
  return dice.map((d) => {
    if (!shipIds.includes(d.shipId)) return d;
    const ship = byId.get(d.shipId);
    const n = 1 + Math.floor(rng() * ship.size);
    const face = shipFaces(ship)[n - 1];
    return { shipId: ship.id, size: ship.size, family: ship.family, ...face };
  });
}

// ── Formations ─────────────────────────────────────────────────────────────
// A Wild may stand in for any value its OWN die could roll: a d4 Wild can be a
// 3, never an 8. That cap is what keeps small fleets locked out of high tiers.

export function runTier(top) {
  if (top <= 4) return 1;
  if (top <= 6) return 2;
  if (top <= 8) return 3;
  return 4;
}

function isWild(d) { return d.symbol === "wild"; }

/** Best Triad (3+ of a number) among the given dice indices. */
function findTriad(dice, avail) {
  let best = null;
  const wilds = avail.filter((i) => isWild(dice[i]));
  const numbers = new Set(avail.filter((i) => !isWild(dice[i])).map((i) => dice[i].n));
  for (const num of numbers) {
    const exact = avail.filter((i) => !isWild(dice[i]) && dice[i].n === num);
    const usableWilds = wilds.filter((i) => dice[i].size >= num);
    const count = exact.length + usableWilds.length;
    if (count < 3) continue;
    const members = [...exact, ...usableWilds].slice(0, Math.max(3, Math.min(count, exact.length + usableWilds.length)));
    const value = num * members.length;
    if (!best || value > best.value) {
      best = { type: "triad", number: num, members, value, size: members.length };
    }
  }
  return best;
}

/** Best Run (3+ consecutive) among the given dice indices. */
function findRun(dice, avail) {
  let best = null;
  const wildIdx = avail.filter((i) => isWild(dice[i]));
  const byNum = new Map();
  for (const i of avail) {
    if (isWild(dice[i])) continue;
    if (!byNum.has(dice[i].n)) byNum.set(dice[i].n, []);
    byNum.get(dice[i].n).push(i);
  }
  for (let start = 1; start <= 10; start++) {
    for (let len = 10; len >= 3; len--) {
      const top = start + len - 1;
      if (top > 10) continue;
      const members = [];
      const wildPool = [...wildIdx];
      let ok = true;
      for (let k = 0; k < len; k++) {
        const v = start + k;
        const have = byNum.get(v);
        if (have && have.length) { members.push(have[0]); continue; }
        const wi = wildPool.findIndex((i) => dice[i].size >= v);
        if (wi === -1) { ok = false; break; }
        members.push(wildPool.splice(wi, 1)[0]);
      }
      if (!ok || members.length !== len) continue;
      const yieldValue = (len * (start + top)) / 2;   // sum of the run
      if (!best || len > best.size || (len === best.size && top > best.top)) {
        best = { type: "run", start, top, tier: runTier(top), members, value: yieldValue, size: len, yield: yieldValue };
      }
      break;
    }
  }
  return best;
}

/** Best Battery (3+ of a symbol) among the given dice indices. */
function findBattery(dice, avail) {
  let best = null;
  const wilds = avail.filter((i) => isWild(dice[i]));
  for (const sym of ["laser", "missile", "shield", "flak"]) {
    const exact = avail.filter((i) => dice[i].symbol === sym);
    const members = [...exact, ...wilds];
    if (members.length < 3) continue;
    const value = members.reduce((a, i) => a + dice[i].n, 0);
    if (!best || value > best.value) {
      best = { type: "battery", symbol: sym, members, value, size: members.length };
    }
  }
  return best;
}

/**
 * Greedy highest-value-first partition. Each die lands in at most one
 * Formation, so N dice yield at most floor(N/3) Formations.
 */
export function findFormations(dice) {
  let avail = dice.map((_, i) => i);
  const found = [];
  for (let guard = 0; guard < 8; guard++) {
    const candidates = [findTriad(dice, avail), findRun(dice, avail), findBattery(dice, avail)]
      .filter(Boolean);
    if (!candidates.length) break;
    candidates.sort((a, b) => b.value - a.value);
    const pick = candidates[0];
    found.push(pick);
    const used = new Set(pick.members);
    avail = avail.filter((i) => !used.has(i));
    if (avail.length < 3) break;
  }
  return found;
}

// ── Protocols ──────────────────────────────────────────────────────────────

export const PROTOCOLS = Object.freeze({
  // Set slot
  fireControl: {
    slot: "set", name: "Fire Control",
    blurb: "Turn matched numbers into surgical damage.",
    levels: [
      "Triad → Scar one upgraded face on a target ship back to factory.",
      "Triad → Stun: the target ship does not roll next round.",
      "Quad → Breach: destroy a ship. Its owner chooses which to scrap."
    ]
  },
  resonance: {
    slot: "set", name: "Resonance",
    blurb: "Matched numbers hit twice.",
    levels: [
      "Triad → deal the matched number again as raw damage.",
      "Quad → deal it twice more.",
      "A Triad of Wilds counts as a Quad of any number you name."
    ]
  },
  cascade: {
    slot: "set", name: "Cascade",
    blurb: "Matched numbers pay you.",
    levels: [
      "Triad → gain Energy equal to the matched number.",
      "Also gain one free reroll next round.",
      "Overcharges cost nothing in a round you trigger this."
    ]
  },
  // Run slot
  broadside: {
    slot: "run", name: "Broadside",
    blurb: "Runs become damage.",
    levels: [
      "Deal damage equal to the Run's yield.",
      "That damage ignores enemy Shields.",
      "Also strike a second target for half."
    ]
  },
  aegis: {
    slot: "run", name: "Aegis",
    blurb: "Runs become defense.",
    levels: [
      "Gain Shields equal to the Run's yield.",
      "Surplus defense converts to Energy 1:1 instead of 2:1.",
      "Those Shields stop Missiles as well as Lasers."
    ]
  },
  shipwright: {
    slot: "run", name: "Shipwright",
    blurb: "Runs become fleet.",
    levels: [
      "Gain Energy equal to half the Run's yield.",
      "Run of 4+ → Size Up one ship free, up to the Run's tier.",
      "Run of 5+ → Size Up free and re-symbol two faces."
    ]
  },
  // Battery slot
  focusedArray: {
    slot: "battery", name: "Focused Array",
    blurb: "Massed fire punches through.",
    levels: [
      "The Battery's symbol total ignores its matching defense.",
      "Add +2 to that total.",
      "Add +4 instead, and it cannot be reduced below 1."
    ]
  },
  killNet: {
    slot: "battery", name: "Kill Net",
    blurb: "Massed defense swats incoming fire.",
    levels: [
      "A Flak Battery cancels one incoming Precision Strike.",
      "Add +2 Flak.",
      "Cancels all incoming Precision Strikes this round."
    ]
  },
  overload: {
    slot: "battery", name: "Overload",
    blurb: "Massed dice re-task on the fly.",
    levels: [
      "Convert the Battery to any other symbol before resolution.",
      "Also add +1 per die in the Battery.",
      "Split the Battery across two symbols however you like."
    ]
  }
});

export const PROTOCOL_SLOTS = Object.freeze(["set", "run", "battery"]);

export function protocolsForSlot(slot) {
  return Object.entries(PROTOCOLS).filter(([, p]) => p.slot === slot).map(([id]) => id);
}

export function createLoadout(setId = "resonance", runId = "broadside", batteryId = "focusedArray") {
  return {
    set: { id: setId, level: 1 },
    run: { id: runId, level: 1 },
    battery: { id: batteryId, level: 1 }
  };
}

// ── Applying Formations through Protocols ──────────────────────────────────

const EMPTY_TOTALS = () => ({ laser: 0, missile: 0, shield: 0, flak: 0 });

/**
 * Sum the raw dice, then let each Formation's Protocol modify the result.
 * Returns totals, Energy earned, and any Precision Strike that was triggered.
 */
export function resolveFleetIntent(dice, formations, loadout, wildAssignments = {}) {
  const totals = EMPTY_TOTALS();
  let energy = 0;
  const notes = [];
  let strike = null;
  let pierceLaser = false;
  let pierceMissile = false;
  let shieldsBlockMissiles = false;
  let freeRerollsNext = 0;

  for (let i = 0; i < dice.length; i++) {
    const d = dice[i];
    energy += d.energy || 0;
    let sym = d.symbol;
    if (sym === "wild") sym = wildAssignments[i] || "laser";
    if (totals[sym] !== undefined) totals[sym] += d.n;
  }

  for (const f of formations) {
    if (f.type === "triad") {
      const p = loadout.set;
      if (p.id === "resonance") {
        const bonus = f.size >= 4 && p.level >= 2 ? f.number * 3 : f.number;
        totals.laser += bonus;
        notes.push(`Resonance: +${bonus} from a ${f.size}× ${f.number}`);
      } else if (p.id === "cascade") {
        const gain = f.number * (f.size - 1);
        energy += gain;
        if (p.level >= 2) freeRerollsNext += 1;
        notes.push(`Cascade: +${gain} Energy from ${f.size}× ${f.number}`);
      } else if (p.id === "fireControl") {
        const mode = f.size >= 4 && p.level >= 3 ? "breach" : (p.level >= 2 ? "stun" : "scar");
        strike = { mode, power: f.number };
        totals.laser += f.number;   // a strike still puts rounds on target
        notes.push(`Fire Control: ${mode.toUpperCase()} armed (+${f.number} Laser)`);
      }
    } else if (f.type === "run") {
      const p = loadout.run;
      if (p.id === "broadside") {
        // Half yield until Level 3. At full yield on every level, Broadside won
        // 68% of bot matches: damage scores AND disables enemy ships, so offense
        // compounds in a way defense does not.
        const dealt = p.level >= 3 ? f.yield : Math.ceil(f.yield / 2);
        totals.laser += dealt;
        if (p.level >= 2) pierceLaser = true;
        notes.push(`Broadside: +${dealt} Laser (tier ${f.tier} run)`);
      } else if (p.id === "aegis") {
        totals.shield += f.yield;
        if (p.level >= 3) shieldsBlockMissiles = true;
        notes.push(`Aegis: +${f.yield} Shield`);
      } else if (p.id === "shipwright") {
        const gain = Math.floor(f.yield / 2);
        energy += gain;
        notes.push(`Shipwright: +${gain} Energy` + (p.level >= 2 && f.size >= 4 ? `, free Size Up to tier ${f.tier}` : ""));
      }
    } else if (f.type === "battery") {
      const p = loadout.battery;
      const sym = f.symbol;
      if (p.id === "focusedArray") {
        const bonus = p.level >= 3 ? 4 : (p.level >= 2 ? 2 : 0);
        totals[sym] += bonus;
        if (sym === "laser") pierceLaser = true;
        if (sym === "missile") pierceMissile = true;
        notes.push(`Focused Array: ${SYMBOLS[sym].label} pierces` + (bonus ? ` +${bonus}` : ""));
      } else if (p.id === "killNet") {
        if (p.level >= 2) totals.flak += 2;
        notes.push("Kill Net: incoming strike will be cancelled");
      } else if (p.id === "overload") {
        const bonus = f.size * p.level;
        totals[sym] += bonus;
        notes.push(`Overload: ${SYMBOLS[sym].label} re-tasked` + (bonus ? ` +${bonus}` : ""));
      }
    }
  }

  return {
    totals, energy, notes, strike, freeRerollsNext,
    flags: { pierceLaser, pierceMissile, shieldsBlockMissiles },
    hasKillNet: formations.some((f) => f.type === "battery" && f.symbol === "flak") &&
                loadout.battery.id === "killNet"
  };
}

// ── Combat ─────────────────────────────────────────────────────────────────

/**
 * Simultaneous resolution from both sides' locked totals.
 * Shields stop Lasers; Flak stops Missiles. No cancellation cascades.
 */
export function resolveVolley(a, b) {
  const side = (me, them) => {
    const laser = me.flags.pierceLaser ? me.totals.laser
      : Math.max(0, me.totals.laser - them.totals.shield);
    const missileBlock = them.flags.shieldsBlockMissiles
      ? them.totals.flak + them.totals.shield
      : them.totals.flak;
    const missile = me.flags.pierceMissile ? me.totals.missile
      : Math.max(0, me.totals.missile - missileBlock);
    return { laser, missile, damage: laser + missile };
  };
  const aOut = side(a, b);
  const bOut = side(b, a);

  const surplusRaw = (me, them) =>
    Math.max(0, me.totals.shield - them.totals.laser) +
    Math.max(0, me.totals.flak - them.totals.missile);
  const surplus = (me, them) =>
    Math.min(ECONOMY.surplusCap, Math.floor(surplusRaw(me, them) / ECONOMY.surplusToEnergy));

  const strikeLands = (me, them) => {
    if (!me.strike) return null;
    if (them.hasKillNet) return { ...me.strike, cancelled: true };
    return { ...me.strike, cancelled: false };
  };

  // How much of the incoming volley you stopped. Both sides use the identical
  // formula: everything they threw, minus everything that landed.
  const prevented = (them, theirOut) =>
    Math.max(0, (them.totals.laser + them.totals.missile) - theirOut.damage);

  return {
    a: { ...aOut, surplusEnergy: surplus(a, b), surplus: surplusRaw(a, b), strike: strikeLands(a, b), prevented: prevented(b, bOut) },
    b: { ...bOut, surplusEnergy: surplus(b, a), surplus: surplusRaw(b, a), strike: strikeLands(b, a), prevented: prevented(a, aOut) }
  };
}

/**
 * Defense you didn't need patches the fleet up. This is what lets a defensive
 * build compound the way an offensive one does: damage both scores and disables
 * ships, so shields need a lasting effect of their own, not just a one-round wall.
 */
export function repairFromSurplus(ships, surplus) {
  let pool = Math.floor(surplus / 3);
  const healed = [];
  for (const ship of ships) {
    if (pool <= 0) break;
    if (ship.stress <= 0) continue;
    const take = Math.min(pool, ship.stress);
    ship.stress -= take;
    pool -= take;
    healed.push({ shipId: ship.id, healed: take });
  }
  return healed;
}

/** Spread incoming damage as Stress down a chosen priority order. */
export function assignStress(ships, damage, priority = []) {
  const order = [...ships].sort((x, y) => {
    const px = priority.indexOf(x.id), py = priority.indexOf(y.id);
    return (px === -1 ? 99 : px) - (py === -1 ? 99 : py);
  });
  const log = [];
  let left = damage;
  for (const ship of order) {
    if (left <= 0) break;
    if (ship.disabled) continue;
    const room = structureOf(ship) - ship.stress;
    const take = Math.min(room, left);
    if (take <= 0) continue;
    ship.stress += take;
    left -= take;
    if (ship.stress >= structureOf(ship)) { ship.disabled = true; log.push({ shipId: ship.id, disabled: true, took: take }); }
    else log.push({ shipId: ship.id, disabled: false, took: take });
  }
  return { log, overflow: left };
}

// ── Economy helpers ────────────────────────────────────────────────────────

export function deployUpkeep(fleetSize) {
  return Math.max(0, fleetSize - ECONOMY.freeDeploy) * ECONOMY.deployUpkeep;
}

export function buyCost(fleetSize) {
  return ECONOMY.buyLadder[fleetSize] ?? 99;
}

export function sizeUpCost(ship) {
  const next = { 4: 6, 6: 8, 8: 10 }[ship.size];
  if (!next) return null;
  return { next, cost: ECONOMY.sizeUpCost[next] };
}

export function roundIncome(fleet, rolledEnergy) {
  return ECONOMY.stipend + ECONOMY.salvage + rolledEnergy - deployUpkeep(fleet.length);
}

/**
 * Damage and prevention are paid at the same rate. An earlier version paid
 * 2 per damage but only 1 per prevented and capped it at 6, which made the
 * pure-offense loadout win 84% of matches: blocking fifteen damage scored six
 * points while dealing fifteen scored thirty. Defense has to be worth what it
 * saves, or nobody will ever build it.
 */
export function scoreRound({ damage, prevented, formations, strike, surplus = 0 }) {
  let score = damage * 2 + Math.min(ECONOMY.preventedCap, prevented) * 2;
  // Defense you didn't need still counts for something. Without this, prevention
  // is capped by whatever the enemy happened to throw while damage is uncapped,
  // so a defensive fleet facing a quiet round scores nothing for playing well.
  score += Math.floor(surplus / 2);
  score += formations.length * 3;
  if (strike && !strike.cancelled) {
    score += strike.mode === "breach" ? 25 : strike.mode === "stun" ? 14 : 8;
  }
  return score;
}
