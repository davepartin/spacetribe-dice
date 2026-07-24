import test from "node:test";
import assert from "node:assert/strict";
import { createPrototypeShip } from "../battle-content.js";
import {
  GAME_VERSION,
  MAX_COMMAND,
  advanceAfterReveal,
  buyShip,
  commandUsed,
  createInitialState,
  currentThreat,
  deploymentPreview,
  forgeFace,
  hydrateFleetState,
  launchOrders,
  lockOrders,
  previewOrders,
  repairShip,
  scoreRank,
  setOrder,
  toggleDeployment,
  togglePower,
  upsizeShip
} from "../fleet-game-engine.js";

function runShip(family, sides, id) {
  return {
    ...createPrototypeShip(family, sides, id),
    stress: 0,
    deployed: true,
    disabledRound: 0
  };
}

test("a battle run starts in the round-one workshop with one shared fleet", () => {
  const state = createInitialState("Nova", 1234);
  assert.equal(state.version, GAME_VERSION);
  assert.equal(state.scoreVersion, 2);
  assert.equal(state.phase, "workshop");
  assert.equal(state.round, 1);
  assert.equal(state.workshopActionTaken, true);
  assert.deepEqual(state.resources, { energy: 2, credits: 4 });
  assert.deepEqual(state.ships.map((ship) => [ship.family, ship.sides]), [
    ["core", 6],
    ["engineer", 4],
    ["interceptor", 4]
  ]);
  assert.equal(commandUsed(state), 6);
  assert.equal(currentThreat(state).id, "raider-scout");
});

test("orders are reproducible and the exact enemy roll stays hidden until lock", () => {
  const first = createInitialState("Nova", 77);
  const second = createInitialState("Nova", 77);
  assert.equal(launchOrders(first).ok, true);
  assert.equal(launchOrders(second).ok, true);
  assert.deepEqual(first.rolls, second.rolls);
  assert.equal(first.lastRound, null);
  assert.equal(lockOrders(first).ok, true);
  assert.ok(first.lastRound.enemyRoll);
  assert.equal(first.phase, "reveal");
});

test("a complete playable run resolves exactly ten enemy battles", () => {
  const state = createInitialState("Nova", 98765);
  while (state.phase !== "complete") {
    if (state.phase === "workshop") {
      state.resources.energy = 12;
      for (const ship of state.ships) {
        while (ship.stress >= ship.structure && state.resources.energy > 0) {
          assert.equal(repairShip(state, ship.id).ok, true);
        }
      }
      assert.equal(launchOrders(state).ok, true);
    } else if (state.phase === "rolling") {
      assert.equal(lockOrders(state).ok, true);
    } else if (state.phase === "reveal") {
      assert.equal(advanceAfterReveal(state).ok, true);
    }
  }
  assert.equal(state.round, 10);
  assert.equal(state.roundHistory.length, 10);
  assert.equal(state.roundHistory.at(-1).threat.id, "apogee-flagship");
  assert.ok(state.score > 0);
});

test("one major workshop action is allowed per round", () => {
  const state = createInitialState("Nova", 1);
  state.workshopActionTaken = false;
  state.resources.credits = 20;
  assert.equal(buyShip(state, "bulwark").ok, true);
  assert.equal(state.ships.length, 4);
  assert.equal(buyShip(state, "siege").ok, false);
  assert.equal(commandUsed(state), 8);
});

test("Forge strengthens an ordinary face, repairs Void, and survives Size Up", () => {
  const state = createInitialState("Nova", 2);
  const engineer = state.ships.find((ship) => ship.family === "engineer");
  state.workshopActionTaken = false;
  state.resources = { credits: 20, energy: 20 };
  assert.equal(forgeFace(state, engineer.id, 3, "shield").ok, true);
  assert.equal(engineer.structure, 2);
  assert.equal(engineer.forgeReinforcement, 1);
  assert.deepEqual(engineer.forgeSystem, { symbol: "shield", value: 1, charge: 1 });
  assert.deepEqual(engineer.faces[3], {
    symbol: "shield",
    value: 1,
    charge: 0,
    fallback: 1,
    forged: true
  });
  state.workshopActionTaken = false;
  assert.equal(upsizeShip(state, engineer.id).ok, true);
  assert.equal(engineer.sides, 6);
  assert.equal(engineer.structure, 3);
  assert.deepEqual(engineer.forgeSystem, { symbol: "shield", value: 1, charge: 1 });
  assert.equal(engineer.faces[3].symbol, "shield");
  assert.equal(engineer.faces[3].forged, true);

  state.workshopActionTaken = false;
  assert.equal(forgeFace(state, engineer.id, 0, "shield").ok, true);
  assert.deepEqual(engineer.faces[0], {
    symbol: "shield",
    value: 2,
    charge: 0,
    fallback: 2,
    forged: true
  });
  assert.equal(engineer.structure, 3);
  assert.equal(launchOrders(state).ok, true);
  const preview = previewOrders(state);
  assert.deepEqual(preview.systems.find((system) => system.kind === "forge" && system.shipId === engineer.id), {
    shipId: engineer.id,
    kind: "forge",
    symbol: "shield",
    value: 1,
    powered: true
  });
  assert.ok(preview.rawTotals.shield >= 1);
});

test("powered faces and installed systems remain explicit Energy choices", () => {
  const state = createInitialState("Nova", 3);
  state.ships = [runShip("core", 10, "capital")];
  state.resources.energy = 2;
  assert.equal(launchOrders(state).ok, true);
  state.rolls.capital = {
    index: 8,
    symbol: "shield",
    value: 3,
    charge: 1,
    fallback: 1,
    forged: false,
    wildChoice: null
  };
  state.powerSelections = [];
  assert.equal(previewOrders(state).rawTotals.shield, 1);
  assert.equal(togglePower(state, "face:capital").ok, true);
  assert.equal(previewOrders(state).rawTotals.shield, 3);
  assert.equal(togglePower(state, "system:capital").ok, true);
  assert.equal(previewOrders(state).rawTotals.laser, 2);
});

test("fifth and sixth deployed ships require Energy upkeep", () => {
  const state = createInitialState("Nova", 4);
  state.ships.push(runShip("siege", 4, "siege-extra"));
  state.ships.push(runShip("bulwark", 4, "bulwark-extra"));
  state.resources.energy = 1;
  assert.equal(commandUsed(state), 10);
  assert.deepEqual(deploymentPreview(state), {
    active: state.ships,
    disabled: [],
    upkeep: 1,
    canLaunch: true
  });
  state.ships.push(runShip("interceptor", 4, "interceptor-extra"));
  assert.equal(commandUsed(state), MAX_COMMAND);
  assert.equal(deploymentPreview(state).upkeep, 2);
  assert.equal(deploymentPreview(state).canLaunch, false);
  assert.equal(toggleDeployment(state, "interceptor-extra").ok, true);
  assert.equal(deploymentPreview(state).upkeep, 1);
  assert.equal(deploymentPreview(state).canLaunch, true);
});

test("orders choose the flexible system output", () => {
  const state = createInitialState("Nova", 5);
  state.ships = [runShip("core", 8, "core-flex")];
  state.resources.energy = 1;
  assert.equal(setOrder(state, "maneuver").ok, true);
  assert.equal(launchOrders(state).ok, true);
  state.powerSelections = ["system:core-flex"];
  assert.equal(previewOrders(state).rawTotals.speed >= 2, true);
});

test("battle ranks match production-engine score distributions", () => {
  assert.equal(scoreRank(94).tier, "D");
  assert.equal(scoreRank(95).tier, "C");
  assert.equal(scoreRank(125).tier, "B");
  assert.equal(scoreRank(150).tier, "A");
  assert.equal(scoreRank(180).tier, "S");
});

test("older version-2 saves receive Forge reinforcement and an auxiliary", () => {
  const state = createInitialState("Nova", 21);
  const engineer = state.ships.find((ship) => ship.family === "engineer");
  engineer.faces[3] = { ...engineer.faces[3], symbol: "shield", value: 1, fallback: 1, forged: true };
  assert.equal(hydrateFleetState(state), state);
  assert.equal(engineer.structure, 2);
  assert.equal(engineer.forgeReinforcement, 1);
  assert.deepEqual(engineer.forgeSystem, { symbol: "shield", value: 1, charge: 1 });
  hydrateFleetState(state);
  assert.equal(engineer.structure, 2);
});
