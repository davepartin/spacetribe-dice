import test from "node:test";
import assert from "node:assert/strict";
import {
  buyDie,
  buyTrack,
  commitRoll,
  createDie,
  createInitialState,
  cycleWild,
  forgeFace,
  listResonances,
  nextRound,
  previewRoll,
  rerollSelected,
  rerollsAvailable,
  scoreRank,
  toggleSelection,
  trackCost,
  upgradeDie
} from "../game-engine.js";

test("a seed reproduces the same opening roll", () => {
  const first = createInitialState("Nova", 123456);
  const second = createInitialState("Nova", 123456);
  assert.deepEqual(first.rolls, second.rolls);
  assert.deepEqual(first.resources, { energy: 2, tech: 1, forge: 1, flux: 1 });
});

test("selected rerolls cost one energy per die and consume one reroll action", () => {
  const state = createInitialState("Nova", 11);
  state.resources.energy = 5;
  toggleSelection(state, "core-1");
  toggleSelection(state, "reactor-1");
  const beforeRng = state.rng;
  const result = rerollSelected(state);
  assert.equal(result.ok, true);
  assert.equal(state.resources.energy, 3);
  assert.equal(state.rerollsUsed, 1);
  assert.notEqual(state.rng, beforeRng);
  assert.deepEqual(state.selected, []);
});

test("wild faces cycle through all resource assignments", () => {
  const state = createInitialState("Nova", 22);
  state.rolls["core-1"] = { index: 5, symbol: "wild", value: 1, forged: false, wildChoice: "attack" };
  cycleWild(state, "core-1");
  assert.equal(state.rolls["core-1"].wildChoice, "energy");
  cycleWild(state, "core-1");
  assert.equal(state.rolls["core-1"].wildChoice, "tech");
});

test("forged faces persist when a die grows", () => {
  const state = createInitialState("Nova", 33);
  state.phase = "workshop";
  state.resources = { energy: 10, tech: 10, forge: 10, flux: 10 };
  const forgeResult = forgeFace(state, "reactor-1", "attack");
  assert.equal(forgeResult.ok, true);
  const forgedFace = state.dice.find((die) => die.id === "reactor-1").faces.find((face) => face.forged);
  assert.deepEqual(forgedFace, { symbol: "attack", value: 2, forged: true });
  const growResult = upgradeDie(state, "reactor-1");
  assert.equal(growResult.ok, true);
  const grown = state.dice.find((die) => die.id === "reactor-1");
  assert.equal(grown.sides, 6);
  assert.equal(grown.faces.length, 6);
  assert.equal(grown.faces.filter((face) => face.forged).length, 1);
});

test("reactor track adds reroll actions at levels two and four", () => {
  const state = createInitialState("Nova", 44);
  state.phase = "workshop";
  state.resources = { energy: 100, tech: 100, forge: 100, flux: 100 };
  assert.equal(rerollsAvailable(state), 1);
  assert.equal(buyTrack(state, "reactor").ok, true);
  assert.equal(rerollsAvailable(state), 1);
  assert.equal(buyTrack(state, "reactor").ok, true);
  assert.equal(rerollsAvailable(state), 2);
  assert.deepEqual(trackCost(state, "reactor"), { tech: 4, energy: 2 });
});

test("three attack dice trigger Formation and three families trigger Spectrum", () => {
  const state = createInitialState("Nova", 55);
  state.rolls = {
    "core-1": { symbol: "attack", value: 2 },
    "reactor-1": { symbol: "attack", value: 1 },
    "scout-1": { symbol: "attack", value: 1 }
  };
  const preview = previewRoll(state);
  assert.equal(preview.formation, 2);
  assert.equal(preview.spectrum, 3);
  assert.equal(preview.cleanBay, 1);
  assert.equal(preview.spectrumSalvage, 1);
  assert.equal(preview.totalAttack, 12); // base2 + faces4 + form2 + spec3 + clean1
  assert.ok(listResonances(preview).some((item) => item.id === "spectrum"));
});

test("Battalion rewards matching attack families and Wing grants free shaping", () => {
  const state = createInitialState("Nova", 56);
  state.dice.push(createDie("assault", 4, "assault-1"));
  state.dice.push(createDie("assault", 4, "assault-2"));
  state.phase = "rolling";
  state.rolls = {
    "core-1": { symbol: "energy", value: 1 },
    "reactor-1": { symbol: "energy", value: 1 },
    "scout-1": { symbol: "attack", value: 1 },
    "assault-1": { symbol: "attack", value: 2 },
    "assault-2": { symbol: "attack", value: 2 }
  };
  const preview = previewRoll(state);
  assert.equal(preview.attackDice, 3);
  assert.equal(preview.battalion, 1);
  assert.equal(preview.formation, 2);
  assert.equal(preview.wing, 0);

  state.rolls = {
    "core-1": { symbol: "energy", value: 1 },
    "reactor-1": { symbol: "wild", value: 1, forged: false, wildChoice: "tech" },
    "scout-1": { symbol: "attack", value: 1 },
    "assault-1": { symbol: "attack", value: 2 },
    "assault-2": { symbol: "attack", value: 2 }
  };
  state.shapeBonusGranted = false;
  state.freeRerolls = 0;
  cycleWild(state, "reactor-1"); // tech -> forge
  cycleWild(state, "reactor-1"); // forge -> flux
  cycleWild(state, "reactor-1"); // flux -> attack
  assert.equal(state.rolls["reactor-1"].wildChoice, "attack");
  assert.equal(state.freeRerolls, 1);
  assert.equal(state.shapeBonusGranted, true);
  const winged = previewRoll(state);
  assert.equal(winged.attackDice, 4);
  assert.equal(winged.wing, 2);
  assert.equal(winged.broadside, 0);
  assert.equal(winged.battalion, 1);

  state.resources.energy = 0;
  state.rerollsUsed = rerollsAvailable(state);
  toggleSelection(state, "scout-1");
  const freeResult = rerollSelected(state);
  assert.equal(freeResult.ok, true);
  assert.equal(freeResult.free, true);
  assert.equal(state.freeRerolls, 0);
});

test("Ion Chorus and Clean Bay pay out on bank", () => {
  const state = createInitialState("Nova", 57);
  state.dice.push(createDie("reactor", 4, "reactor-2"));
  state.rolls = {
    "core-1": { symbol: "energy", value: 1 },
    "reactor-1": { symbol: "energy", value: 2 },
    "scout-1": { symbol: "energy", value: 1 },
    "reactor-2": { symbol: "tech", value: 1 }
  };
  const preview = previewRoll(state);
  assert.equal(preview.cleanBay, 1);
  assert.equal(preview.resonanceGains.energy, 2); // Ion Chorus
  const beforeEnergy = state.resources.energy;
  assert.equal(commitRoll(state).ok, true);
  assert.equal(state.resources.energy, beforeEnergy + 4 + 2);
  assert.equal(state.lastRound.totalAttack, preview.totalAttack);
  assert.ok(preview.totalAttack >= preview.base + preview.cleanBay);
});

test("Spectrum grants an extra tech salvage before Apogee", () => {
  const state = createInitialState("Nova", 58);
  state.round = 3;
  state.rolls = {
    "core-1": { symbol: "attack", value: 1 },
    "reactor-1": { symbol: "attack", value: 1 },
    "scout-1": { symbol: "attack", value: 1 }
  };
  const beforeTech = state.resources.tech;
  commitRoll(state);
  // face tech 0 + command salvage 1 + spectrum salvage 1
  assert.equal(state.resources.tech, beforeTech + 2);
  assert.equal(state.lastRound.spectrumSalvage, 1);
});

test("the tenth round adds the Apogee conversion and completes the run", () => {
  const state = createInitialState("Nova", 66);
  state.round = 10;
  state.phase = "rolling";
  state.score = 90;
  state.resources = { energy: 6, tech: 4, forge: 2, flux: 1 };
  state.tracks = { arsenal: 2, reactor: 1, foundry: 0 };
  state.rolls = {
    "core-1": { symbol: "attack", value: 3 },
    "reactor-1": { symbol: "energy", value: 2 },
    "scout-1": { symbol: "tech", value: 2 }
  };
  const result = commitRoll(state);
  assert.equal(result.ok, true);
  assert.equal(state.phase, "complete");
  assert.ok(result.apogeeBonus > result.preview.totalAttack);
  assert.equal(state.score, 90 + result.scored);
});

test("a basic run advances through exactly ten scored rounds", () => {
  const state = createInitialState("Nova", 77);
  while (state.phase !== "complete") {
    assert.equal(commitRoll(state).ok, true);
    if (state.phase === "workshop") assert.equal(nextRound(state).ok, true);
  }
  assert.equal(state.round, 10);
  assert.equal(state.roundHistory.length, 10);
  assert.ok(state.score > 0);
});

test("market purchase spends resources and adds a specialized d4", () => {
  const state = createInitialState("Nova", 88);
  state.phase = "workshop";
  state.resources = { energy: 10, tech: 10, forge: 10, flux: 0 };
  const result = buyDie(state, "assault");
  assert.equal(result.ok, true);
  assert.equal(state.dice.length, 4);
  assert.equal(state.dice.at(-1).family, "assault");
  assert.equal(state.dice.at(-1).sides, 4);
  assert.deepEqual(state.resources, { energy: 8, tech: 7, forge: 10, flux: 0 });
});

test("score ranks have stable boundary values", () => {
  assert.equal(scoreRank(54).tier, "D");
  assert.equal(scoreRank(55).tier, "C");
  assert.equal(scoreRank(95).tier, "A");
  assert.equal(scoreRank(120).tier, "S");
});
