import assert from "node:assert/strict";
import test from "node:test";
import {
  applyAction,
  joinMatch,
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

test("flagship token rotates once after roll three and immediately changes the face", () => {
  const state = activeMatch();
  const host = state.players.host;
  applyAction(state, "host", { type: "roll", dice: [] });
  const ids = host.dice.map((die) => die.id);
  applyAction(state, "host", { type: "roll", dice: ids });
  applyAction(state, "host", { type: "roll", dice: ids });
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
  guest.hp = 5;

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
