# Where do you point your guns?

Three ideas that turn out to be one idea: **targeting**, **a flagship with hit
points**, and **health on the 3**. Together they'd change Fleet Dice from a
scoreboard into a fight, and they'd finally answer the question that has been
open since v07 — what a defensive round earns you.

Everything below was measured against a model of the current rules. The bots are
heuristics, not good players, so read the percentages as directions.

---

## 1 · The ships already have roles — we just never let you shoot them

You asked whether someone could say *"tonight I want to cripple their energy"*
and go after the support ships instead of the flagship. The good news is the
dice already sort themselves into economy and guns without a single new rule:

| Ship | Attack / round | Shields / round | Energy / round | Share of its value that is Energy |
| --- | ---: | ---: | ---: | ---: |
| d4 | 1.50 | 1.00 | **0.75** | **38%** |
| d6 | 2.00 | 1.50 | 0.50 | 22% |
| d8 | 2.50 | 2.00 | 0.38 | 14% |
| d10 | 3.00 | 2.50 | 0.30 | 10% |

A d4 is a fuel tanker — nearly two fifths of what it gives you is Energy, because
it rolls a 1 or a 2 half the time. A d10 is a gun. So "go for the economy" means
*shoot their small ships*, and "go for the heavies" means *shoot their big ones*,
and both sentences are already true. Nothing needs inventing.

---

## 2 · The trap: destroying ships is wildly overpowered

I built it the obvious way first — a ship dies when it takes damage equal to what
it cost, so a d4 dies to 4 and a d10 to 13.

| Strategy | Wins | Victim's fleet at the end |
| --- | ---: | ---: |
| Shoot the economy vs shoot the flagship | **83.8%** | **0.9 ships left** |
| Shoot the heavies vs shoot the flagship | 65.9% | 3.1 ships left |

An 84% win rate, and the loser finishes with less than one ship. That's the death
spiral: fewer ships means less Energy means fewer ships. Once it starts, nothing
stops it.

The reason is a ratio worth remembering. **A d4 costs 4 to kill and produces
about 4 a round for the rest of the match.** Kill it in round three and you spent
4 damage to erase 28 points of value. No price fixes a seven-to-one return.

I tried the obvious brakes and they all failed in one direction or the other:

| Fix | Economy-shooting wins | Verdict |
| --- | ---: | --- |
| Naive — a ship dies at its price | 83.8% | Broken |
| Only one ship may be hit per round | 75.7% | Still broken |
| Refund half the price as salvage | 69.7% | Still broken |
| Hulls cost 2× price | 32.3% | Now it's not worth doing |
| Ships are disabled for one round | **0.7%** | Completely worthless |

That last row is the interesting failure. Spending your entire round's damage to
switch off one ship for one round is a terrible trade, so nobody would ever do
it. Destroy is far too strong and stun is far too weak, and the honest answer is
somewhere in the gap.

---

## 3 · What works: crippled, not destroyed

Hull equals the ship's price — so a d4 still falls to 4 damage — but **a hit ship
is out for three rounds and then comes back.**

| | A: flagship | A: economy | A: heavies |
| --- | ---: | ---: | ---: |
| **B: flagship** | 50.2% | 53.4% | 41.7% |
| **B: economy** | 47.5% | 50.4% | 57.4% |
| **B: heavies** | 57.6% | 42.7% | 49.9% |

Nothing above 58%, nothing below 42%, and each column beats one other column and
loses to another — a soft rock-paper-scissors rather than a dominant line. That's
a real decision every round.

It's also the better story. The ship isn't vaporised, it's **crippled and under
repair**, limping back three rounds later — and the game already knows how to
draw that, because docked ships go grey today.

**Where the fantasy lands:** knock out two d4s in round four and they lose about
1.5 Energy a round for three rounds. They can't buy the d8 they were saving for.
That's *tonight I'm crippling your economy*, and it's recoverable, which is what
keeps someone playing on Thursday after a bad Wednesday.

---

## 4 · The flagship's hit points

With both players aiming at each other's flagship and no healing:

| Starting HP | Matches ending with a flagship destroyed |
| ---: | ---: |
| 40 | 97% |
| 60 | 82% |
| 80 | 53% |
| 100 | 23% |

Without healing, 80 is the number that makes both endings live. With healing it
changes completely — see below.

---

## 5 · Health on the 3 — the best idea in this batch

Your proposal: **three light-green crosses under the 3, on every die.** Not
Energy. A separate thing that heals your flagship.

It's right for reasons beyond the theme:

**It gives the low faces a full vocabulary.** The 1 pays two Energy, the 2 pays
one, and now the 3 pays three Health. Every die in the game already has a 1, a 2
and a 3, so the rule needs no exceptions and no ship is left out — the same
property that made the Energy rule work.

**It finally makes a defensive round pay.** This has been the biggest hole in the
game since v07: shields evaporate, damage compounds, so nobody builds defense.
Health fixes it in the cleanest possible way, because **the 3 is a blue face** —
it blocks *and* it heals. A defensive round is no longer a round you survived; it
is a round you gained something in.

**And overhealing isn't wasted**, as long as the tiebreak is highest flagship
health. Every point of Health is score. That's the property surplus shields never
had, and it's why this solves the problem that Charge and Counterfire were
invented to solve — with one symbol instead of a subsystem.

**It's a genuinely hard reroll.** You're staring at a 3. Keep it and take 3
shields plus 3 Health, or push it to a 4 for the attack? That's the same shape as
the choice between a 1 and a 2, which is the decision the whole face model was
built around.

### The number needs care

I expected health on the 3 to break the ship ladder, because a d4 shows a 3 a
quarter of the time and a d10 only a tenth. It doesn't — but it does something
else:

| Heal per 3 | A swarm of d4s beats a balanced fleet | Matches ending in a kill | Average finishing HP |
| ---: | ---: | ---: | ---: |
| 0 | 0.1% | 43% | 8 |
| 1 | 0.2% | 21% | 22 |
| 2 | 0.7% | 10% | 38 |
| **3** | 1.6% | **4%** | 56 |

Small ships gain sixteen times more from healing than they do without it, but
from such a low base that the ladder survives. *(Caveat: my swarm bot stops
spending once its slots are full, so it's a weak opponent — treat "the swarm
loses" as unproven rather than settled.)*

The real problem is the last two columns. **At 3 Health per 3 and 100 starting
HP, only 2–4% of matches end with a flagship destroyed.** Healing outruns damage
and "blow up their flagship" stops being a real ending.

| Starting HP | Kills, at heal 3 |
| ---: | ---: |
| 60 | 21% |
| 80 | 7% |
| 100 | 2% |
| 120 | 0% |

**Recommendation: keep +++ as you drew it and start the flagship at 60.** About
one match in five ends in a kill, the rest on health — so destroying a flagship
stays a story rather than a routine, and both of your endings are live. If it
still feels too safe once you've played it, the dial to turn is starting HP, not
the crosses.

---

## 6 · Fitting it together

The three ideas reinforce each other, and they arrive in an order:

1. **Health on the 3**, with the flagship at 60 HP and highest health winning.
   Smallest change, biggest payoff — it fixes defense, gives you a second
   currency without inventing one, and adds a real reroll decision. Nothing else
   here depends on targeting existing.
2. **Then targeting**, with crippled-for-three-rounds. This is the first mechanic
   in the game that reaches across and touches the opponent, which DECISIONS.md
   has been calling the biggest gap since we wrote it.
3. **Then the healing target.** Once both exist, a fourth option appears on its
   own: shoot the ships that are *healing* them. The d4s are the fuel, the guns,
   and the medics all at once, which makes them the natural target and gives
   small ships a reason to be protected rather than just spammed.

And the rocket, already built, becomes what it always wanted to be: **a nuke
aimed at a base with hit points.**

---

## 7 · Still open

- **The Energy cap.** Building the rocket did *not* solve it — end-of-match
  banked Energy barely moved (13.5 → 13.6), because you spend 20 once and then
  keep accumulating. See PANELS.md; a cap is a price ceiling and the live range
  is narrow.
- **Do shields protect specific ships, or the whole fleet?** Everything above
  assumes shields subtract from the incoming total and the attacker aims what
  gets through. Letting the defender assign shields per ship would be a second
  blind decision each round — possibly great, possibly too much.
- **A second commodity.** You asked whether we'd need one. I don't think so any
  more: Health *is* the second commodity, and it arrived attached to a face we
  already had.

---

## 8 · Dropping the round limit

*"What if we didn't end in rounds — most of these card games ramp up until
someone finally wins."*

**It works, and the main worry doesn't happen.** I ran matches with no cap at
all, at every healing value from 0 to 5 and starting HP from 60 to 150:

> **Not one match in 54,000 failed to end.** Zero stalemates, everywhere.

The reason is built into the dice. Attack scales with fleet quality — a d10 hits
for 3 a round against a d4's 1.5 — while **healing per die shrinks as your ships
get bigger**, because a d4 shows a 3 a quarter of the time and a d10 only a
tenth. So the longer a match runs, the more the fleets out-grow the healing. The
ramp you wanted is already in the maths; we don't have to add anything.

### How long a match runs (health 3 on every 3)

| Starting HP | Fastest 10% | Median | Slowest 10% | Longest seen |
| ---: | ---: | ---: | ---: | ---: |
| 30 | 6 | 8 | 12 | 21 |
| 40 | 7 | **10** | 14 | 24 |
| 50 | 8 | **11** | 15 | 24 |
| 60 | 9 | 12 | 16 | 23 |
| 100 | 12 | 16 | 20 | 30 |

**Starting HP is now the length dial.** 40–50 gives a median of 10 or 11 rounds,
which is almost exactly the game we already have — so nothing about the pacing
has to change, we just stop counting.

### The one real risk: the tail

A median of 11 is fine. The slowest tenth running 15 rounds is fine. But six
friends playing a round a day means **the longest matches are three and a half
weeks**, and that's where someone stops answering.

A small escalation rule fixes the tail without touching a normal game:

| Rule | Median | Slowest 10% | Longest |
| --- | ---: | ---: | ---: |
| None | 12 | 16 | 23 |
| +1 damage a round after round 8 | 12 | 14 | 20 |
| **+2 damage a round after round 8** | 11 | **13** | **18** |
| +3 damage a round after round 10 | 12 | 14 | 17 |

+2 after round eight moves the median by one round and cuts the worst case from
23 to 18. Thematically it's the war escalating — both sides stop holding back.

### What we'd give up

**The deadline.** Right now "it's round eight, I have to swing *now*" is real
pressure, and it's exactly what makes the Rocket's timing a test worth failing.
With no fixed end, every purchase might still have five rounds to pay off, so the
sharp late-game reckoning softens. That's a loss as well as a gain.

**And a correction to something I said earlier.** I expected dropping the round
limit to revive the dead late-game shipyard. It doesn't — Energy left over at the
end went 13.4 to 14.1, essentially unchanged. Looking closer, that 13.5 was never
a war chest: **it's float, the remainder that's never quite enough for the next
thing you want.** Which means an Energy carry cap around 15–20 would sit right on
top of normal pocket change and mostly create noise. The cap is probably solving
a problem we don't have.
