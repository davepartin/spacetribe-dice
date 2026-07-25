# Playing the Fleet Dice prototype

```bash
cd spacetribe-dice
python3 -m http.server 4173
```

Open **http://localhost:4173/fleet-dice.html** — on your phone too, if it's on the same wifi, using your Mac's local IP instead of `localhost`.

Eight rounds against an admiral bot. Everything the design doc describes is live except the async multiplayer layer.

---

## Reading a ship

Each card is one ship. The shape tells you the hull — triangle d4, square d6, diamond d8, pentagon d10 — and the big number is what it just rolled, colored by what that face does.

The little row underneath is the whole die. Every face, in order, in its symbol's color. That strip is how you decide whether a reroll is worth it: if you're showing a 2 on a die whose other faces are three Lasers and a 9, reroll it. If the rest of the die is junk, keep what you have.

- **Purple dot** on a face — that face pays Energy. Only the low half of any die does.
- **Gold corner** — a face you paid to re-symbol. This is what an enemy Scar takes away.
- **Red bar** under the card — Stress. When it fills, the ship sits out a round.

Red is Laser, orange is Missile, blue is Shield, green is Flak, gold is Wild.

---

## The loop

**Yard** — spend Energy. Commission hulls, Size Up, re-symbol faces, install and level Protocols. You start with 3 Energy, which is deliberately not quite enough for anything, so round one is about deciding what you're saving toward.

**Roll** — tap ships to select, then Reroll. Two rerolls are free every round; after that each one costs 1 Energy that would otherwise have bought a ship. Watch the Formations panel fill in as you shape.

**Submit** — the admiral rolls, both volleys resolve simultaneously, and the report tells you what happened.

---

## What to try first

The fastest way to feel whether the core works is to play the same eight rounds twice with opposite Protocols.

**Run one — Broadside.** Leave the defaults. Rush damage. You'll notice Runs are where your points come from and that you start wanting a d6 badly, because a fleet of d4s can only ever roll a Tier I Run.

**Run two — Shipwright and Aegis.** Install Shipwright in the Run slot and Aegis nowhere near it, then try to reach a d10 by round five. Completely different game from the same dice.

**Run three — Fire Control.** Install it in the Set slot and level it twice. Chase Triads instead of Runs. Getting a Stun off feels good; getting to Level 3 and landing a Breach on the admiral's d10 is the thing the whole game is built around, and it should feel earned rather than lucky.

---

## What the bots found, so you know where to look

Five loadouts, 300 matches each pairing, after tuning:

| Loadout | Win rate |
| --- | ---: |
| Resonance / Broadside | 50.7% |
| Cascade / Shipwright | 43.0% |
| Cascade / Aegis | 42.8% |
| Fire Control / Shipwright | 36.8% |
| Resonance / Aegis | 36.3% |

Close enough to play, not close enough to call balanced. Three things I'd watch while you play, because the bots are too dumb to test them properly:

1. **Is the reroll decision actually hard?** The whole face model is built to make it so. If you find yourself always rerolling anything under 5 without thinking, the Energy ramp is too weak and needs steepening.
2. **Does the d4 → d6 jump feel like a relief?** It should — it's the moment Tier II Runs open up. If it feels like nothing, Size Up is priced wrong.
3. **Does losing a face to a Scar hurt the right amount?** It should sting for two rounds and then be recoverable.

---

## Known rough edges

- Re-symboling a face uses a text prompt (`4 laser`). Crude, but it works; a proper face picker comes with the real UI pass.
- Wilds are auto-assigned to whatever your fleet already leans toward. Choosing them yourself is a real decision the prototype isn't giving you yet.
- Formations are chosen greedily by value. Usually right, occasionally you'll spot a better partition than the engine picked.
- The admiral bot buys and upgrades on a fixed schedule and never reads your fleet.
- Overcharge faces exist in the engine but aren't purchasable in this UI yet.

---

## Ideas to bring back from a session

The next things worth designing are exactly what you said — weapons, power, and how they grow. A few open threads the prototype should make concrete:

- Should Protocols be swappable mid-match, or locked once chosen?
- Should re-symboling be limited per round, so fleets change shape gradually rather than all at once?
- Does the game want a fourth Formation type, or is three the right ceiling for a phone screen?
- Where does the team layer's Joint Formation get declared — before the roll, or after?
