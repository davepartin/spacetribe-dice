/**
 * Terminal playtest — drives the real game-engine with a human-like late-engine plan.
 * Usage: node scripts/playtest.mjs [seed]
 */
import {
  buyDie,
  buyTrack,
  commitRoll,
  createInitialState,
  cycleWild,
  forgeFace,
  nextRound,
  overclock,
  previewRoll,
  rerollSelected,
  rerollsAvailable,
  scoreRank,
  toggleSelection,
  upgradeDie
} from "../game-engine.js";

const seed = Number(process.argv[2]) || 0xace0f07e;
const log = [];

function line(msg = "") {
  log.push(msg);
  console.log(msg);
}

function resolved(roll) {
  return roll.symbol === "wild" ? roll.wildChoice : roll.symbol;
}

function setWild(state, dieId, target) {
  for (let i = 0; i < 5 && state.rolls[dieId]?.wildChoice !== target; i += 1) {
    cycleWild(state, dieId);
  }
}

function describeBay(state) {
  return state.dice
    .map((die) => {
      const roll = state.rolls[die.id];
      const symbol = resolved(roll);
      return `${die.callSign} d${die.sides}:${symbol}${roll.value}${roll.forged ? "*" : ""}`;
    })
    .join("  ");
}

function resources(state) {
  const r = state.resources;
  return `E${r.energy} T${r.tech} F${r.forge} X${r.flux}`;
}

function tracks(state) {
  const t = state.tracks;
  return `Ars${t.arsenal} Rea${t.reactor} Fou${t.foundry}`;
}

function wantKeep(symbol, round) {
  if (round <= 6) return ["tech", "forge", "flux", "energy"].includes(symbol);
  if (round <= 8) return symbol === "attack" || ["tech", "flux", "forge"].includes(symbol);
  return symbol === "attack";
}

function assignWilds(state) {
  const target = state.round <= 6 ? "tech" : state.round <= 8 ? "flux" : "attack";
  for (const die of state.dice) {
    const roll = state.rolls[die.id];
    if (roll?.symbol === "wild") setWild(state, die.id, target);
  }
}

function maybeReroll(state) {
  assignWilds(state);
  const available = rerollsAvailable(state) - state.rerollsUsed;
  if (available <= 0) return;

  const bad = state.dice.filter((die) => {
    const symbol = resolved(state.rolls[die.id]);
    return symbol === "void" || !wantKeep(symbol, state.round);
  });

  // Spend energy on the worst dice only if we can still afford a useful workshop later.
  const maxSpend = Math.min(bad.length, available, Math.max(0, state.resources.energy - 1));
  if (maxSpend <= 0) return;

  // Prefer void / attack-when-building / resources-when-scoring.
  const ordered = [...bad].sort((a, b) => {
    const sa = resolved(state.rolls[a.id]);
    const sb = resolved(state.rolls[b.id]);
    const rank = (s) => (s === "void" ? 0 : state.round >= 9 && s !== "attack" ? 1 : 2);
    return rank(sa) - rank(sb);
  });

  state.selected = [];
  for (const die of ordered.slice(0, maxSpend)) toggleSelection(state, die.id);
  if (!state.selected.length) return;

  const before = describeBay(state);
  const result = rerollSelected(state);
  assignWilds(state);
  if (result.ok) {
    line(`    reroll → spent ${maxSpend}E | before ${before}`);
    line(`            after  ${describeBay(state)}`);
  }
}

function maybeOverclock(state) {
  if (state.overclockUsed || state.round < 9) return;
  const preview = previewRoll(state);
  if (preview.totalAttack < 10) {
    overclock(state);
    assignWilds(state);
    line(`    OVERCLOCK! bay → ${describeBay(state)}`);
  }
}

function firstOk(actions) {
  for (const action of actions) {
    const result = action();
    if (result?.ok) return result;
  }
  return null;
}

function forgeBest(state, symbol) {
  for (const die of state.dice) {
    const result = forgeFace(state, die.id, symbol);
    if (result.ok) return result;
  }
  return { ok: false };
}

function growBest(state, families) {
  for (const family of families) {
    const die = state.dice
      .filter((item) => item.family === family)
      .sort((a, b) => a.sides - b.sides)[0];
    if (die) {
      const result = upgradeDie(state, die.id);
      if (result.ok) return result;
    }
  }
  return { ok: false };
}

function buyUnique(state, family) {
  if (state.dice.some((die) => die.family === family)) return { ok: false };
  return buyDie(state, family);
}

function workshop(state) {
  const buys = [];
  // Late-engine plan: Prism + Research, push Reactor/Foundry, grow Flux engine, forge late attack.
  for (let i = 0; i < 8; i += 1) {
    const result = firstOk([
      () => buyUnique(state, "modifier"),
      () => buyUnique(state, "research"),
      () => (state.tracks.reactor < 4 ? buyTrack(state, "reactor") : { ok: false }),
      () => (state.tracks.foundry < 4 ? buyTrack(state, "foundry") : { ok: false }),
      () => growBest(state, ["modifier", "research", "reactor", "core", "scout"]),
      () => forgeBest(state, state.round < 7 ? "tech" : "attack"),
      () => buyUnique(state, "assault"),
      () => buyTrack(state, "arsenal"),
      () => buyTrack(state, "reactor"),
      () => buyTrack(state, "foundry")
    ]);
    if (!result) break;
    buys.push(result.message);
  }
  return buys;
}

line(`APOGEE FORGE — terminal playtest`);
line(`seed ${seed} · plan: late Reactor/Foundry engine`);
line("");

const state = createInitialState("Cursor", seed);

for (let round = 1; round <= 10; round += 1) {
  line(`── Round ${String(round).padStart(2, "0")} ──  score ${state.score}  ${tracks(state)}  bag ${resources(state)}`);
  line(`    open   ${describeBay(state)}`);

  maybeReroll(state);
  maybeOverclock(state);
  maybeReroll(state);
  assignWilds(state);

  const preview = previewRoll(state);
  line(
    `    bank   ATK ${preview.totalAttack} (base ${preview.base} + faces ${preview.attack}` +
      `${preview.formation ? ` + form ${preview.formation}` : ""}` +
      `${preview.spectrum ? ` + spec ${preview.spectrum}` : ""})` +
      ` | +${preview.gains.energy}E +${preview.gains.tech}T +${preview.gains.forge}F +${preview.gains.flux}X`
  );

  const committed = commitRoll(state);
  if (state.phase === "complete") {
    line(`    APOGEE +${committed.scored} (strike bonus ${committed.apogeeBonus})`);
    break;
  }

  line(`    after  score ${state.score}  bag ${resources(state)}`);
  const buys = workshop(state);
  if (buys.length) {
    for (const message of buys) line(`    shop   ${message}`);
  } else {
    line(`    shop   (held resources)`);
  }
  line(`    close  ${tracks(state)}  bag ${resources(state)}  bay ${state.dice.map((d) => `${d.callSign}d${d.sides}`).join(",")}`);
  nextRound(state);
  line("");
}

const rank = scoreRank(state.score);
line("");
line(`RESULT  ${state.score}  ${rank.tier} — ${rank.title}`);
line(`tracks  ${tracks(state)}`);
line(`fleet   ${state.dice.map((d) => `${d.name} d${d.sides} (${d.faces.filter((f) => f.forged).length} forged)`).join(" · ")}`);
line(`history ${state.roundHistory.map((h) => `R${h.round}:${h.scored}`).join("  ")}`);
