export type SideId = "host" | "guest";
export type DieSize = 4 | 6 | 8 | 10;
/** classic = Fleet Dice 1. v2 = formation lines + pick-a-slot. */
export type Ruleset = "classic" | "v2";
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
  /** Fleet index 0–7 around the flagship. Set on Fleet Dice 2. */
  slot?: number;
};

export type DieValue = {
  id: string;
  sides: number;
  value: number;
  flag?: boolean;
  slot?: number;
};

export type FormationLine = {
  kind: "row" | "col";
  idx: number[];
  sides: number;
  value: number;
  energy: number;
  attack: number;
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
  /** Fleet Dice 2 only. Missing on older saved rooms. */
  lines?: FormationLine[];
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
  /** Fleet Dice 2: which of the 8 cells around the flagship are open. */
  open?: boolean[];
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
  /** Missing on old rooms — treat as Fleet Dice 1. */
  ruleset?: Ruleset;
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
  | { type: "shop"; operation: "buy"; sides: DieSize; slotIndex?: number }
  | { type: "shop"; operation: "slot"; slotIndex?: number }
  | { type: "shop"; operation: "flagship" }
  | { type: "ready" }
  | { type: "roll"; dice: string[] }
  | { type: "flag-token"; direction: -1 | 1 }
  | { type: "submit"; straightTake?: number }
  | { type: "brace"; ships: string[] }
  | { type: "continue" };

const PRICES: Record<DieSize, number> = { 4: 4, 6: 6, 8: 9, 10: 13 };
const UPGRADE: Partial<Record<DieSize, DieSize>> = { 4: 6, 6: 8, 8: 10 };
const FLAG_COST: Record<number, number> = { 1: 10, 2: 16 };

export function newPlayer(
  email: string,
  name: string,
  phase: PlayerPhase,
  ruleset: Ruleset = "classic",
): PlayerState {
  const v2 = ruleset === "v2";
  return {
    email,
    name: commanderName(name, email),
    hp: 60,
    energy: 0,
    baseEnergy: 0,
    slots: 4,
    open: v2 ? [true, true, true, true, false, false, false, false] : undefined,
    ships: Array.from({ length: 4 }, (_, index) => ({
      id: `ship-${index + 1}-${randomId(5)}`,
      sides: 4 as DieSize,
      disabledRound: null,
      slot: v2 ? index : undefined,
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
  ruleset: Ruleset = "classic",
): MatchState {
  return {
    id,
    code,
    inviteToken,
    status: "waiting",
    round: 1,
    createdAt: new Date().toISOString(),
    ruleset,
    players: {
      host: newPlayer(email, name, "waiting", ruleset),
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

  const ruleset = matchRuleset(state);
  state.players.guest = newPlayer(email, name, "ready", ruleset);
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
  // Resolve decided kills before any further shopping/rolling so a soft-locked
  // brace screen cannot leave the winner stranded in the next round.
  if (finishIfNeeded(state)) return state;

  const player = getPlayer(state, side);

  switch (action.type) {
    case "shop":
      handleShop(state, player, action);
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

  finishIfNeeded(state);
  return state;
}

export function previewTally(
  player: PlayerState,
  straightTake?: number,
  ruleset: Ruleset = "classic",
): Tally {
  return tally(player.dice, player.flag.level, straightTake, ruleset);
}

export function straightOptions(
  player: PlayerState,
  ruleset: Ruleset = "classic",
): Straight | null {
  return tally(player.dice, player.flag.level, undefined, ruleset).run;
}

export function priceOf(sides: DieSize): number {
  return PRICES[sides];
}

export function slotPrice(slotNumber: number): number {
  return slotNumber + 2;
}

export function matchRuleset(state: MatchState | { ruleset?: Ruleset } | null | undefined): Ruleset {
  return state?.ruleset === "v2" ? "v2" : "classic";
}

/** 3×3 cell number: ships are 1–4 and 6–9. 5 is the flagship. */
export function boardLabel(fleetIndex: number): number {
  return fleetIndex < 4 ? fleetIndex + 1 : fleetIndex + 2;
}

export function openMask(player: PlayerState): boolean[] {
  if (player.open && player.open.length >= 8) {
    return player.open.slice(0, 8);
  }
  return Array.from({ length: 8 }, (_, index) => index < player.slots);
}

export function fleetSlotOf(ship: Ship, index: number): number {
  return typeof ship.slot === "number" ? ship.slot : index;
}

export function shipInFleetSlot(player: PlayerState, fleetIndex: number): Ship | undefined {
  return player.ships.find((ship, index) => fleetSlotOf(ship, index) === fleetIndex);
}

export function emptyOpenSlots(player: PlayerState): number[] {
  const open = openMask(player);
  const empty: number[] = [];
  for (let index = 0; index < 8; index += 1) {
    if (open[index] && !shipInFleetSlot(player, index)) empty.push(index);
  }
  return empty;
}

export function nextUnlockCost(player: PlayerState): number {
  const opened = openMask(player).filter(Boolean).length;
  if (opened >= 8) return 0;
  return slotPrice(opened + 1);
}

/** Three of a kind across the board. Any die size. */
export const LINE_ACROSS_ENERGY = 5;
/** Three of a kind down the board. Any die size. */
export const LINE_DOWN_ATTACK = 10;

export function linePrize(kind: "row" | "col" = "row"): number {
  return kind === "col" ? LINE_DOWN_ATTACK : LINE_ACROSS_ENERGY;
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
  state: MatchState,
  player: PlayerState,
  action: Extract<MatchAction, { type: "shop" }>,
) {
  if (player.phase !== "shop") throw new Error("Shop actions are only available between rounds.");
  const v2 = matchRuleset(state) === "v2";

  if (action.operation === "slot") {
    if (v2) {
      const ix = action.slotIndex;
      if (ix === undefined || ix < 0 || ix > 7) {
        throw new Error("Tap the locked slot you want to open.");
      }
      const open = openMask(player);
      if (open[ix]) throw new Error("That slot is already open.");
      const cost = nextUnlockCost(player);
      if (!cost) throw new Error("Every fleet slot is already open.");
      spend(player, cost);
      player.open = open.map((value, index) => (index === ix ? true : value));
      player.slots = player.open.filter(Boolean).length;
      return;
    }
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
    const empties = emptyOpenSlots(player);
    if (!empties.length) throw new Error("Open a fleet slot first.");
    let ix = empties[0];
    if (v2) {
      if (action.slotIndex !== undefined) {
        if (!empties.includes(action.slotIndex)) {
          throw new Error("Tap a free slot to park this ship.");
        }
        ix = action.slotIndex;
      } else if (empties.length > 1) {
        throw new Error("Tap a free slot to park this ship.");
      }
    }
    spend(player, priceOf(action.sides));
    player.ships.push({
      id: `ship-${randomId(9)}`,
      sides: action.sides,
      disabledRound: null,
      slot: v2 ? ix : undefined,
    });
    return;
  }

  if (!("shipId" in action)) throw new Error("Choose a ship first.");
  const ship = player.ships.find((candidate) => candidate.id === action.shipId);
  if (!ship) throw new Error("That ship is no longer in your fleet.");

  if (action.operation === "scrap") {
    if (player.ships.length <= 1) throw new Error("You need at least one ship.");
    player.energy += Math.floor(priceOf(ship.sides) / 2);
    player.ships = player.ships.filter((candidate) => candidate.id !== ship.id);
    return;
  }

  const next = UPGRADE[ship.sides];
  if (!next) throw new Error("That ship is already a d10.");
  spend(player, priceOf(next) - priceOf(ship.sides));
  ship.sides = next;
}

function handleRoll(state: MatchState, player: PlayerState, chosen: string[]) {
  const v2 = matchRuleset(state) === "v2";
  if (player.phase === "ready") {
    player.dice = activeShips(player, player.round).map((ship) => ({
      id: ship.id,
      sides: ship.sides,
      value: roll(ship.sides),
      ...(v2 ? { slot: fleetSlotOf(ship, player.ships.indexOf(ship)) } : {}),
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
  if (player.phase !== "rolling" || player.rolls < 1) {
    throw new Error("Roll your fleet before using the Flagship Token.");
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
  const ruleset = matchRuleset(state);
  const run = tally(player.dice, player.flag.level, undefined, ruleset).run;
  if (straightTake !== undefined) {
    if (!run || straightTake < 5 || straightTake > Math.min(run.length, 7)) {
      throw new Error("That straight reward is not available.");
    }
  }
  player.tally = tally(player.dice, player.flag.level, straightTake, ruleset);
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
  if (rewardShip && emptyOpenSlots(player).length) {
    const slot = emptyOpenSlots(player)[0];
    player.ships.push({
      id: `ship-${randomId(9)}`,
      sides: rewardShip,
      disabledRound: null,
      slot: typeof player.ships[0]?.slot === "number" ? slot : undefined,
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

/** True when even soaking with every available ship still leaves HP at 0 or below. */
function inescapableDeath(player: PlayerState): boolean {
  if (player.phase !== "brace") return false;
  const maxSoak = activeShips(player, player.round).reduce((sum, ship) => sum + ship.sides, 0);
  const damage = Math.max(0, player.incoming - maxSoak) + player.directIncoming;
  const repair = player.tally?.heal ?? 0;
  return player.hp - damage + repair <= 0;
}

function autoSettleBrace(state: MatchState, player: PlayerState) {
  if (player.phase !== "brace") return;
  // Use every available ship for soak so the report matches the best possible defense.
  player.braceShips = activeShips(player, player.round).map((ship) => ship.id);
  settlePlayer(state, player);
}

function finishIfNeeded(state: MatchState): boolean {
  const guest = state.players.guest;
  if (!guest) return state.status === "finished";
  const host = state.players.host;

  // If a commander cannot survive even with every ready ship blocking, settle
  // them immediately — do not leave either side staring at a brace screen.
  if (inescapableDeath(host)) autoSettleBrace(state, host);
  if (inescapableDeath(guest)) autoSettleBrace(state, guest);

  // Match already decided (someone is at 0 HP). The living side does not need
  // to pick blockers — settle with best soak so both snap to victory / defeat.
  if (host.phase === "brace" && guest.hp <= 0) autoSettleBrace(state, host);
  if (guest.phase === "brace" && host.hp <= 0) autoSettleBrace(state, guest);

  if (host.hp > 0 && guest.hp > 0) return false;
  if (host.phase === "brace" || guest.phase === "brace") return false;

  state.status = "finished";
  if (host.hp <= 0 && guest.hp <= 0) state.winner = "draw";
  else state.winner = host.hp <= 0 ? "guest" : "host";
  host.phase = "over";
  guest.phase = "over";
  return true;
}

function handleContinue(state: MatchState, player: PlayerState) {
  // Close out a decided kill before anyone shops into another round.
  finishIfNeeded(state);

  if (player.phase === "over" || state.status === "finished" || player.hp <= 0) {
    player.phase = "over";
    player.acknowledged = true;
    finishIfNeeded(state);
    return;
  }
  if (player.phase !== "report") {
    throw new Error("Finish the current round first.");
  }

  const opponent =
    player === state.players.host ? state.players.guest : state.players.host;
  if (opponent?.phase === "brace") {
    throw new Error(
      "Wait for the enemy to finish taking damage before you continue. The match may end here.",
    );
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

function tally(
  dice: DieValue[],
  flagLevel: number,
  chosenTake?: number,
  ruleset: Ruleset = "classic",
): Tally {
  const result: Tally = {
    attack: 0,
    defense: 0,
    energy: 0,
    heal: 0,
    direct: 0,
    face: dice.find((die) => die.flag)?.value ?? 1,
    run: null,
    lines: [],
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

  if (ruleset === "v2") {
    result.lines = findLines(dice);
    for (const line of result.lines) {
      result.attack += line.attack;
      result.energy += line.energy;
    }
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

const FLEET_LINES: { kind: "row" | "col"; idx: number[] }[] = [
  { kind: "row", idx: [0, 1, 2] },
  { kind: "row", idx: [3, 4, 5] },
  { kind: "col", idx: [0, 3, 6] },
  { kind: "col", idx: [1, 4, 7] },
  { kind: "row", idx: [6, 7, 8] },
  { kind: "col", idx: [2, 5, 8] },
];

function boardCell(dice: DieValue[], cell: number): DieValue | undefined {
  if (cell === 4) {
    const flag = dice.find((die) => die.flag);
    if (!flag) return undefined;
    return { ...flag, sides: 6 };
  }
  const ix = cell < 4 ? cell : cell - 1;
  return dice.find((die) => !die.flag && die.slot === ix);
}

export function findLines(dice: DieValue[]): FormationLine[] {
  const hits: FormationLine[] = [];
  for (const line of FLEET_LINES) {
    const cells = line.idx.map((cell) => boardCell(dice, cell));
    if (cells.some((die) => !die || !die.value)) continue;
    const first = cells[0]!;
    if (!cells.every((die) => die!.value === first.value)) continue;
    hits.push({
      kind: line.kind,
      idx: line.idx.slice(),
      sides: first.sides,
      value: first.value,
      energy: line.kind === "row" ? LINE_ACROSS_ENERGY : 0,
      attack: line.kind === "col" ? LINE_DOWN_ATTACK : 0,
    });
  }
  return hits;
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
  const maxTake = 7;
  const taken = Math.max(
    5,
    Math.min(chosenTake ?? Math.min(best.length, maxTake), best.length, maxTake),
  );
  return {
    ...best,
    taken,
    reward: straightReward(taken, best.biggest),
  };
}

function straightReward(length: number, biggest: DieSize): StraightReward {
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
