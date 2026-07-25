import test from "node:test";
import assert from "node:assert/strict";
import {
  ECONOMY, FAMILIES, SIZES,
  assignStress, buyCost, createLoadout, createShip, deployUpkeep,
  factoryFace, findFormations, makeRng, resolveFleetIntent, resolveVolley,
  repairFromSurplus, rollFleet, runTier, scoreRound, shipFaces, sizeUpCost, structureOf
} from "../fleet-engine.js";

// ── The balance identity the whole design rests on ─────────────────────────

test("attack and defense averages are exactly equal on every die size", () => {
  for (const size of SIZES) {
    const faces = [];
    for (let n = 1; n <= size; n++) faces.push(factoryFace(size, "interceptor", n));
    const atk = faces.filter((f) => f.symbol === "laser");
    const def = faces.filter((f) => f.symbol === "shield");
    const avg = (a) => a.reduce((x, f) => x + f.n, 0) / a.length;
    assert.equal(avg(atk), avg(def), `d${size} attack/defense average mismatch`);
    assert.equal(avg(atk), (size + 2) / 2);
  }
});

test("face 1 is Wild on every die and carries the richest Energy", () => {
  for (const size of SIZES) {
    const one = factoryFace(size, "interceptor", 1);
    assert.equal(one.symbol, "wild");
    const all = [];
    for (let n = 1; n <= size; n++) all.push(factoryFace(size, "interceptor", n));
    assert.equal(one.energy, Math.max(...all.map((f) => f.energy)));
  }
});

test("Energy sits on the bottom half and descends", () => {
  const faces = [];
  for (let n = 1; n <= 10; n++) faces.push(factoryFace(10, "interceptor", n));
  assert.deepEqual(faces.map((f) => f.energy), [5, 4, 3, 2, 1, 0, 0, 0, 0, 0]);
});

test("Reactor family extends the Energy ramp one face higher", () => {
  const plain = factoryFace(8, "interceptor", 5);
  const reactor = factoryFace(8, "reactor", 5);
  assert.equal(plain.energy, 0);
  assert.ok(reactor.energy > 0);
});

test("families change symbols but never numbers", () => {
  for (const fam of Object.keys(FAMILIES)) {
    for (let n = 1; n <= 8; n++) assert.equal(factoryFace(8, fam, n).n, n);
  }
  assert.equal(factoryFace(8, "lancer", 3).symbol, "missile");
  assert.equal(factoryFace(8, "bulwark", 4).symbol, "flak");
});

// ── Ships and upgrades ─────────────────────────────────────────────────────

test("re-symboling overrides a face and marks it upgraded", () => {
  const ship = createShip("s1", "interceptor", 6);
  ship.overrides[4] = "laser";
  const faces = shipFaces(ship);
  assert.equal(faces[3].symbol, "laser");
  assert.equal(faces[3].upgraded, true);
  assert.equal(faces[2].upgraded, false);
});

test("upgrades survive a Size Up", () => {
  const ship = createShip("s1", "interceptor", 4);
  ship.overrides[2] = "missile";
  ship.size = 6;
  assert.equal(shipFaces(ship)[1].symbol, "missile");
  assert.equal(shipFaces(ship).length, 6);
});

test("structure rises with hull size", () => {
  assert.ok(structureOf(createShip("a", "interceptor", 4)) <
            structureOf(createShip("b", "interceptor", 10)));
});

// ── Formations ─────────────────────────────────────────────────────────────

const die = (n, symbol, size = 10, id = `d${n}${symbol}`) => ({ shipId: id, n, symbol, size, energy: 0 });

test("a Triad needs three of a number", () => {
  const f = findFormations([die(4, "laser"), die(4, "shield"), die(4, "laser"), die(7, "shield")]);
  const triad = f.find((x) => x.type === "triad");
  assert.ok(triad);
  assert.equal(triad.number, 4);
  assert.equal(triad.size, 3);
});

test("a Run yields the sum of its numbers", () => {
  const f = findFormations([die(3, "laser"), die(4, "shield"), die(5, "laser"), die(9, "shield")]);
  const run = f.find((x) => x.type === "run");
  assert.ok(run);
  assert.equal(run.yield, 12);      // 3+4+5
  assert.equal(run.tier, 2);        // top of 5 -> tier II
});

test("run tiers gate on the highest number", () => {
  assert.equal(runTier(4), 1);
  assert.equal(runTier(6), 2);
  assert.equal(runTier(8), 3);
  assert.equal(runTier(10), 4);
});

test("a Wild fills a Run gap only up to what its own die could roll", () => {
  // d4 wild cannot become an 8
  const small = findFormations([die(7, "laser"), die(9, "laser"), { shipId: "w", n: 1, symbol: "wild", size: 4, energy: 2 }]);
  assert.equal(small.find((x) => x.type === "run"), undefined);

  // a d10 wild can
  const big = findFormations([die(7, "laser"), die(9, "laser"), { shipId: "w", n: 1, symbol: "wild", size: 10, energy: 5 }]);
  const run = big.find((x) => x.type === "run");
  assert.ok(run, "d10 wild should bridge 7-8-9");
  assert.equal(run.size, 3);
  assert.equal(run.top, 9);
});

test("a d4-only fleet can never reach a Run of five", () => {
  const rng = makeRng(12345);
  const ships = Array.from({ length: 8 }, (_, i) => createShip(`s${i}`, "interceptor", 4));
  for (let t = 0; t < 2000; t++) {
    const runs = findFormations(rollFleet(ships, rng)).filter((f) => f.type === "run");
    for (const r of runs) assert.ok(r.size < 5, "d4 fleet produced a Run of 5+");
  }
});

test("each die belongs to at most one Formation", () => {
  const rng = makeRng(99);
  const ships = Array.from({ length: 8 }, (_, i) => createShip(`s${i}`, "interceptor", i < 4 ? 4 : 10));
  for (let t = 0; t < 500; t++) {
    const dice = rollFleet(ships, rng);
    const formations = findFormations(dice);
    const seen = new Set();
    for (const f of formations) {
      for (const m of f.members) {
        assert.ok(!seen.has(m), "a die appeared in two Formations");
        seen.add(m);
      }
    }
    assert.ok(formations.length <= Math.floor(dice.length / 3));
  }
});

test("nine dice yield at most three Formations", () => {
  const dice = [
    die(2, "laser"), die(2, "laser"), die(2, "laser"),
    die(5, "shield"), die(5, "shield"), die(5, "shield"),
    die(8, "flak"), die(8, "flak"), die(8, "flak")
  ];
  assert.ok(findFormations(dice).length <= 3);
});

// ── Protocols ──────────────────────────────────────────────────────────────

test("the same Run produces different results under different Protocols", () => {
  const dice = [die(3, "laser"), die(4, "shield"), die(5, "laser")];
  const formations = findFormations(dice);

  const broadside = resolveFleetIntent(dice, formations, createLoadout("resonance", "broadside"));
  const aegis     = resolveFleetIntent(dice, formations, createLoadout("resonance", "aegis"));
  const wright    = resolveFleetIntent(dice, formations, createLoadout("resonance", "shipwright"));

  assert.ok(broadside.totals.laser > aegis.totals.laser);
  assert.ok(aegis.totals.shield > broadside.totals.shield);
  assert.ok(wright.energy > broadside.energy);
});

test("Fire Control arms Scar, then Stun, then Breach on a Quad", () => {
  const triad = [die(6, "laser"), die(6, "shield"), die(6, "laser")];
  const quad = [...triad, die(6, "flak")];

  const l1 = createLoadout("fireControl"); l1.set.level = 1;
  const l2 = createLoadout("fireControl"); l2.set.level = 2;
  const l3 = createLoadout("fireControl"); l3.set.level = 3;

  assert.equal(resolveFleetIntent(triad, findFormations(triad), l1).strike.mode, "scar");
  assert.equal(resolveFleetIntent(triad, findFormations(triad), l2).strike.mode, "stun");
  assert.equal(resolveFleetIntent(quad, findFormations(quad), l3).strike.mode, "breach");
});

test("a Breach still needs four of a kind, not three", () => {
  const triad = [die(6, "laser"), die(6, "shield"), die(6, "laser")];
  const l3 = createLoadout("fireControl"); l3.set.level = 3;
  assert.notEqual(resolveFleetIntent(triad, findFormations(triad), l3).strike.mode, "breach");
});

// ── Combat ─────────────────────────────────────────────────────────────────

const intent = (over = {}) => ({
  totals: { laser: 0, missile: 0, shield: 0, flak: 0, ...(over.totals || {}) },
  flags: { pierceLaser: false, pierceMissile: false, shieldsBlockMissiles: false, ...(over.flags || {}) },
  strike: over.strike ?? null,
  hasKillNet: over.hasKillNet ?? false,
  energy: 0, notes: []
});

test("Shields stop Lasers and Flak stops Missiles", () => {
  const a = intent({ totals: { laser: 7, missile: 4 } });
  const b = intent({ totals: { shield: 5, flak: 6 } });
  const r = resolveVolley(a, b);
  assert.equal(r.a.laser, 2);
  assert.equal(r.a.missile, 0);
  assert.equal(r.a.damage, 2);
});

test("cancellation is simultaneous and never cascades", () => {
  const a = intent({ totals: { laser: 6, shield: 3 } });
  const b = intent({ totals: { laser: 4, shield: 2 } });
  const r = resolveVolley(a, b);
  assert.equal(r.a.damage, 4);   // 6 - 2
  assert.equal(r.b.damage, 1);   // 4 - 3, not recomputed after a's shields are spent
});

test("piercing ignores the matching defense entirely", () => {
  const a = intent({ totals: { laser: 5 }, flags: { pierceLaser: true } });
  const b = intent({ totals: { shield: 99 } });
  assert.equal(resolveVolley(a, b).a.damage, 5);
});

test("Kill Net cancels an incoming Precision Strike", () => {
  const a = intent({ strike: { mode: "breach", power: 8 } });
  const b = intent({ hasKillNet: true });
  assert.equal(resolveVolley(a, b).a.strike.cancelled, true);
  assert.equal(resolveVolley(a, intent()).a.strike.cancelled, false);
});

test("surplus defense converts to Energy, capped", () => {
  const a = intent({ totals: { shield: 20, flak: 20 } });
  const r = resolveVolley(a, intent());
  assert.equal(r.a.surplusEnergy, ECONOMY.surplusCap);
});

// ── Stress ─────────────────────────────────────────────────────────────────

test("Stress follows the priority order and disables at Structure", () => {
  const ships = [createShip("a", "interceptor", 4), createShip("b", "interceptor", 10)];
  const { overflow } = assignStress(ships, 3, ["a", "b"]);
  assert.equal(ships[0].disabled, true);          // d4 structure 2
  assert.equal(ships[0].stress, 2);
  assert.equal(ships[1].stress, 1);
  assert.equal(overflow, 0);
});

test("a disabled ship stops rolling", () => {
  const ships = [createShip("a", "interceptor", 4), createShip("b", "interceptor", 6)];
  ships[0].disabled = true;
  assert.equal(rollFleet(ships, makeRng(7)).length, 1);
});

// ── Economy ────────────────────────────────────────────────────────────────

test("the buy ladder escalates and stops at eight bays", () => {
  assert.ok(buyCost(3) < buyCost(5));
  assert.ok(buyCost(5) < buyCost(7));
  assert.ok(buyCost(ECONOMY.maxShips) > 50);
});

test("deploying past five ships costs upkeep", () => {
  assert.equal(deployUpkeep(5), 0);
  assert.equal(deployUpkeep(8), 3);
});

test("Size Up costs rise with the hull", () => {
  const a = sizeUpCost(createShip("a", "interceptor", 4));
  const b = sizeUpCost(createShip("b", "interceptor", 8));
  assert.equal(a.next, 6);
  assert.equal(b.next, 10);
  assert.ok(b.cost > a.cost);
  assert.equal(sizeUpCost(createShip("c", "interceptor", 10)), null);
});

test("damage and prevention are paid at the same rate", () => {
  const dealt = scoreRound({ damage: 8, prevented: 0, formations: [], strike: null });
  const blocked = scoreRound({ damage: 0, prevented: 8, formations: [], strike: null });
  assert.equal(dealt, blocked, "blocking must be worth as much as hitting");
});

test("scoring rewards damage, prevention, Formations and strikes", () => {
  const base = scoreRound({ damage: 5, prevented: 2, formations: [], strike: null });
  assert.equal(base, 14);
  const withBreach = scoreRound({ damage: 5, prevented: 2, formations: [], strike: { mode: "breach", cancelled: false } });
  assert.equal(withBreach, 39);
  const cancelled = scoreRound({ damage: 5, prevented: 2, formations: [], strike: { mode: "breach", cancelled: true } });
  assert.equal(cancelled, 14);
  const surplus = scoreRound({ damage: 5, prevented: 2, formations: [], strike: null, surplus: 6 });
  assert.equal(surplus, 17, "unused defense should still count");
});

test("prevention is symmetric — blocking everything is maximum credit, not zero", () => {
  // Regression: an earlier build zeroed side A's prevention exactly when the
  // enemy volley was fully stopped, and only on one side, which quietly handed
  // the whole match to whoever was seated second.
  const attacker = intent({ totals: { laser: 9 } });
  const wall = intent({ totals: { shield: 20 } });
  const r = resolveVolley(attacker, wall);
  assert.equal(r.a.damage, 0);
  assert.equal(r.b.prevented, 9, "the wall stopped all nine");

  const flipped = resolveVolley(wall, attacker);
  assert.equal(flipped.a.prevented, 9, "same result from the other seat");
});

test("surplus defense repairs the fleet", () => {
  const ships = [createShip("a", "interceptor", 10)];
  ships[0].stress = 4;
  repairFromSurplus(ships, 9);
  assert.equal(ships[0].stress, 1);
});

test("rolls are deterministic for a given seed", () => {
  const ships = [createShip("a", "interceptor", 10), createShip("b", "lancer", 6)];
  const one = rollFleet(ships, makeRng(4242)).map((d) => d.n);
  const two = rollFleet(ships, makeRng(4242)).map((d) => d.n);
  assert.deepEqual(one, two);
});

test("a full fleet always rolls within its geometry", () => {
  const rng = makeRng(2026);
  const ships = SIZES.map((s, i) => createShip(`s${i}`, "interceptor", s));
  for (let t = 0; t < 3000; t++) {
    for (const d of rollFleet(ships, rng)) {
      assert.ok(d.n >= 1 && d.n <= d.size);
    }
  }
});
