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

- **Straight bonus multiplier** — currently 1, so a d6 straight of three adds 6.
  Set it to 2 and straights become the whole game. Set it to 0 and see whether the
  game still holds up without them.
- **Energy from rolling a 2** — currently 1. Set it to 0 to feel version 01 again,
  or 2 if Energy feels too tight.
- **How fast they grow** — 1 is an even match. Drop it to 0.5 if the opponent is
  running away from you while we're still tuning other things.

---

## Versions

### 04 — the flagship you design (current)

Your fleet now sits in a 3×3 grid with a **flagship in the centre**. It has six
faces, and unlike every other ship those faces are **panels you choose** rather
than numbers. One fires each round.

This is where all the interesting choices now live, and that is the point: the
other eight ships stay plain numbered dice, so the board is still readable at a
glance while the game gained a whole layer.

**The six starting panels all help the rest of the fleet**, so building ships and
building your flagship pull in the same direction instead of competing:

| Panel | Effect |
| --- | --- |
| Signal | every red die hits for 1 more |
| Screen | every blue die holds for 2 more |
| Tender | gain 2 Energy |
| Relay | one extra reroll this round |
| Vanguard | your straight pays its biggest ship again |
| Salvo | a straight 4 attack, no strings |

Later, a **panel store** sells stronger versions for Energy — Signal Array,
Aegis Net, Reactor Core, Overhaul, Battle Line, Broadside.

Two rules keep it honest:

- **No more than 2 of any panel.** With one face showing per roll, your expected
  value is just the average of your six, and the average is always maximised by
  six copies of the best one. Testing confirmed it: all-Battery beat a balanced
  mix at the same cost. A cap forces a real combination.
- **Nothing multiplies.** A ×2 attack panel tested 40% ahead of a flat one early
  and 69% ahead by mid-game, because multipliers grow with everything you build.
  Per-die support panels grow too, but they stop at your slot count.

The flagship burns fuel like any capital ship, and its faces are panels rather
than numbers — **so it cannot join a straight.** That is the price of the most
powerful ship on the board.

Balance after tuning: the six starters sit within 1.47× of each other, the store
within 1.67×.

Also fixes a v03 bug where the roll screen still counted unfuelled ships in your
totals. The battle maths was always right; the preview was not.

---

### 03 — big ships burn fuel

The dice-building spine. Before this, there was no reason to ever keep a small
ship — a d10 was simply a better d4, so the shop had no tension and the right
play was always "buy the biggest thing you can."

The Dominion comparison shows why. Copper actively hurts you: it clogs your
draw. A d4 didn't hurt, it was just weaker. No dilution, no decision.

I tested four ways to fix it. Making only small ships generate Energy barely
moved the needle — the difference is too small to matter. What works is
**upkeep**: big ships burn Energy every round just to launch.

Nine-slot fleets, with Energy recycled into nudges:

| Fleet | Attack |
| --- | ---: |
| 9 × d4 | 30.8 |
| 4 d4 + 3 d6 + 2 d8 | 57.7 |
| **3 d4 + 3 d6 + 2 d8 + 1 d10** | **63.3** |
| 2 d4 + 2 d6 + 2 d8 + 3 d10 | 49.2 |
| 9 × d10 | **0** — never launches |

The best fleet is a flagship inside a screen of small ships, which is both a real
decision and the right picture. Your capital ship count is limited by how many
little ones are feeding it.

Changes:

- **Nine slots**, a 3×3 fleet.
- **A d10 burns 1 Energy every round.** d4, d6 and d8 are free. Unfuelled ships
  are greyed out and sit the round out entirely — they don't attack, don't
  shield, and can't join a straight.
- Fuel is paid before you roll, biggest ships first.
- The dock shows your fuel burn; the shop warns you before a growth raises it.

Both upkeep numbers are Tune settings. Set the d10 cost to 0 to feel version 02.

---

### 02 — straights named after ships, Energy on the 2

What changed from 01:

- **The 1 keeps its number**, shown in white with two lightning bolts under it.
  It still doesn't fight, but it reads as a die face rather than a symbol.
- **The 2 now pays 1 Energy and still attacks.** That is the roll that used to be
  a dud and now isn't. It adds 50% to Energy income at every die size, and it
  makes a 2 worth about the same as a 4 once you value Energy at roughly 2 attack
  — so keeping a low die became a real decision instead of an obvious no.
- **Straights are named after the biggest ship in them**, not the highest number.
  Three d4s rolling 2-3-4 is a **d4 straight** worth 4. Swap one for a d10 and the
  same numbers become a **d10 straight** worth 10. Your big ships now lift a low
  straight just by joining it, which is the ships-working-together idea.
- Bonus is now `biggest ship × (length − 2) × multiplier`.

When we name the fleet, these become Scout straights, Cruiser straights and so on
— the mechanic is already shaped for it.

---

### 01 — the simple core

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
