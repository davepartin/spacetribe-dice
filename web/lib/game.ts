export type SideId = "host" | "guest";
export type DieSize = 4 | 6 | 8 | 10;
export type PlayerPhase =
  | "waiting"
  | "shop"
  | "ready"
  | "rolling"
  | "submitted"
  | "brace"
  | "report"
  | "over";

export type Ship = {
  id: string;
  sides: DieSize;
  disabledRound: number | null;
};

export type DieValue = {
  id: string;
  sides: number;
  value: number;
  flag?: boolean;
};

export type StraightReward = {
  kind: "energy" | "attack" | "ship";
  label: string;
  energy?: number;
  attack?: number;
  ship?: DieSize;
};

export type Straight = {
  start: number;
  top: number;
  length: number;
  biggest: DieSize;
  taken: number;
  reward: StraightReward;
};

export type Tally = {
  attack: number;
  defense: number;
  energy: number;
  heal: number;
  direct: number;
  face: number;
  run: Straight | null;
};

export type RoundReport = {
  hpBefore: number;
  hpAfter: number;
  damage: number;
  repair: number;
  energyEarned: number;
  soaked: number;
  tally: Tally;
  dice: DieValue[];
};

export type PlayerState = {
  email: string;
  name: string;
  hp: number;
  energy: number;
  baseEnergy: number;
  slots: number;
  ships: Ship[];
  flag: {
    level: number;
    face: number;
    token: boolean;
  };
  /** Combat round this commander is currently playing. */
  round: number;
  phase: PlayerPhase;
  rolls: number;
  dice: DieValue[];
  tally: Tally | null;
  incoming: number;
  directIncoming: number;
  braceShips: string[];
  report: RoundReport | null;
  acknowledged: boolean;
};

export type MatchState = {
  id: string;
  code: string;
  inviteToken: string;
  status: "waiting" | "active" | "finished";
  round: number;
  createdAt: string;
  players: {
    host: PlayerState;
    guest: PlayerState | null;
  };
  winner: SideId | "draw" | null;
  /** Set when a commander abandons the room. */
  cancelledBy?: string | null;
};

export type MatchAction =
  | { type: "shop"; operation: "upgrade" | "scrap"; shipId: string }
  | { type: "shop"; operation: "buy"; sides: DieSize }
  | { type: "shop"; operation: "slot" | "flagship" }
  | { type: "ready" }
  | { type: "roll"; dice: string[] }
  | { type: "flag-token"; direction: -1 | 1 }
  | { type: "submit"; straightTake?: number }
  | { type: "brace"; ships: string[] }
  | { type: "continue" };

const PRICES: Record<DieSize, number> = { 4: 4, 6: 6, 8: 9, 10: 13 };
const UPGRADE: Partial<Record<DieSize, DieSize>> = { 4: 6, 6: 8, 8: 10 };
const FLAG_COST: Record<number, number> = { 1: 10, 2: 16 };

export function newPlayer(email: string, name: string, phase: PlayerPhase): PlayerState {
  return {
    email,
    name: commanderName(name, email),
    hp: 60,
    energy: 0,
    baseEnergy: 0,
    slots: 4,
    ships: Array.from({ length: 4 }, (_, index) => ({
      id: `ship-${index + 1}-${randomId(5)}`,
      sides: 4 as DieSize,
      disabledRound: null,
    })),
    flag: { level: 1, face: 1, token: true },
    round: 1,
    phase,
    rolls: 0,
    dice: [],
    tally: null,
    incoming: 0,
    directIncoming: 0,
    braceShips: [],
    report: null,
    acknowledged: false,
  };
}

export function newMatch(
  id: string,
  code: string,
  inviteToken: string,
  email: string,
  name: string,
): MatchState {
  return {
    id,
    code,
    inviteToken,
    status: "waiting",
    round: 1,
    createdAt: new Date().toISOString(),
    players: {
      host: newPlayer(email, name, "waiting"),
      guest: null,
    },
    winner: null,
  };
}

export function joinMatch(state: MatchState, email: string, name: string): MatchState {
  if (state.players.host.email === email) return state;
  if (state.players.guest?.email === email) return state;
  if (state.players.guest) throw new Error("This match already has two commanders.");
  if (state.status !== "waiting") throw new Error("This match has already started.");

  state.players.guest = newPlayer(email, name, "ready");
  state.players.host.phase = "ready";
  state.status = "active";
  return state;
}

export function roleFor(state: MatchState, email: string): SideId | null {
  if (state.players.host.email === email) return "host";
  if (state.players.guest?.email === email) return "guest";
  return null;
}

export function applyAction(
  state: MatchState,
  side: SideId,
  action: MatchAction,
): MatchState {
  if (state.status === "finished") throw new Error("This match is finished.");
  ensurePlayerRounds(state);
  const player = getPlayer(state, side);

  switch (action.type) {
    case "shop":
      handleShop(player, action);
      break;
    case "ready":
      if (player.phase !== "shop") throw new Error("You are not in the shipyard.");
      prepareRound(player);
      break;
    case "roll":
      handleRoll(state, player, action.dice);
      break;
    case "flag-token":
      handleFlagToken(player, action.direction);
      break;
    case "submit":
      handleSubmit(state, player, action.straightTake);
      resolveSubmissions(state);
      break;
    case "brace":
      handleBrace(state, player, action.ships);
      break;
    case "continue":
      handleContinue(state, player);
      break;
  }

  return state;
}

export function previewTally(
  player: PlayerState,
  straightTake?: number,
): Tally {
  return tally(player.dice, player.flag.level, straightTake);
}

export function straightOptions(player: PlayerState): Straight | null {
  return tally(player.dice, player.flag.level).run;
}

export function priceOf(sides: DieSize): number {
  return PRICES[sides];
}

export function slotPrice(slotNumber: number): number {
  return slotNumber + 2;
}

export function flagshipUpgradeCost(level: number): number | null {
  return FLAG_COST[level] ?? null;
}

export function activeShips(player: PlayerState, round: number): Ship[] {
  return player.ships.filter((ship) => ship.disabledRound !== round);
}

export function opponentOf(side: SideId): SideId {
  return side === "host" ? "guest" : "host";
}

export function publicMatchView(state: MatchState, viewer: SideId) {
  const copy = structuredClone(state);
  delete (copy as Partial<MatchState>).inviteToken;
  ensurePlayerRounds(copy);
  // Waiting rooms have no guest yet — do not require an opponent.
  const viewerPlayer = copy.players[viewer];
  const opponent = copy.players[opponentOf(viewer)];
  // Hide their roll until you have locked and both sides resolve — while you are
  // still ready/rolling/submitted you should not see their dice.
  if (
    opponent &&
    viewerPlayer &&
    state.status === "active" &&
    ["waiting", "ready", "rolling", "submitted"].includes(viewerPlayer.phase)
  ) {
    opponent.dice = [];
    opponent.tally = null;
  }
  return copy;
}

function ensurePlayerRounds(state: MatchState) {
  const fallback = state.round || 1;
  if (typeof state.players.host.round !== "number") {
    state.players.host.round = fallback;
  }
  if (state.players.guest && typeof state.players.guest.round !== "number") {
    state.players.guest.round = fallback;
  }
}

function handleShop(
  player: PlayerState,
  action: Extract<MatchAction, { type: "shop" }>,
) {
  if (player.phase !== "shop") throw new Error("Shop actions are only available between rounds.");

  if (action.operation === "slot") {
    if (player.slots >= 8) throw new Error("Every fleet slot is already open.");
    const cost = slotPrice(player.slots + 1);
    spend(player, cost);
    player.slots += 1;
    return;
  }

  if (action.operation === "flagship") {
    const cost = flagshipUpgradeCost(player.flag.level);
    if (!cost) throw new Error("Your flagship is already at level 3.");
    spend(player, cost);
    player.flag.level += 1;
    return;
  }

  if (action.operation === "buy") {
    if (player.ships.length >= player.slots) throw new Error("Open a fleet slot first.");
    spend(player, priceOf(action.sides));
    player.ships.push({
      id: `ship-${randomId(9)}`,
      sides: action.sides,
      disabledRound: null,
    });
    return;
  }

  if (!("shipId" in action)) throw new Error("Choose a ship first.");
  const ship = player.ships.find((candidate) => candidate.id === action.shipId);
  if (!ship) throw new Error("That ship is no longer in your fleet.");

  if (action.operation === "scrap") {
    player.energy += Math.floor(priceOf(ship.sides) / 2);
    player.ships = player.ships.filter((candidate) => candidate.id !== ship.id);
    return;
  }

  const next = UPGRADE[ship.sides];
  if (!next) throw new Error("That ship is already a d10.");
  spend(player, priceOf(next) - priceOf(ship.sides));
  ship.sides = next;
}

function handleRoll(_state: MatchState, player: PlayerState, chosen: string[]) {
  if (player.phase === "ready") {
    player.dice = activeShips(player, player.round).map((ship) => ({
      id: ship.id,
      sides: ship.sides,
      value: roll(ship.sides),
    }));
    player.flag.face = roll(6);
    player.dice.push({
      id: "flag",
      sides: 6,
      value: player.flag.face,
      flag: true,
    });
    player.rolls = 1;
    player.phase = "rolling";
    return;
  }

  if (player.phase !== "rolling") throw new Error("Your fleet is not ready to roll.");
  const unique = [...new Set(chosen)];
  if (!unique.length) throw new Error("Choose at least one die to reroll.");
  for (const id of unique) {
    if (!player.dice.some((die) => die.id === id)) throw new Error("That die is not available.");
  }

  if (player.rolls >= 3) spend(player, unique.length);

  for (const die of player.dice) {
    if (!unique.includes(die.id)) continue;
    die.value = roll(die.sides);
    if (die.flag) player.flag.face = die.value;
  }
  player.rolls += 1;
}

function handleFlagToken(player: PlayerState, direction: -1 | 1) {
  if (player.phase !== "rolling" || player.rolls < 3) {
    throw new Error("The Flagship Token unlocks after roll 3.");
  }
  if (!player.flag.token) throw new Error("Your Flagship Token is already spent.");
  const next = ((player.flag.face - 1 + direction + 6) % 6) + 1;
  player.flag.face = next;
  const flag = player.dice.find((die) => die.flag);
  if (flag) flag.value = next;
  player.flag.token = false;
}

function handleSubmit(state: MatchState, player: PlayerState, straightTake?: number) {
  if (player.phase !== "rolling") throw new Error("Roll your fleet before submitting.");
  const run = tally(player.dice, player.flag.level).run;
  if (straightTake !== undefined) {
    if (!run || straightTake < 5 || straightTake > run.length) {
      throw new Error("That straight reward is not available.");
    }
  }
  player.tally = tally(player.dice, player.flag.level, straightTake);
  player.phase = "submitted";
}

function resolveSubmissions(state: MatchState) {
  const guest = state.players.guest;
  if (!guest) return;
  const host = state.players.host;
  if (host.phase !== "submitted" || guest.phase !== "submitted") return;
  // Fast player may already be on the next combat round while the other is still
  // bracing/shopping — only resolve when both locked the same round.
  if (host.round !== guest.round) return;

  const combatRound = host.round;
  const escalation = combatRound > 8 ? (combatRound - 8) * 4 : 0;

  host.incoming = Math.max(
    0,
    (guest.tally?.attack ?? 0) + escalation - (host.tally?.defense ?? 0),
  );
  host.directIncoming = guest.tally?.direct ?? 0;
  guest.incoming = Math.max(
    0,
    (host.tally?.attack ?? 0) + escalation - (guest.tally?.defense ?? 0),
  );
  guest.directIncoming = host.tally?.direct ?? 0;

  for (const player of [host, guest]) {
    player.braceShips = [];
    if (player.incoming > 0 && activeShips(player, player.round).length > 0) {
      player.phase = "brace";
    } else {
      settlePlayer(state, player);
    }
  }
  finishIfNeeded(state);
}

function handleBrace(state: MatchState, player: PlayerState, selected: string[]) {
  if (player.phase !== "brace") throw new Error("There is no volley to brace against.");
  const choices = [...new Set(selected)];
  const available = new Set(activeShips(player, player.round).map((ship) => ship.id));
  if (choices.some((id) => !available.has(id))) {
    throw new Error("One of those ships cannot take the hit.");
  }
  player.braceShips = choices;
  settlePlayer(state, player);
  finishIfNeeded(state);
}

function settlePlayer(_state: MatchState, player: PlayerState) {
  const before = player.hp;
  let soaked = 0;
  for (const ship of player.ships) {
    if (!player.braceShips.includes(ship.id)) continue;
    soaked += ship.sides;
    ship.disabledRound = player.round + 1;
  }
  const damage = Math.max(0, player.incoming - soaked) + player.directIncoming;
  const repair = player.tally?.heal ?? 0;

  player.hp = before - damage + repair;
  player.energy += player.baseEnergy + (player.tally?.energy ?? 0);

  if (player.flag.face === 1) {
    if (player.baseEnergy < 6) {
      player.baseEnergy = Math.min(6, player.baseEnergy + flagMultiplier(player.flag.level));
    } else {
      player.energy += 2;
    }
  }

  const rewardShip = player.tally?.run?.reward.ship;
  if (rewardShip && player.ships.length < player.slots) {
    player.ships.push({
      id: `ship-${randomId(9)}`,
      sides: rewardShip,
      disabledRound: null,
    });
  }

  player.report = {
    hpBefore: before,
    hpAfter: player.hp,
    damage,
    repair,
    energyEarned: player.baseEnergy + (player.tally?.energy ?? 0),
    soaked: Math.min(soaked, player.incoming),
    tally: player.tally!,
    dice: player.dice,
  };
  player.phase = "report";
  player.acknowledged = false;
}

function finishIfNeeded(state: MatchState) {
  const guest = state.players.guest;
  if (!guest) return;
  const host = state.players.host;
  // Let the other commander finish bracing so mutual kills can resolve.
  if (host.phase === "brace" || guest.phase === "brace") return;
  if (host.hp > 0 && guest.hp > 0) return;

  state.status = "finished";
  if (host.hp <= 0 && guest.hp <= 0) state.winner = "draw";
  else state.winner = host.hp > 0 ? "host" : "guest";
  host.phase = "over";
  guest.phase = "over";
}

function handleContinue(state: MatchState, player: PlayerState) {
  if (player.phase === "over" || state.status === "finished" || player.hp <= 0) {
    player.phase = "over";
    player.acknowledged = true;
    finishIfNeeded(state);
    return;
  }
  if (player.phase !== "report") {
    throw new Error("Finish the current round first.");
  }

  player.round += 1;
  player.phase = "shop";
  player.rolls = 0;
  player.dice = [];
  player.tally = null;
  player.incoming = 0;
  player.directIncoming = 0;
  player.braceShips = [];
  // Keep report until the next roll starts so the other commander can still
  // read this summary while they finish the reveal screen.
  player.acknowledged = false;
  syncMatchRound(state);
  finishIfNeeded(state);
}

function syncMatchRound(state: MatchState) {
  const guest = state.players.guest;
  state.round = guest
    ? Math.min(state.players.host.round, guest.round)
    : state.players.host.round;
}

function prepareRound(player: PlayerState) {
  player.phase = "ready";
  player.rolls = 0;
  player.dice = [];
  player.tally = null;
  player.report = null;
}

function tally(dice: DieValue[], flagLevel: number, chosenTake?: number): Tally {
  const result: Tally = {
    attack: 0,
    defense: 0,
    energy: 0,
    heal: 0,
    direct: 0,
    face: dice.find((die) => die.flag)?.value ?? 1,
    run: null,
  };

  for (const die of dice) {
    if (die.flag) continue;
    if (die.value % 2 === 0) result.attack += die.value;
    else result.defense += die.value;
    result.energy += energyOf(die.value);
    result.heal += repairOf(die.value);
    result.direct += directOf(die.value);
  }

  const run = bestRun(dice, chosenTake);
  result.run = run;
  if (run) {
    result.attack += run.reward.attack ?? 0;
    result.energy += run.reward.energy ?? 0;
  }

  const multiplier = flagMultiplier(flagLevel);
  const fleet = dice.filter((die) => !die.flag);
  if (result.face === 2) {
    result.direct += fleet.filter((die) => die.value === 2).length * multiplier;
  } else if (result.face === 3) {
    result.heal += fleet.filter((die) => die.value === 3).length * multiplier;
  } else if (result.face === 4) {
    result.energy += fleet.filter((die) => die.value === 4).length * multiplier;
  } else if (result.face === 5) {
    result.defense += fleet.filter((die) => die.value % 2 === 1).length * multiplier;
  } else if (result.face === 6) {
    result.attack += fleet.filter((die) => die.value % 2 === 0).length * multiplier;
  }

  return result;
}

function bestRun(dice: DieValue[], chosenTake?: number): Straight | null {
  const byValue = new Map<number, number>();
  for (const die of dice) {
    const current = byValue.get(die.value) ?? 0;
    if (!die.flag) byValue.set(die.value, Math.max(current, die.sides));
    else if (!byValue.has(die.value)) byValue.set(die.value, 0);
  }

  let best: Omit<Straight, "taken" | "reward"> | null = null;
  for (let start = 1; start <= 10; start += 1) {
    let length = 0;
    while (byValue.has(start + length)) length += 1;
    if (length < 5) continue;
    let biggest = 0;
    for (let value = start; value < start + length; value += 1) {
      biggest = Math.max(biggest, byValue.get(value) ?? 0);
    }
    if (!biggest) continue;
    if (!best || length > best.length) {
      best = {
        start,
        top: start + length - 1,
        length,
        biggest: biggest as DieSize,
      };
    }
  }

  if (!best) return null;
  const taken = Math.max(5, Math.min(chosenTake ?? best.length, best.length));
  return {
    ...best,
    taken,
    reward: straightReward(taken, best.biggest),
  };
}

function straightReward(length: number, biggest: DieSize): StraightReward {
  if (length >= 8) {
    return {
      kind: "ship",
      ship: biggest,
      attack: biggest * 2,
      label: `free d${biggest} + ${biggest * 2} Attack`,
    };
  }
  if (length >= 7) {
    return {
      kind: "attack",
      attack: biggest * 3,
      label: `${biggest * 3} Attack`,
    };
  }
  if (length >= 6) {
    return {
      kind: "attack",
      attack: biggest * 2,
      label: `${biggest * 2} Attack`,
    };
  }
  return {
    kind: "energy",
    energy: Math.round(biggest * 1.5),
    label: `${Math.round(biggest * 1.5)} Energy`,
  };
}

function getPlayer(state: MatchState, side: SideId): PlayerState {
  const player = state.players[side];
  if (!player) throw new Error("The second commander has not joined yet.");
  return player;
}

function spend(player: PlayerState, amount: number) {
  if (player.energy < amount) throw new Error(`You need ${amount} Energy.`);
  player.energy -= amount;
}

export function energyOf(value: number): number {
  if (value === 1) return 2;
  if (value === 4) return 1;
  return 0;
}

export function repairOf(value: number): number {
  if (value === 3) return 3;
  return ({ 5: 1, 7: 2, 9: 3 } as Record<number, number>)[value] ?? 0;
}

export function directOf(value: number): number {
  if (value === 2) return 2;
  return ({ 6: 1, 8: 2, 10: 3 } as Record<number, number>)[value] ?? 0;
}

function flagMultiplier(level: number): number {
  return Math.min(4, level + 1);
}

function roll(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

function commanderName(name: string, email: string): string {
  const cleaned = name.trim();
  if (cleaned && !cleaned.includes("@")) return cleaned.split(/\s+/)[0];
  return email.split("@")[0] || "Commander";
}

export function randomId(length = 16): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
