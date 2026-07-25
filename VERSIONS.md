# Fleet Dice — playtest versions

**Open `simple.html`.** It is always the newest version, and the version number
shows next to the title so you can never confuse two open tabs.

The numbered files are frozen snapshots. They never change again, so if a new
idea makes the game worse we open the older number and we are back where we were
in one click. Nothing is ever lost by trying something.

---

## How we work

1. You play a few rounds and tell me what feels off.
2. If it's a **number** — run bonuses too small, dice too expensive, opponent too
   strong — you change it yourself in the **Tune** panel, top right. No rebuild
   needed. Tell me what setting felt right and I'll make it the new default.
3. If it's a **rule** — a new mechanic, a different way to score, something the
   game doesn't do yet — I snapshot the current file to the next number, then
   change `simple.html`.

That way the numbers stay in your hands and the rules stay a conversation.

---

## The Tune panel

Eleven settings, all live. Change one, hit **Start a fresh match**, and feel it.
**Reset to defaults** puts everything back.

The two most worth playing with first:

- **Run bonus multiplier** — currently 1, so a run of 3 topping at 6 adds 6 attack.
  Set it to 2 and runs become the whole game. Set it to 0 and see whether the game
  still holds up without them.
- **How fast they grow** — 1 is an even match. Drop it to 0.5 if the opponent is
  running away from you while we're still tuning other things.

---

## Versions

### 01 — the simple core (current)

The game reduced to something you can read at a glance.

- Even numbers are red and are your **attack**. Odd numbers 3 and up are blue and
  are your **shields**. A **1** gives you 2 Energy and does not fight.
- Damage is your attack minus their shields. Extra shields are wasted.
- **Three or more numbers in a row is a Run**, and it adds bonus attack based on
  its highest die — so only bigger dice can reach the bigger runs.
- Two free rerolls a round. **1 Energy nudges a die up or down by one**, which is
  usually how you finish a run.
- Between rounds, Energy buys another die or grows one a size.
- Ten rounds, most total damage wins.

Why the 1 is special: with plain even/odd, red beats blue by 20–50% on every die,
worst on a d4. Pulling the 1 out to be Energy makes the two sides average exactly
the same on every die size. It is the thing holding the whole model up.

Why nudges instead of paid rerolls: buying extra rerolls tested at a 15% win rate
versus 49% for just shopping — a reroll helps one round, a die helps every round
after. Nudges tested at 63%, so the Energy is worth spending.

---

## Known thin spots

Honest list of what I expect you'll notice, so we're looking for the same things:

- **Shields may feel pointless.** All-in defense loses about 93% of the time.
  Leaning attack is close to always right, which means one of your two colors
  isn't really a decision yet.
- **The shop is only two buttons.** Buy a die or grow a die. There's no reason to
  prefer one over the other beyond price.
- **The opponent doesn't think.** It rerolls low dice and grows on a schedule. It
  never reacts to you.
- **Nothing carries between rounds** except your dice and Energy. No damage that
  accumulates, no lasting consequence for a bad round.

---

## Still to come

Multiplayer is deliberately last. Everything about it — sending a link, both
players locking their roll, resolving when the second person submits — sits on
top of the rules. If the one-player game isn't fun, no amount of multiplayer
saves it, and every rule we change now would have to be changed in two places
later.
