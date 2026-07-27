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
  assert.equal(state.players.host.ships.length, 4);
  assert.equal(state.players.guest?.ships.length, 4);
});

test("waiting host can view the room before a guest joins", () => {
  const state = newMatch("match-wait", "1234", "secret", "host-uid", "Ada");
  assert.equal(state.status, "waiting");
  assert.equal(state.players.guest, undefined);
  const hostView = publicMatchView(state, "host");
  assert.equal(hostView.players.host.name, "Ada");
  assert.equal(hostView.players.guest, undefined);
});

test("opponent dice remain hidden until the round is revealed", () => {
  const state = activeMatch();
  applyAction(state, "host", { type: "roll", dice: [] });
  applyAction(state, "guest", { type: "roll", dice: [] });
  const hostView = publicMatchView(state, "host");
  assert.equal(hostView.players.host.dice.length, 5);
  assert.equal(hostView.players.guest?.dice.length, 0);
  assert.equal("inviteToken" in hostView, false);
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

test("multiple ships can absorb a volley and are damaged for the next round", () => {
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

  applyAction(state, "guest", {
    type: "brace",
    ships: [guest.ships[0].id, guest.ships[1].id],
  });
  if (host.phase === "brace") {
    applyAction(state, "host", { type: "brace", ships: [] });
  }

  assert.equal(guest.report?.soaked, 8);
  assert.equal(guest.ships[0].disabledRound, 2);
  assert.equal(guest.ships[1].disabledRound, 2);
  assert.equal(guest.phase, "report");
});

test("both commanders continue before round two upgrades open", () => {
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
  assert.equal(state.round, 1);
  applyAction(state, "guest", { type: "continue" });
  assert.equal(state.round, 2);
  assert.equal(host.phase, "shop");
  assert.equal(guest.phase, "shop");
});
