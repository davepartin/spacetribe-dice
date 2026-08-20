import assert from "node:assert/strict";
import test from "node:test";
import {
  applyAction,
  boardLabel,
  joinMatch,
  linePrize,
  matchRuleset,
  newMatch,
  previewTally,
  publicMatchView,
} from "../lib/game.ts";

function activeMatch() {
  const state = newMatch("match-1", "4821", "secret", "host-uid", "Ada");
  joinMatch(state, "guest-uid", "Grace");
  return state;
}

test("a match joins without an account profile and gives both fleets a ready first round", () => {
  const state = activeMatch();
  assert.equal(state.status, "active");
  assert.equal(state.players.host.phase, "ready");
  assert.equal(state.players.guest?.phase, "ready");
  assert.equal(state.players.host.round, 1);
  assert.equal(state.players.guest?.round, 1);
  assert.equal(state.players.host.ships.length, 4);
  assert.equal(state.players.guest?.ships.length, 4);
});

test("waiting host can view the room before a guest joins", () => {
  const state = newMatch("match-wait", "1234", "secret", "host-uid", "Ada");
  assert.equal(state.status, "waiting");
  assert.equal(state.players.guest, null);
  const hostView = publicMatchView(state, "host");
  assert.equal(hostView.players.host.name, "Ada");
  assert.equal(hostView.players.guest, null);
});

test("opponent dice remain hidden until you leave the lock-and-wait window", () => {
  const state = activeMatch();
  applyAction(state, "host", { type: "roll", dice: [] });
  applyAction(state, "guest", { type: "roll", dice: [] });
  const hostView = publicMatchView(state, "host");
  assert.equal(hostView.players.host.dice.length, 5);
  assert.equal(hostView.players.guest?.dice.length, 0);
  assert.equal("inviteToken" in hostView, false);

  for (const player of [state.players.host, state.players.guest]) {
    player.dice = player.dice.map((die) => ({ ...die, value: die.flag ? 1 : 1 }));
  }
  applyAction(state, "host", { type: "submit" });
  applyAction(state, "guest", { type: "submit" });
  const revealed = publicMatchView(state, "host");
  assert.ok(["brace", "report"].includes(revealed.players.host.phase));
  assert.ok((revealed.players.guest?.dice.length ?? 0) > 0);
});

test("flagship token rotates once after the first roll and immediately changes the face", () => {
  const state = activeMatch();
  const host = state.players.host;
  applyAction(state, "host", { type: "roll", dice: [] });
  const before = host.flag.face;
  applyAction(state, "host", { type: "flag-token", direction: 1 });
  assert.equal(host.flag.face, before === 6 ? 1 : before + 1);
  assert.equal(host.flag.token, false);
  assert.throws(
    () => applyAction(state, "host", { type: "flag-token", direction: 1 }),
    /already spent/,
  );
});

test("a player can finish brace and settle without waiting for the opponent", () => {
  const state = activeMatch();
  const host = state.players.host;
  const guest = state.players.guest;
  assert.ok(guest);

  applyAction(state, "host", { type: "roll", dice: [] });
  applyAction(state, "guest", { type: "roll", dice: [] });

  host.dice = [
    { id: host.ships[0].id, sides: 4, value: 4 },
    { id: host.ships[1].id, sides: 4, value: 4 },
    { id: host.ships[2].id, sides: 4, value: 4 },
    { id: host.ships[3].id, sides: 4, value: 4 },
    { id: "flag", sides: 6, value: 6, flag: true },
  ];
  guest.dice = [
    { id: guest.ships[0].id, sides: 4, value: 1 },
    { id: guest.ships[1].id, sides: 4, value: 1 },
    { id: guest.ships[2].id, sides: 4, value: 1 },
    { id: guest.ships[3].id, sides: 4, value: 1 },
    { id: "flag", sides: 6, value: 1, flag: true },
  ];

  assert.equal(previewTally(host).attack, 24);
  applyAction(state, "host", { type: "submit" });
  applyAction(state, "guest", { type: "submit" });
  assert.equal(guest.phase, "brace");
  // Host took no volley, so they settle immediately without bracing.
  assert.equal(host.phase, "report");

  applyAction(state, "guest", {
    type: "brace",
    ships: [guest.ships[0].id, guest.ships[1].id],
  });

  assert.equal(guest.report?.soaked, 8);
  assert.equal(guest.ships[0].disabledRound, 2);
  assert.equal(guest.ships[1].disabledRound, 2);
  assert.equal(guest.phase, "report");
  assert.equal(host.phase, "report");
});

test("a commander continues to upgrades alone without waiting on the enemy", () => {
  const state = activeMatch();
  const host = state.players.host;
  const guest = state.players.guest;
  assert.ok(guest);
  applyAction(state, "host", { type: "roll", dice: [] });
  applyAction(state, "guest", { type: "roll", dice: [] });

  for (const player of [host, guest]) {
    player.dice = player.dice.map((die) => ({ ...die, value: die.flag ? 1 : 1 }));
  }
  applyAction(state, "host", { type: "submit" });
  applyAction(state, "guest", { type: "submit" });
  assert.equal(host.phase, "report");
  assert.equal(guest.phase, "report");

  applyAction(state, "host", { type: "continue" });
  assert.equal(host.phase, "shop");
  assert.equal(host.round, 2);
  assert.ok(host.report, "host round summary stays for the enemy to read");
  assert.equal(guest.phase, "report");
  assert.equal(guest.round, 1);
  assert.equal(state.round, 1);

  applyAction(state, "guest", { type: "continue" });
  assert.equal(guest.phase, "shop");
  assert.ok(guest.report, "guest round summary stays until the next roll starts");
  assert.equal(guest.round, 2);
  assert.equal(state.round, 2);
});

test("winner cannot continue while the enemy can still survive the volley", () => {
  const state = activeMatch();
  const host = state.players.host;
  const guest = state.players.guest;
  assert.ok(guest);

  applyAction(state, "host", { type: "roll", dice: [] });
  applyAction(state, "guest", { type: "roll", dice: [] });

  host.dice = [
    { id: host.ships[0].id, sides: 4, value: 4 },
    { id: host.ships[1].id, sides: 4, value: 2 },
    { id: host.ships[2].id, sides: 4, value: 1 },
    { id: host.ships[3].id, sides: 4, value: 1 },
    { id: "flag", sides: 6, value: 1, flag: true },
  ];
  guest.dice = [
    { id: guest.ships[0].id, sides: 4, value: 1 },
    { id: guest.ships[1].id, sides: 4, value: 1 },
    { id: guest.ships[2].id, sides: 4, value: 1 },
    { id: guest.ships[3].id, sides: 4, value: 1 },
    { id: "flag", sides: 6, value: 1, flag: true },
  ];
  guest.hp = 40;

  applyAction(state, "host", { type: "submit" });
  applyAction(state, "guest", { type: "submit" });
  assert.equal(host.phase, "report");
  assert.equal(guest.phase, "brace");
  assert.equal(state.status, "active");

  assert.throws(
    () => applyAction(state, "host", { type: "continue" }),
    /finish taking damage/,
  );
  assert.equal(host.phase, "report");
  assert.equal(state.status, "active");

  applyAction(state, "guest", { type: "brace", ships: [] });
  assert.equal(guest.phase, "report");
  assert.equal(state.status, "active");
});

test("an inescapable kill ends the match during resolve without waiting on the brace screen", () => {
  const state = activeMatch();
  const host = state.players.host;
  const guest = state.players.guest;
  assert.ok(guest);

  applyAction(state, "host", { type: "roll", dice: [] });
  applyAction(state, "guest", { type: "roll", dice: [] });

  host.dice = [
    { id: host.ships[0].id, sides: 4, value: 4 },
    { id: host.ships[1].id, sides: 4, value: 4 },
    { id: host.ships[2].id, sides: 4, value: 4 },
    { id: host.ships[3].id, sides: 4, value: 4 },
    { id: "flag", sides: 6, value: 6, flag: true },
  ];
  guest.dice = [
    { id: guest.ships[0].id, sides: 4, value: 1 },
    { id: guest.ships[1].id, sides: 4, value: 1 },
    { id: guest.ships[2].id, sides: 4, value: 1 },
    { id: guest.ships[3].id, sides: 4, value: 1 },
    { id: "flag", sides: 6, value: 1, flag: true },
  ];
  // The current four-ship maximum brace absorbs 16 of this 20-point hit.
  // Four HP keeps this fixture genuinely inescapable.
  guest.hp = 4;

  applyAction(state, "host", { type: "submit" });
  applyAction(state, "guest", { type: "submit" });
  assert.equal(state.status, "finished");
  assert.equal(state.winner, "host");
  assert.equal(host.phase, "over");
  assert.equal(guest.phase, "over");
  assert.ok(guest.hp <= 0);
});

test("a settled kill ends the match even if the winner already left the report screen", () => {
  const state = activeMatch();
  const host = state.players.host;
  const guest = state.players.guest;
  assert.ok(guest);

  applyAction(state, "host", { type: "roll", dice: [] });
  applyAction(state, "guest", { type: "roll", dice: [] });
  for (const player of [host, guest]) {
    player.dice = player.dice.map((die) => ({ ...die, value: die.flag ? 1 : 1 }));
  }
  applyAction(state, "host", { type: "submit" });
  applyAction(state, "guest", { type: "submit" });
  applyAction(state, "host", { type: "continue" });
  assert.equal(host.phase, "shop");

  // Simulate an older client that continued while the enemy was bracing, then
  // any action re-checks finish and ends the match when death is certain.
  guest.phase = "brace";
  guest.incoming = 80;
  guest.directIncoming = 0;
  guest.hp = 5;
  guest.tally = {
    attack: 0,
    defense: 0,
    energy: 0,
    heal: 0,
    direct: 0,
    ones: 0,
    run: null,
  };
  applyAction(state, "host", { type: "ready" });
  assert.equal(state.status, "finished");
  assert.equal(state.winner, "host");
  assert.equal(host.phase, "over");
  assert.equal(guest.phase, "over");
});

test("inescapable kill ends the match even when both sides still need to brace", () => {
  const state = activeMatch();
  const host = state.players.host;
  const guest = state.players.guest;
  assert.ok(guest);

  applyAction(state, "host", { type: "roll", dice: [] });
  applyAction(state, "guest", { type: "roll", dice: [] });

  // Host lands a huge volley; guest lands a smaller one so BOTH open brace.
  host.dice = [
    { id: host.ships[0].id, sides: 4, value: 4 },
    { id: host.ships[1].id, sides: 4, value: 4 },
    { id: host.ships[2].id, sides: 4, value: 4 },
    { id: host.ships[3].id, sides: 4, value: 4 },
    { id: "flag", sides: 6, value: 6, flag: true },
  ];
  guest.dice = [
    { id: guest.ships[0].id, sides: 4, value: 4 },
    { id: guest.ships[1].id, sides: 4, value: 4 },
    { id: guest.ships[2].id, sides: 4, value: 1 },
    { id: guest.ships[3].id, sides: 4, value: 1 },
    { id: "flag", sides: 6, value: 1, flag: true },
  ];
  // Guest incoming ≈ 18 after their small shields; four d4s soak 16 → 2 left.
  guest.hp = 2;
  host.hp = 40;

  applyAction(state, "host", { type: "submit" });
  applyAction(state, "guest", { type: "submit" });

  assert.equal(state.status, "finished");
  assert.equal(state.winner, "host");
  assert.equal(host.phase, "over");
  assert.equal(guest.phase, "over");
  assert.ok(guest.hp <= 0);
  assert.ok(host.hp > 0);
});

test("repair can keep a brace volley from counting as an inescapable kill", () => {
  const state = activeMatch();
  const host = state.players.host;
  const guest = state.players.guest;
  assert.ok(guest);

  applyAction(state, "host", { type: "roll", dice: [] });
  applyAction(state, "guest", { type: "roll", dice: [] });

  // Host piles on Direct (unblockable). Guest's repair is the only thing that saves them.
  host.dice = [
    { id: host.ships[0].id, sides: 4, value: 2 },
    { id: host.ships[1].id, sides: 4, value: 2 },
    { id: host.ships[2].id, sides: 4, value: 2 },
    { id: host.ships[3].id, sides: 4, value: 2 },
    { id: "flag", sides: 6, value: 2, flag: true },
  ];
  guest.dice = [
    { id: guest.ships[0].id, sides: 4, value: 3 },
    { id: guest.ships[1].id, sides: 4, value: 1 },
    { id: guest.ships[2].id, sides: 4, value: 1 },
    { id: guest.ships[3].id, sides: 4, value: 1 },
    { id: "flag", sides: 6, value: 3, flag: true },
  ];
  // Flag level 1 doubles face-2 Direct (8 from dice + 8 from the face) → 16.
  // Guest heals 5 (ship 3 + face-3 bonus). At 12 HP that leftover is survivable
  // only because of repair; without repair it would end the match.
  guest.hp = 12;

  applyAction(state, "host", { type: "submit" });
  applyAction(state, "guest", { type: "submit" });

  assert.equal(state.status, "active");
  assert.equal(guest.phase, "brace");
  assert.ok((guest.tally?.heal ?? 0) >= 5);
  assert.ok(guest.directIncoming >= 16);
});

test("Fleet Dice 2 three of a kind across pays 5 Energy, any die size", () => {
  const state = newMatch("match-v2", "4821", "secret", "host-uid", "Ada", "v2");
  joinMatch(state, "guest-uid", "Grace");
  const host = state.players.host;
  host.dice = [
    { id: host.ships[0].id, sides: 4, value: 4, slot: 0 },
    { id: host.ships[1].id, sides: 8, value: 4, slot: 1 },
    { id: host.ships[2].id, sides: 10, value: 4, slot: 2 },
    { id: host.ships[3].id, sides: 4, value: 1, slot: 3 },
    { id: "flag", sides: 6, value: 1, flag: true },
  ];
  const classic = previewTally(host);
  const v2 = previewTally(host, undefined, "v2");
  assert.equal(linePrize("row"), 5);
  assert.equal(linePrize("col"), 10);
  assert.equal(classic.lines?.length ?? 0, 0);
  assert.equal(v2.lines?.length, 1);
  assert.equal(v2.lines?.[0]?.energy, 5);
  assert.equal(v2.lines?.[0]?.attack, 0);
  assert.equal(v2.energy, classic.energy + 5);
  assert.equal(v2.attack, classic.attack);
});

test("Fleet Dice 2 three of a kind down pays 10 Attack, any die size", () => {
  const state = newMatch("match-v2-col", "4821", "secret", "host-uid", "Ada", "v2");
  joinMatch(state, "guest-uid", "Grace");
  const host = state.players.host;
  host.dice = [
    { id: "a", sides: 4, value: 2, slot: 0 },
    { id: "b", sides: 6, value: 1, slot: 1 },
    { id: "c", sides: 4, value: 3, slot: 2 },
    { id: "d", sides: 8, value: 2, slot: 3 },
    { id: "e", sides: 4, value: 5, slot: 4 },
    { id: "f", sides: 10, value: 2, slot: 5 },
    { id: "flag", sides: 6, value: 6, flag: true },
  ];
  const classic = previewTally(host);
  const v2 = previewTally(host, undefined, "v2");
  assert.equal(v2.lines?.length, 1);
  assert.equal(v2.lines?.[0]?.kind, "col");
  assert.equal(v2.lines?.[0]?.attack, 10);
  assert.equal(v2.lines?.[0]?.energy, 0);
  assert.equal(v2.attack, classic.attack + 10);
});

test("Fleet Dice 2 lets you unlock slot 6, 7, 8 or 9", () => {
  const state = newMatch("match-v2-slot", "1111", "secret", "host-uid", "Ada", "v2");
  joinMatch(state, "guest-uid", "Grace");
  const host = state.players.host;
  host.phase = "shop";
  host.energy = 40;
  applyAction(state, "host", { type: "shop", operation: "slot", slotIndex: 6 });
  assert.equal(host.open?.[6], true);
  assert.equal(host.slots, 5);
  assert.equal(boardLabel(6), 8);
  applyAction(state, "host", { type: "shop", operation: "slot", slotIndex: 4 });
  assert.equal(host.open?.[4], true);
  assert.equal(host.slots, 6);
  assert.equal(boardLabel(4), 6);
  assert.throws(
    () => applyAction(state, "host", { type: "shop", operation: "buy", sides: 6 }),
    /Tap a free slot/,
  );
  applyAction(state, "host", { type: "shop", operation: "buy", sides: 6, slotIndex: 6 });
  assert.equal(host.ships.at(-1)?.slot, 6);
  assert.equal(host.ships.at(-1)?.sides, 6);
});

test("Fleet Dice 1 still unlocks the next slot in order", () => {
  const state = newMatch("match-classic-slot", "2222", "secret", "host-uid", "Ada");
  joinMatch(state, "guest-uid", "Grace");
  const host = state.players.host;
  host.phase = "shop";
  host.energy = 20;
  applyAction(state, "host", { type: "shop", operation: "slot" });
  assert.equal(host.slots, 5);
  assert.equal(host.open, undefined);
  applyAction(state, "host", { type: "shop", operation: "buy", sides: 4 });
  assert.equal(host.ships.at(-1)?.slot, undefined);
});

test("old rooms without a ruleset stay Fleet Dice 1", () => {
  const state = newMatch("match-old", "3333", "secret", "host-uid", "Ada");
  delete state.ruleset;
  joinMatch(state, "guest-uid", "Grace");
  assert.equal(matchRuleset(state), "classic");
  assert.equal(state.players.guest?.open, undefined);
  const host = state.players.host;
  host.phase = "shop";
  host.energy = 20;
  applyAction(state, "host", { type: "shop", operation: "slot" });
  assert.equal(host.slots, 5);
});
