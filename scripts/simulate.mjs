import {
  buyDie,
  buyTrack,
  commitRoll,
  createInitialState,
  cycleWild,
  forgeFace,
  nextRound,
  previewRoll,
  rerollSelected,
  shapingActionsLeft,
  toggleSelection,
  upgradeDie
} from "../game-engine.js";

const strategies = {
  steady: {
    wild: (round) => round < 4 ? "tech" : "attack",
    keep: (symbol) => symbol === "attack",
    workshop(state) {
      return firstSuccess([
        () => buyTrack(state, "arsenal"),
        () => forgeBest(state, "attack"),
        () => buyUnique(state, "assault"),
        () => growBest(state, ["assault", "core", "scout"]),
        () => buyTrack(state, "reactor")
      ]);
    }
  },
  engine: {
    wild: (round) => round < 7 ? "tech" : "attack",
    keep: (symbol, round) => round < 7 ? ["tech", "forge", "flux", "energy"].includes(symbol) : symbol === "attack",
    workshop(state) {
      return firstSuccess([
        () => buyUnique(state, "modifier"),
        () => buyUnique(state, "research"),
        () => buyTrack(state, "reactor"),
        () => buyTrack(state, "foundry"),
        () => growBest(state, ["modifier", "research", "core", "scout"]),
        () => forgeBest(state, state.round < 7 ? "tech" : "attack"),
        () => buyTrack(state, "arsenal")
      ]);
    }
  },
  balanced: {
    wild: (round) => round < 5 ? "tech" : "attack",
    keep: (symbol, round) => symbol === "attack" || (round < 6 && ["tech", "flux", "forge"].includes(symbol)),
    workshop(state) {
      return firstSuccess([
        () => buyUnique(state, "modifier"),
        () => buyTrack(state, "arsenal"),
        () => forgeBest(state, "attack"),
        () => growBest(state, ["core", "scout", "modifier", "reactor"]),
        () => buyUnique(state, "assault"),
        () => buyTrack(state, "reactor"),
        () => buyTrack(state, "foundry")
      ]);
    }
  }
};

function resolved(roll) {
  return roll.symbol === "wild" ? roll.wildChoice : roll.symbol;
}

function setWild(state, dieId, target) {
  for (let count = 0; count < 5 && state.rolls[dieId]?.wildChoice !== target; count += 1) cycleWild(state, dieId);
}

function firstSuccess(actions) {
  for (const action of actions) {
    const result = action();
    if (result?.ok) return true;
  }
  return false;
}

function buyUnique(state, family) {
  if (state.dice.some((die) => die.family === family)) return { ok: false };
  return buyDie(state, family);
}

function forgeBest(state, symbol) {
  const ordered = [...state.dice].sort((a, b) => b.sides - a.sides);
  for (const die of ordered) {
    const result = forgeFace(state, die.id, symbol);
    if (result.ok) return result;
  }
  return { ok: false };
}

function growBest(state, familyOrder) {
  const ordered = [...state.dice].sort((a, b) => {
    const family = familyOrder.indexOf(a.family) - familyOrder.indexOf(b.family);
    return family || a.sides - b.sides;
  });
  for (const die of ordered) {
    const result = upgradeDie(state, die.id);
    if (result.ok) return result;
  }
  return { ok: false };
}

function play(seed, strategyName) {
  const strategy = strategies[strategyName];
  const state = createInitialState(strategyName, seed);
  while (state.phase !== "complete") {
    Object.entries(state.rolls).forEach(([id, roll]) => {
      if (roll.symbol === "wild") setWild(state, id, strategy.wild(state.round));
    });

    while (shapingActionsLeft(state) > 0) {
      const usingFree = (state.freeRerolls || 0) > 0;
      const energyBudget = usingFree ? 2 : state.resources.energy;
      if (!usingFree && energyBudget <= 0) break;
      const preview = previewRoll(state);
      if (preview.wing > 0 && preview.attackDice === 4 && state.round < 9) break;
      const candidates = Object.entries(state.rolls)
        .filter(([, roll]) => !strategy.keep(resolved(roll), state.round))
        .slice(0, Math.min(2, Math.max(1, energyBudget)));
      if (!candidates.length) break;
      candidates.forEach(([id]) => toggleSelection(state, id));
      if (!rerollSelected(state).ok) break;
      Object.entries(state.rolls).forEach(([id, roll]) => {
        if (roll.symbol === "wild") setWild(state, id, strategy.wild(state.round));
      });
    }

    commitRoll(state);
    if (state.phase === "workshop") {
      for (let actions = 0; actions < 8 && strategy.workshop(state); actions += 1) {
        // Spend in priority order until no preferred purchase remains affordable.
      }
      nextRound(state);
    }
  }
  return {
    score: state.score,
    dice: state.dice.length,
    tracks: state.tracks,
    sizes: state.dice.map((die) => die.sides),
    apogee: state.roundHistory.at(-1).scored
  };
}

const runs = Number.parseInt(process.argv[2] || "1000", 10);
for (const name of Object.keys(strategies)) {
  const results = Array.from({ length: runs }, (_, index) => play(index + 1, name));
  const scores = results.map((result) => result.score).sort((a, b) => a - b);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const percentile = (value) => scores[Math.min(scores.length - 1, Math.floor(scores.length * value))];
  const top = results.reduce((best, result) => result.score > best.score ? result : best, results[0]);
  console.log(JSON.stringify({
    strategy: name,
    runs,
    average: Math.round(average * 10) / 10,
    min: scores[0],
    p25: percentile(.25),
    median: percentile(.5),
    p75: percentile(.75),
    max: scores.at(-1),
    bestBuild: top
  }));
}
