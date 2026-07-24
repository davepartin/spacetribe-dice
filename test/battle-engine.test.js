import test from "node:test";
import assert from "node:assert/strict";
import {
  BATTLE_PACKET_VERSION,
  aggregateTeamPackets,
  assignStress,
  deriveFleetTactics,
  resolveCombatTotals,
  resolveLockedBattle,
  validateLockedFleetPacket
} from "../battle-engine.js";

function packet({
  matchId = "match-1",
  round = 1,
  playerId,
  teamId,
  activeDice = 4,
  totals = {},
  counts = {}
}) {
  return {
    version: BATTLE_PACKET_VERSION,
    matchId,
    round,
    playerId,
    teamId,
    locked: true,
    activeDice,
    totals: {
      laser: totals.laser ?? 0,
      rocket: totals.rocket ?? 0,
      shield: totals.shield ?? 0,
      speed: totals.speed ?? 0
    },
    counts: {
      laser: counts.laser ?? 0,
      rocket: counts.rocket ?? 0,
      shield: counts.shield ?? 0,
      speed: counts.speed ?? 0,
      void: counts.void ?? 0
    }
  };
}

test("the four counters resolve simultaneously", () => {
  const result = resolveCombatTotals(
    { laser: 4, rocket: 1, shield: 2, speed: 0 },
    { laser: 1, rocket: 3, shield: 2, speed: 2 }
  );

  assert.deepEqual(result.first, {
    remaining: { laser: 2, rocket: 0, shield: 0, speed: 0 },
    hits: 2,
    tacticalEdge: 0
  });
  assert.deepEqual(result.second, {
    remaining: { laser: 0, rocket: 3, shield: 1, speed: 0 },
    hits: 3,
    tacticalEdge: 1
  });
});

test("cancellation never cascades within a volley", () => {
  const result = resolveCombatTotals(
    { laser: 3, rocket: 4, shield: 0, speed: 0 },
    { laser: 0, rocket: 0, shield: 3, speed: 4 }
  );

  assert.deepEqual(result.first.remaining, { laser: 0, rocket: 0, shield: 0, speed: 0 });
  assert.deepEqual(result.second.remaining, { laser: 0, rocket: 0, shield: 0, speed: 1 });
  assert.equal(result.first.hits, 0);
  assert.equal(result.second.hits, 0);
});

test("locked fleet packets reject malformed or mutable orders", () => {
  const valid = packet({ playerId: "pilot-a", teamId: "alliance" });
  assert.deepEqual(validateLockedFleetPacket(valid), { ok: true, errors: [] });

  const unlocked = { ...valid, locked: false };
  const badTotal = { ...valid, totals: { ...valid.totals, laser: -1 } };
  const overcounted = {
    ...valid,
    activeDice: 2,
    counts: { laser: 1, rocket: 1, shield: 1, speed: 0, void: 0 }
  };

  assert.equal(validateLockedFleetPacket(unlocked).ok, false);
  assert.ok(validateLockedFleetPacket(unlocked).errors.includes("Fleet packet must be locked"));
  assert.equal(validateLockedFleetPacket(badTotal).ok, false);
  assert.equal(validateLockedFleetPacket(overcounted).ok, false);
});

test("fleet tactics reward every combat specialty and a clean bay", () => {
  const fleet = packet({
    playerId: "pilot-a",
    teamId: "alliance",
    activeDice: 12,
    totals: { laser: 3, rocket: 3, shield: 3, speed: 3 },
    counts: { laser: 3, rocket: 3, shield: 3, speed: 3, void: 0 }
  });

  const result = deriveFleetTactics(fleet);
  assert.deepEqual(result.totals, { laser: 5, rocket: 5, shield: 5, speed: 5 });
  assert.deepEqual(result.effects, {
    speedSuppression: 1,
    stressWard: 1,
    nextRoundFreeRerolls: 1,
    objectivePoints: 1,
    credits: 1
  });
  assert.deepEqual(result.tactics, [
    "target-lock",
    "salvo",
    "bulwark",
    "flanking",
    "combined-arms:laser",
    "clean-bay"
  ]);
});

test("2v2 packets aggregate by team before one shared resolution", () => {
  const packets = [
    packet({
      playerId: "a-laser",
      teamId: "alliance",
      activeDice: 1,
      totals: { laser: 4 },
      counts: { laser: 1 }
    }),
    packet({
      playerId: "a-rocket",
      teamId: "alliance",
      activeDice: 1,
      totals: { rocket: 3 },
      counts: { rocket: 1 }
    }),
    packet({
      playerId: "b-shield",
      teamId: "collective",
      activeDice: 1,
      totals: { shield: 2 },
      counts: { shield: 1 }
    }),
    packet({
      playerId: "b-speed",
      teamId: "collective",
      activeDice: 1,
      totals: { speed: 1 },
      counts: { speed: 1 }
    })
  ];
  const snapshot = structuredClone(packets);

  const battle = resolveLockedBattle(packets);
  assert.deepEqual(packets, snapshot);
  assert.deepEqual(battle.teamOrder, ["alliance", "collective"]);
  assert.deepEqual(battle.teams.alliance.rawTotals, { laser: 4, rocket: 3, shield: 0, speed: 0 });
  assert.deepEqual(battle.teams.collective.rawTotals, { laser: 0, rocket: 0, shield: 2, speed: 1 });
  assert.equal(battle.teams.alliance.hits, 7);
  assert.equal(battle.teams.collective.hits, 0);
  assert.equal(battle.teams.alliance.effects.credits, 2);
  assert.equal(battle.teams.collective.effects.credits, 2);
  assert.equal(battle.winnerTeamId, "alliance");
});

test("Bulwark reduces assigned Stress without erasing scored Hits", () => {
  const battle = resolveLockedBattle([
    packet({
      playerId: "defender",
      teamId: "alliance",
      activeDice: 3,
      totals: { shield: 3 },
      counts: { shield: 3 }
    }),
    packet({
      playerId: "attacker",
      teamId: "collective",
      activeDice: 1,
      totals: { rocket: 4 },
      counts: { rocket: 1 }
    })
  ]);

  assert.equal(battle.teams.collective.hits, 6);
  assert.equal(battle.teams.alliance.incomingHits, 6);
  assert.equal(battle.teams.alliance.effects.stressWard, 1);
  assert.equal(battle.teams.alliance.stressToAssign, 5);
});

test("Target Lock applies its extra Speed suppression after team aggregation", () => {
  const battle = resolveLockedBattle([
    packet({
      playerId: "interceptor",
      teamId: "alliance",
      activeDice: 1,
      totals: { laser: 3 },
      counts: { laser: 1 }
    }),
    packet({
      playerId: "runner",
      teamId: "collective",
      activeDice: 1,
      totals: { speed: 6 },
      counts: { speed: 1 }
    })
  ]);

  assert.equal(battle.teams.alliance.totals.laser, 4);
  assert.equal(battle.teams.alliance.effects.speedSuppression, 1);
  assert.equal(battle.teams.collective.remaining.speed, 3);
});

test("Stress follows the locked damage order without mutating ships", () => {
  const ships = [
    { id: "core", structure: 3, stress: 1 },
    { id: "escort", structure: 1, stress: 0 }
  ];
  const snapshot = structuredClone(ships);
  const result = assignStress(ships, 5, ["escort", "core"]);

  assert.deepEqual(ships, snapshot);
  assert.deepEqual(result.ships, [
    { id: "core", structure: 3, stress: 3 },
    { id: "escort", structure: 1, stress: 1 }
  ]);
  assert.equal(result.appliedStress, 3);
  assert.equal(result.unassignedStress, 2);
  assert.deepEqual(result.thresholdShipIds, ["core", "escort"]);
});

test("a battle requires two compatible teams and one packet per player", () => {
  const alliance = packet({ playerId: "pilot-a", teamId: "alliance" });
  const sameTeam = packet({ playerId: "pilot-b", teamId: "alliance" });
  const duplicatePlayer = packet({ playerId: "pilot-a", teamId: "collective" });
  const otherMatch = packet({ matchId: "match-2", playerId: "pilot-b", teamId: "collective" });

  assert.throws(() => aggregateTeamPackets([alliance, sameTeam]), /exactly two teams/);
  assert.throws(() => aggregateTeamPackets([alliance, duplicatePlayer]), /Duplicate playerId/);
  assert.throws(() => aggregateTeamPackets([alliance, otherMatch]), /share a matchId/);
});
