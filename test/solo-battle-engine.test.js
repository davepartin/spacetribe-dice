import test from "node:test";
import assert from "node:assert/strict";
import {
  BATTLE_SHIP_BLUEPRINTS,
  SOLO_THREAT_SCHEDULE,
  createPrototypeShip,
  createThreatFleet
} from "../battle-content.js";
import {
  PROTOTYPE_STRATEGIES,
  buildStrategyFleet,
  createSeededRandom,
  rollPrototypeFleet,
  runSoloPrototype
} from "../solo-battle-engine.js";

test("prototype face maps cover every polyhedral ship size", () => {
  for (const blueprint of Object.values(BATTLE_SHIP_BLUEPRINTS)) {
    assert.equal(blueprint.faces.length, 20);
    for (const face of blueprint.faces) {
      assert.ok(Number.isSafeInteger(face.value) && face.value >= 0);
      assert.ok(Number.isSafeInteger(face.charge) && face.charge >= 0);
      assert.ok(Number.isSafeInteger(face.fallback) && face.fallback >= 0);
      assert.ok(face.fallback <= face.value);
    }
  }
});

test("the solo threat schedule has ten increasingly complex legal fleets", () => {
  assert.equal(SOLO_THREAT_SCHEDULE.length, 10);
  assert.deepEqual(SOLO_THREAT_SCHEDULE.map((threat) => threat.round), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(SOLO_THREAT_SCHEDULE.at(-1).id, "apogee-flagship");
  for (const threat of SOLO_THREAT_SCHEDULE) {
    const fleet = createThreatFleet(threat);
    assert.equal(fleet.length, threat.fleet.length);
    assert.ok(fleet.every((ship) => ship.faces.length === ship.sides));
  }
});

test("every strategy stays inside six bays and twelve Command", () => {
  for (const strategyId of Object.keys(PROTOTYPE_STRATEGIES)) {
    for (let round = 1; round <= 10; round += 1) {
      const fleet = buildStrategyFleet(strategyId, round);
      assert.ok(fleet.length <= 6);
      assert.ok(fleet.reduce((total, ship) => total + ship.command, 0) <= 12);
    }
  }
  assert.equal(buildStrategyFleet("swarm", 10).length, 6);
  assert.equal(buildStrategyFleet("swarm", 10).reduce((total, ship) => total + ship.command, 0), 12);
  assert.equal(buildStrategyFleet("capital", 10).find((ship) => ship.id === "core").sides, 20);
});

test("prototype Forge actions strengthen ordinary faces and persist through Size Up", () => {
  const fleet = buildStrategyFleet("forge", 10);
  const engineer = fleet.find((ship) => ship.id === "engineer");
  assert.equal(engineer.sides, 6);
  assert.deepEqual(engineer.faces[3], {
    symbol: "shield",
    value: 1,
    charge: 0,
    fallback: 1,
    forged: true
  });
  assert.deepEqual(engineer.faces[2], {
    symbol: "rocket",
    value: 3,
    charge: 0,
    fallback: 3,
    forged: true
  });
});

test("seeded prototype rolls are reproducible", () => {
  const ships = [
    createPrototypeShip("core", 8, "core"),
    createPrototypeShip("interceptor", 6, "interceptor")
  ];
  const first = rollPrototypeFleet({ ships, random: createSeededRandom(42), energy: 2 });
  const second = rollPrototypeFleet({ ships, random: createSeededRandom(42), energy: 2 });
  assert.deepEqual(first, second);
});

test("charged faces fall back when Energy is unavailable", () => {
  const ship = createPrototypeShip("core", 10, "core");
  const unpowered = rollPrototypeFleet({
    ships: [ship],
    random: () => 0.81,
    energy: 0
  });
  const powered = rollPrototypeFleet({
    ships: [ship],
    random: () => 0.81,
    energy: 1
  });

  assert.deepEqual(unpowered.totals, { laser: 0, rocket: 0, shield: 1, speed: 0 });
  assert.equal(unpowered.rolls[0].powered, false);
  assert.deepEqual(powered.totals, { laser: 0, rocket: 0, shield: 3, speed: 0 });
  assert.equal(powered.rolls[0].powered, true);
  assert.equal(powered.energySpent, 1);
});

test("Wilds follow fleet doctrine and rerolls preserve charge reserves", () => {
  const wildShip = createPrototypeShip("core", 8, "core");
  const wild = rollPrototypeFleet({
    ships: [wildShip],
    random: () => 0.8,
    energy: 0,
    wildPriority: ["speed", "laser", "rocket", "shield"]
  });
  assert.deepEqual(wild.totals, { laser: 0, rocket: 0, shield: 0, speed: 2 });
  assert.equal(wild.counts.speed, 1);

  const interceptor = createPrototypeShip("interceptor", 4, "interceptor");
  const values = [0.99, 0];
  const rerolled = rollPrototypeFleet({
    ships: [interceptor],
    random: () => values.shift(),
    energy: 2,
    rerolls: 2,
    reserveEnergy: 1,
    rerollPriority: ["void"]
  });
  assert.equal(rerolled.rerollsUsed, 1);
  assert.equal(rerolled.energyRemaining, 1);
  assert.equal(rerolled.rolls[0].rerolled, true);
  assert.equal(rerolled.totals.laser, 1);
});

test("a prototype run is deterministic and resolves exactly ten battles", () => {
  const first = runSoloPrototype("balanced", 1234);
  const second = runSoloPrototype("balanced", 1234);
  assert.deepEqual(first, second);
  assert.equal(first.history.length, 10);
  assert.equal(first.history.at(-1).threatId, "apogee-flagship");
  assert.ok(first.score > 0);
  assert.ok(first.actionsCompleted > 0);
  assert.ok(first.history.some((round) => round.workshop.status === "completed"));
  assert.ok(first.history.every((round) => round.playerBattle && round.enemyBattle));
});

test("Reactor investment grants recurring Energy, rerolls, and an Apogee discharge", () => {
  const run = runSoloPrototype("reactor", 4321);
  assert.ok(run.tracks.reactor >= 2);
  assert.ok(run.history.some((round) => round.playerRoll.rerollsUsed > 0));
  assert.equal(run.history.at(-1).apogeeEnergyBonus, run.energy);
  assert.ok(run.history.at(-1).apogeeEnergyBonus > 0);
});
