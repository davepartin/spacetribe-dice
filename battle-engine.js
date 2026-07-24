export const BATTLE_PACKET_VERSION = 1;

export const COMBAT_KEYS = Object.freeze(["laser", "rocket", "shield", "speed"]);

export const COUNTERED_BY = Object.freeze({
  laser: "shield",
  rocket: "speed",
  shield: "rocket",
  speed: "laser"
});

const COUNT_KEYS = Object.freeze([...COMBAT_KEYS, "void"]);
const EFFECT_KEYS = Object.freeze([
  "speedSuppression",
  "stressWard",
  "nextRoundFreeRerolls",
  "objectivePoints",
  "credits"
]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function isPositiveInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function isIdentifier(value) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 80;
}

function emptyCombatTotals() {
  return Object.fromEntries(COMBAT_KEYS.map((key) => [key, 0]));
}

function emptyEffects() {
  return Object.fromEntries(EFFECT_KEYS.map((key) => [key, 0]));
}

function addValues(target, source, keys) {
  for (const key of keys) target[key] += source[key];
}

function normalizedCounts(counts = {}) {
  if (!isRecord(counts)) throw new TypeError("Battle counts must be an object");
  const normalized = {};
  for (const key of COUNT_KEYS) {
    const value = counts[key] ?? 0;
    if (!isNonNegativeInteger(value)) {
      throw new TypeError(`Battle count ${key} must be a non-negative integer`);
    }
    normalized[key] = value;
  }
  return normalized;
}

function normalizedEffects(effects = {}) {
  if (!isRecord(effects)) throw new TypeError("Battle effects must be an object");
  const normalized = emptyEffects();
  for (const key of EFFECT_KEYS) {
    const value = effects[key] ?? 0;
    if (!isNonNegativeInteger(value)) {
      throw new TypeError(`Battle effect ${key} must be a non-negative integer`);
    }
    normalized[key] = value;
  }
  return normalized;
}

export function createCombatTotals(values = {}) {
  if (!isRecord(values)) throw new TypeError("Combat totals must be an object");
  const totals = emptyCombatTotals();
  for (const key of COMBAT_KEYS) {
    const value = values[key] ?? 0;
    if (!isNonNegativeInteger(value)) {
      throw new TypeError(`Combat total ${key} must be a non-negative integer`);
    }
    totals[key] = value;
  }
  return totals;
}

export function validateLockedFleetPacket(packet) {
  const errors = [];

  if (!isRecord(packet)) {
    return { ok: false, errors: ["Fleet packet must be an object"] };
  }

  if (packet.version !== BATTLE_PACKET_VERSION) {
    errors.push(`Fleet packet version must be ${BATTLE_PACKET_VERSION}`);
  }
  if (!isIdentifier(packet.matchId)) errors.push("matchId must be a non-empty string");
  if (!isPositiveInteger(packet.round)) errors.push("round must be a positive integer");
  if (!isIdentifier(packet.playerId)) errors.push("playerId must be a non-empty string");
  if (!isIdentifier(packet.teamId)) errors.push("teamId must be a non-empty string");
  if (packet.locked !== true) errors.push("Fleet packet must be locked");
  if (!isPositiveInteger(packet.activeDice)) errors.push("activeDice must be a positive integer");

  if (!isRecord(packet.totals)) {
    errors.push("totals must be an object");
  } else {
    for (const key of COMBAT_KEYS) {
      if (!isNonNegativeInteger(packet.totals[key])) {
        errors.push(`totals.${key} must be a non-negative integer`);
      }
    }
  }

  if (!isRecord(packet.counts)) {
    errors.push("counts must be an object");
  } else {
    let countedDice = 0;
    for (const key of COUNT_KEYS) {
      if (!isNonNegativeInteger(packet.counts[key])) {
        errors.push(`counts.${key} must be a non-negative integer`);
      } else {
        countedDice += packet.counts[key];
      }
    }
    if (isPositiveInteger(packet.activeDice) && countedDice > packet.activeDice) {
      errors.push("Combat and Void face counts cannot exceed activeDice");
    }
  }

  return { ok: errors.length === 0, errors };
}

function assertValidFleetPacket(packet) {
  const validation = validateLockedFleetPacket(packet);
  if (!validation.ok) throw new TypeError(validation.errors.join("; "));
}

function weakestCombatKey(totals) {
  return COMBAT_KEYS.reduce((weakest, key) => (
    totals[key] < totals[weakest] ? key : weakest
  ), COMBAT_KEYS[0]);
}

export function deriveFleetTactics(packet) {
  assertValidFleetPacket(packet);

  const totals = createCombatTotals(packet.totals);
  const counts = normalizedCounts(packet.counts);
  const effects = emptyEffects();
  const tactics = [];

  if (totals.laser >= 3) {
    totals.laser += 1;
    effects.speedSuppression += 1;
    tactics.push("target-lock");
  }

  if (totals.rocket >= 3) {
    totals.rocket += 2;
    tactics.push("salvo");
  }

  if (totals.shield >= 3) {
    totals.shield += 2;
    effects.stressWard += 1;
    tactics.push("bulwark");
  }

  if (totals.speed >= 3) {
    totals.speed += 2;
    effects.nextRoundFreeRerolls += 1;
    tactics.push("flanking");
  }

  if (COMBAT_KEYS.every((key) => totals[key] >= 1)) {
    const boostedKey = weakestCombatKey(totals);
    totals[boostedKey] += 1;
    effects.objectivePoints += 1;
    tactics.push(`combined-arms:${boostedKey}`);
  }

  if (counts.void === 0) {
    effects.credits += 1;
    tactics.push("clean-bay");
  }

  return { totals, effects, tactics };
}

function assertCompatiblePackets(packets) {
  if (!Array.isArray(packets) || packets.length < 2) {
    throw new TypeError("A locked battle requires at least two fleet packets");
  }

  const playerIds = new Set();
  const matchId = packets[0]?.matchId;
  const round = packets[0]?.round;

  for (const packet of packets) {
    assertValidFleetPacket(packet);
    if (packet.matchId !== matchId) throw new TypeError("All fleet packets must share a matchId");
    if (packet.round !== round) throw new TypeError("All fleet packets must share a round");
    if (playerIds.has(packet.playerId)) throw new TypeError(`Duplicate playerId: ${packet.playerId}`);
    playerIds.add(packet.playerId);
  }
}

export function aggregateTeamPackets(packets) {
  assertCompatiblePackets(packets);
  const teams = new Map();

  for (const packet of packets) {
    const prepared = deriveFleetTactics(packet);
    const team = teams.get(packet.teamId) ?? {
      teamId: packet.teamId,
      playerIds: [],
      activeDice: 0,
      rawTotals: emptyCombatTotals(),
      totals: emptyCombatTotals(),
      effects: emptyEffects(),
      fleets: []
    };

    team.playerIds.push(packet.playerId);
    team.activeDice += packet.activeDice;
    addValues(team.rawTotals, createCombatTotals(packet.totals), COMBAT_KEYS);
    addValues(team.totals, prepared.totals, COMBAT_KEYS);
    addValues(team.effects, prepared.effects, EFFECT_KEYS);
    team.fleets.push({
      playerId: packet.playerId,
      activeDice: packet.activeDice,
      rawTotals: createCombatTotals(packet.totals),
      totals: prepared.totals,
      effects: prepared.effects,
      tactics: prepared.tactics
    });
    teams.set(packet.teamId, team);
  }

  if (teams.size !== 2) {
    throw new TypeError("A locked battle must contain exactly two teams");
  }

  return [...teams.values()]
    .map((team) => ({
      ...team,
      playerIds: [...team.playerIds].sort(),
      fleets: [...team.fleets].sort((left, right) => left.playerId.localeCompare(right.playerId))
    }))
    .sort((left, right) => left.teamId.localeCompare(right.teamId));
}

function resolvedSide(own, enemy, enemyEffects) {
  const remaining = {
    laser: Math.max(0, own.laser - enemy.shield),
    rocket: Math.max(0, own.rocket - enemy.speed),
    shield: Math.max(0, own.shield - enemy.rocket),
    speed: Math.max(0, own.speed - enemy.laser - enemyEffects.speedSuppression)
  };

  return {
    remaining,
    hits: remaining.laser + remaining.rocket,
    tacticalEdge: remaining.shield + remaining.speed
  };
}

export function resolveCombatTotals(firstTotals, secondTotals, options = {}) {
  const first = createCombatTotals(firstTotals);
  const second = createCombatTotals(secondTotals);
  const firstEffects = normalizedEffects(options.firstEffects);
  const secondEffects = normalizedEffects(options.secondEffects);

  return {
    first: resolvedSide(first, second, secondEffects),
    second: resolvedSide(second, first, firstEffects)
  };
}

export function resolveLockedBattle(packets) {
  const teams = aggregateTeamPackets(packets);
  const [firstTeam, secondTeam] = teams;
  const combat = resolveCombatTotals(firstTeam.totals, secondTeam.totals, {
    firstEffects: firstTeam.effects,
    secondEffects: secondTeam.effects
  });

  const firstResult = {
    ...firstTeam,
    ...combat.first,
    incomingHits: combat.second.hits,
    stressToAssign: Math.max(0, combat.second.hits - firstTeam.effects.stressWard)
  };
  const secondResult = {
    ...secondTeam,
    ...combat.second,
    incomingHits: combat.first.hits,
    stressToAssign: Math.max(0, combat.first.hits - secondTeam.effects.stressWard)
  };

  let winnerTeamId = null;
  if (firstResult.hits > secondResult.hits) winnerTeamId = firstTeam.teamId;
  if (secondResult.hits > firstResult.hits) winnerTeamId = secondTeam.teamId;

  return {
    version: BATTLE_PACKET_VERSION,
    matchId: packets[0].matchId,
    round: packets[0].round,
    teamOrder: [firstTeam.teamId, secondTeam.teamId],
    teams: Object.fromEntries([
      [firstTeam.teamId, firstResult],
      [secondTeam.teamId, secondResult]
    ]),
    winnerTeamId
  };
}

export function assignStress(ships, hits, damageOrder = []) {
  if (!Array.isArray(ships) || ships.length === 0) {
    throw new TypeError("Stress assignment requires at least one ship");
  }
  if (!isNonNegativeInteger(hits)) throw new TypeError("Hits must be a non-negative integer");
  if (!Array.isArray(damageOrder)) throw new TypeError("damageOrder must be an array");

  const seenShipIds = new Set();
  const updatedShips = ships.map((ship) => {
    if (!isRecord(ship)) throw new TypeError("Each ship must be an object");
    if (!isIdentifier(ship.id)) throw new TypeError("Each ship requires a non-empty id");
    if (seenShipIds.has(ship.id)) throw new TypeError(`Duplicate ship id: ${ship.id}`);
    seenShipIds.add(ship.id);
    if (!isPositiveInteger(ship.structure)) throw new TypeError(`Ship ${ship.id} requires positive Structure`);
    const stress = ship.stress ?? 0;
    if (!isNonNegativeInteger(stress) || stress > ship.structure) {
      throw new TypeError(`Ship ${ship.id} has invalid Stress`);
    }
    return { ...ship, stress };
  });

  const orderedIds = [];
  const seenOrderIds = new Set();
  for (const shipId of damageOrder) {
    if (!seenShipIds.has(shipId)) throw new TypeError(`Unknown ship in damageOrder: ${shipId}`);
    if (seenOrderIds.has(shipId)) throw new TypeError(`Duplicate ship in damageOrder: ${shipId}`);
    seenOrderIds.add(shipId);
    orderedIds.push(shipId);
  }
  for (const ship of updatedShips) {
    if (!seenOrderIds.has(ship.id)) orderedIds.push(ship.id);
  }

  const byId = new Map(updatedShips.map((ship) => [ship.id, ship]));
  let remainingHits = hits;
  for (const shipId of orderedIds) {
    if (remainingHits === 0) break;
    const ship = byId.get(shipId);
    const availableStructure = ship.structure - ship.stress;
    const assigned = Math.min(availableStructure, remainingHits);
    ship.stress += assigned;
    remainingHits -= assigned;
  }

  return {
    ships: updatedShips,
    appliedStress: hits - remainingHits,
    unassignedStress: remainingHits,
    thresholdShipIds: updatedShips
      .filter((ship) => ship.stress >= ship.structure)
      .map((ship) => ship.id)
  };
}
