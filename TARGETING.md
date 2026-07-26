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

---

## 9 · Settling the swarm question

Section 5 left this unproven because my swarm bot was weak. Re-run against the
**real v21 build** — real dice, real straights, three rolls a round, both sides
buying, healing and escalation on:

| Match | Swarm wins |
| --- | ---: |
| Eight d4s, never upgrading, vs a fleet that upgrades | **1.6%** |
| Same match with the sides swapped | **2.0%** |
| Upgrade vs upgrade (control) | 50.3% |
| Swarm vs swarm (control) | 49.7% |

**You cannot win with eight d4s.** Both orderings agree and both controls sit on
50%, so it isn't a bug in the harness.

The reason is that **slots are the limit, not money.** Per Energy spent a d4 is
easily the best buy — 1.19 a round against a d10's 0.49 — but you only have eight
slots, and once they're full the only number that matters is value *per slot*:

| Ship | Attack | Shields | Energy | Health | Worth per round |
| --- | ---: | ---: | ---: | ---: | ---: |
| d4 | 1.50 | 1.00 | 0.75 | 0.75 | 4.75 |
| d6 | 2.00 | 1.50 | 0.50 | 0.50 | 5.00 |
| d8 | 2.50 | 2.00 | 0.38 | 0.38 | 5.63 |
| d10 | 3.00 | 2.50 | 0.30 | 0.30 | **6.40** |

### The surprise: healing *hurts* the swarm

I expected health on the 3 to help small ships, since a d4 shows a 3 a quarter of
the time and a d10 only a tenth. It does the opposite:

| Heal per 3 | Swarm wins | Average match |
| ---: | ---: | ---: |
| 0 | **9.2%** | 8.7 rounds |
| **3 (current)** | **1.7%** | 12.4 rounds |
| 6 | 3.3% | 17.2 rounds |
| 10 | 37.8% | 24.8 rounds |
| 15 | 94.9% | 31.2 rounds |

Healing makes matches longer — 8.7 rounds to 12.4 — and **long matches favour the
fleet that upgrades**, because the upgrade curve compounds while the swarm's
advantage was only ever early tempo. Health takes away the fast kill that was the
swarm's single best path. It would take a heal of about 10 before small ships
came back, which is more than three times what we're running.

### What *is* true about the 3

It's now the best face on a small die:

| Die | Face values (1 Energy = 2, 1 Health = 1) |
| --- | --- |
| d4 | 1 = 5, 2 = 4, **3 = 6**, 4 = 4 |
| d6 | 1 = 5, 2 = 4, **3 = 6**, 4 = 4, 5 = 5, **6 = 6** |
| d10 | 3 = 6, and every face from 7 up beats it |

On a d4 the 3 is outright best; on a d6 it ties the top face. That's a real
statement about the game — on a cheap ship your *middle* face is the jackpot —
but it isn't a balance problem, and it's flattered by the arithmetic anyway:
surplus shields are still wasted while health never is, so the 3's true worth
sits somewhere between 3 and 6 depending on what's incoming.

---

## 10 · Buy order, and whether a cheap wide fleet can ever win

Two questions, and the answers turned out to be linked.

### Is it best to fill all eight slots with d4s first?

**It makes no difference.** Four buy orders, measured head to head against each
other in the real build:

| | vs rush d4s | vs biggest affordable | vs never buy small | vs only d10s |
| --- | ---: | ---: | ---: | ---: |
| **Rush eight d4s, then upgrade** | — | 50.1% | 60.4% | 93.0% |
| **Buy the biggest you can afford** | 48.2% | — | 59.4% | 92.6% |
| **Never buy small ships** | 39.3% | 40.6% | — | 88.2% |
| **Save for d10s only** | 7.5% | 8.0% | 12.0% | — |

Rushing cheap hulls and buying the best you can afford are **within noise of each
other** — 50.1 against 48.2. Both are correct. What's wrong is *refusing* to buy
small: holding out for quality loses 60/40, and saving for d10s loses 92/8.

So the shipyard has one trap and two right answers, which is a healthy shape.
**Fill your slots. How you fill them is taste.**

### But you must diversify sizes — and here's why

A cheap wide fleet is not a viable path, and the reason is structural rather
than a matter of tuning:

> **A d4 only carries the numbers 1, 2, 3 and 4. Eight of them cover four
> values, so the longest straight they can physically make is four — which pays
> Energy only.**

| Fleet | Longest straight possible | Straight income per round |
| --- | ---: | ---: |
| Eight d4s | **4** | 6.71 |
| 4d4 2d6 2d8 | 8 | **16.32** |
| 2d4 2d6 2d8 2d10 | 8 | **18.47** |

The swarm earns a third of what a mixed fleet earns from straights, and straights
are the engine of the game. Worse, it's penalised twice: the reward also scales
with the biggest ship in the straight, so even a *long* d4 straight pays 4× its
length rather than 10×.

### Three attempted fixes, all of which failed

| Fix | Swarm wins | Why it failed |
| --- | ---: | --- |
| Medical Bay (+2 health per 3) | 2.1% → **1.7%** | Healing lengthens matches, and long matches favour whoever is growing |
| All Hands (+N attack per ship) | 36% at N=2 | But it lifted the *upgrading* fleet to 75% — both fleets fill eight slots, so ship count doesn't distinguish them |
| Wolfpack (straight scores as 3 longer) | **11.4%** | A d4 straight still pays 4× its tier, not 10× |

**So Fleet Dice currently has one path — grow your ships — with two equally good
ways to walk it.** That isn't a bug; it falls directly out of "a straight's
strength comes from the biggest ship taking part," which is a rule we like.

The honest conclusion is that **fleet composition is the wrong place to look for
alternate paths.** Targeting is the right place, because choosing whether to
shoot a flagship, an economy or a heavy adds decisions that don't fight the
core scaling rule. Sections 1–3 above.

### Should health be 2 instead of 3?

It costs about **one round of match length per point of healing**, and nothing
else:

| Heal per 3 | Match length | Ends in a kill | Swarm wins |
| ---: | ---: | ---: | ---: |
| 1 | 9.3 rounds | 100% | 4.4% |
| 2 | 10.2 rounds | 100% | 2.8% |
| **3** | **11.1 rounds** | 100% | 1.8% |
| 4 | 12.0 rounds | 100% | 1.2% |

Every setting still ends in a destroyed flagship, so it isn't a safety question.
**Keep 3** unless matches start to feel long — and if they do, 2 is a one-round
saving, not a rebalance.

---

## 11 · When both flagships die in the same volley

You were right that this needed solving, and it's much more common than it
sounds. Everyone fires at once across the galaxy, so nobody knows they've won
until the salvos land — and **18.9% of matches end with both flagships
destroyed.** Near enough one in five. That's not an edge case.

| Starting HP | Both flagships die |
| ---: | ---: |
| 40 | 18.9% |
| **60** | **18.9%** |
| 80 | 19.6% |

Interestingly it barely moves with hit points, because it's really a property of
how evenly matched the two damage curves are, not of how much health is on the
table.

### The cascade

1. **The heavier final volley wins.** Decided by the round you both just
   watched, which makes it legible and dramatic — and it means someone who was
   losing can steal the whole match with one enormous last salvo. That's the
   screenshot.
2. **Then damage across the whole match.** The final volleys come out level only
   4.7% of the time, so this almost always settles it, and it rewards the player
   who was ahead all along.
3. **Then a genuine mutual destruction.** Both flagships gone, volleys level,
   and not a point between them across the whole match. That lands in roughly
   **1 match in 5,000** — rare enough to be a story in itself.

I chose the volley over total damage as the first tiebreak because it's decided
by what's on screen in front of you rather than by a running total, and because
"he was dead anyway and still hit me for 33" is a better sentence than "he had
more cumulative damage."

---

## 12 · Balancing the four level-1 flagship panels

One panel per thing the game is made of — **attack, shields, health, Energy** —
and each round you find out which of the four your flagship is enhancing.

Balanced by playing each panel on all six faces against each of the others,
15,000 matches a pairing, in the real build:

| | Attack | Shields | Repair | Energy |
| --- | ---: | ---: | ---: | ---: |
| **Attack** | — | 50% | 51% | 46% |
| **Shields** | 51% | — | 48% | 56% |
| **Repair** | 49% | 53% | — | 57% |
| **Energy** | 54% | 44% | 44% | — |

Every pair lands between 44% and 57%, which is about as level as whole numbers
allow.

### The four

| Panel | Level 1 |
| --- | --- |
| **Attack** | Every red die hits for **1 more**, and **+2 attack** |
| **Shields** | Every blue die holds for **1 more**, and **+3 shields** |
| **Repair** | Every **3** heals **4 more** |
| **Energy** | **+3 Energy** |

### Two things the numbers insisted on

**Shields need more than attack, even though they fire equally often.** Red and
blue faces come up almost exactly as much — 4.09 against 3.91 on a mid fleet — so
"+1 a die" ought to be even money. It isn't: at equal rates attack beat shields
**57/43**, because surplus attack still counts and surplus shields are thrown
away. That's why the shield panel carries +3 flat against attack's +2. It's the
same asymmetry that has been dogging defence since v07, and here it's paid for
explicitly instead of being ignored.

**Healing fades as your fleet grows, exactly as you predicted.** Threes per round:

| Fleet | 3s a round | What Repair pays |
| --- | ---: | ---: |
| Starting four d4s | 1.21 | 4.9 |
| Mid — 4d4 2d6 2d8 | 1.53 | **6.1** |
| Late — 2d4 2d6 2d8 2d10 | 1.08 | 4.3 |
| Capital — eight d10s | 0.69 | 2.8 |

So Repair peaks at mid-game and quietly becomes the weakest of the four once
you're flying d10s. I'd keep that rather than fix it: **the panel you want in
round two isn't the one you want in round nine**, which gives the flagship shop
a reason to exist beyond raw upgrades.

Here's the same thing for all four, which is the clearest picture of the set:

| Fleet | Attack | Shields | Repair | Energy |
| --- | ---: | ---: | ---: | ---: |
| Start — 4× d4 | 4.0 | 5.0 | 4.9 | 6.0 |
| Mid — 4d4 2d6 2d8 | 6.1 | 6.9 | 6.1 | 6.0 |
| Late — 2d4 2d6 2d8 2d10 | 6.2 | 6.8 | 4.3 | 6.0 |

*(Energy valued at 2 a point, which is what it converts to in ships over a match.)*

Energy is flat by nature, so it's the strongest of the four on turn one and the
most ordinary later — the mirror image of Repair. Attack and Shields both grow
with the fleet, which is why they're the two that get doubled on the starting
flagship.

### Still to do

**Level 2.** The shipyard panels haven't been re-balanced against the new level
1, only checked that each is still an upgrade. Medical Bay had to go from "+2 a
three" to "+6" or it would have been *worse* than the starter it upgrades.

**An idea worth considering:** six faces don't divide evenly into four areas, so
two get doubled. If the flagship were a **d4** at level 1 — four faces, one per
area — it would divide perfectly, and the flagship could then grow d4 → d6 → d8
the same way your ships do. That would make the flagship's *shape* an upgrade
path rather than only its faces.

---

## 13 · The defender chooses — and it fixes what targeting couldn't

This is the best structural idea in the project so far, and the reason is that it
**inverts the exact thing that broke attacker-chosen targeting.**

Back in section 2, letting the attacker pick a target won 84% of matches and left
the loser with less than one ship, because the attacker always picks the most
painful thing to lose. Hand that choice to the **defender** and the spiral cannot
start: nobody ever chooses a trade that's worse for them than the alternative.
The victim controls their own decline. That's self-limiting by construction, not
by tuning.

### The rule

Damage arrives as one number. Before it lands, the defender decides:

- take it on the flagship, **or**
- **cripple one of your own ships to soak part of it**

A crippled ship is **red-damaged** (its even faces go blank — guns wrecked, it can
still block and heal) or **blue-damaged** (odd faces blank — shields wrecked, it
can still shoot). You choose which half you're giving up, and that alone is a
good decision: *do I keep my guns or my screen?*

### The numbers

I sweated this one, because my first guess was badly wrong. Valuing half a ship
by what it produces per round says a fair soak is about *sides + 2* — and at that
rate, a player who always sacrifices beats one who never does **100% to nothing.**

The mistake was treating a point of production as equal to a point of flagship
health. It isn't, and not by a little. **Health is life; production is only a
claim on the future.** Soaking damage buys survival directly.

Sweeping it properly:

| Soak | Rounds dark | Ships per round | Always-sacrifice beats never |
| --- | ---: | ---: | ---: |
| Sides | 3 | any | 96.9% |
| Sides | 3 | one | 83.2% |
| Half the faces | 3 | one | 57.2% |
| **Half the faces** | **4** | **one** | **45.4%** |
| Half the faces | 5 | one | 35.1% |
| Sides | rest of match | one | 29.3% |

**The one-ship-a-round cap is doing real work** — it alone took 96.9% down to
83.2%, and it keeps the moment to a single decision instead of a dozen.

And the reason to land on four rounds rather than three is the shape of the
decision, not the win rate:

| Rounds dark | Sacrifice freely, vs never | Sacrifice freely, vs only-when-desperate |
| ---: | ---: | ---: |
| 3 | 57.2% | 51.2% |
| **4** | **45.4%** | **39.9%** |

At three rounds, sacrificing constantly is simply correct, so there's no
decision. **At four rounds, reflexive sacrificing is a losing habit and saving it
for the round that would kill you is the winning line** — which is exactly the
question you want the player asking.

**Proposed:** a ship soaks **half its faces** — d4 soaks 2, d6 soaks 3, d8 soaks
4, d10 soaks 5 — one ship a round, dark for four rounds. Legible, too: *you give
up half the die, it soaks half its number.*

### Direct — the counter

Once ships can eat damage, a wall of hulls becomes the dominant defence — and
that's precisely when your pierce idea earns its place. Back in DIRECTIONS.md we
parked it because there was no wall to punch through. Now there is.

**A Direct Hit goes past the shields and past the hulls, straight to the
flagship.** It's the only damage in the game your opponent cannot answer.

**The name.** We landed on **Direct** over Pierce because this is space combat and
the natural sentence is *"he hit me for 3 direct"* — the word describes where the
shot went, not what it did to the armour. It also keeps the totals row to three
one-word currencies that read across cleanly:

> **1 Energy · 3 Health · 2 Direct**

The moment is a **Direct Hit**; the quantity is **Direct**.

### The symbol

A violet **double chevron**, `»`, in the purple that Energy vacated when it turned
yellow. Chosen over the alternatives because it *points* — which is what the
mechanic does, it goes through rather than landing on something — and because it
is geometrically unrelated to the other two marks, so at phone size you are not
telling apart similar blobs:

| Mark | Shape | Reads as |
| --- | --- | --- |
| Energy bolt | jagged, diagonal | electricity |
| Health cross | orthogonal, blocky | medical |
| **Direct chevron** | **directional, open** | **straight through** |

**One chevron is one Direct**, the same grammar as one bolt for one Energy and
three crosses for three Health. So the whole die now reads without a rulebook:

| Face | Carries |
| --- | --- |
| 1 | two Energy bolts |
| 2 | one Energy bolt |
| 3 | three health crosses |
| **4** | **two Direct chevrons, with the right panel** |
| 5 and up | just a number |

**1 fuels, 2 fuels a little, 3 heals, 4 hits direct** — and from 5 up a face is
only its number. All the texture lives in the low faces, which is another quiet
reason small dice stay worth owning.

### What it should cost

Fours come up about 1.53 times a round on a mid fleet, so **2 Direct on a four is
roughly 3 unanswerable damage a round.** Modest against an open flagship and
brutal against someone hiding behind their fleet, which is the right shape for a
counter — it should be a poor buy until an opponent forces you into it.


rule it just hands everyone 3 more damage a round and shortens the game; as a
panel it's an answer you reach for when the other side starts turtling.

One open question for when we build it: **should a card announce itself when a
Direct face lands?** Right now a 4 is a plain red attack face like any other, and
Direct is the only thing in the game that cannot be answered — it arguably
deserves a violet edge on the card so you see it coming.

I'd gate it behind a flagship panel rather than making it a base rule. As a base
rule it just hands everyone 3 more damage a round and shortens the game; as a
panel it's an answer you reach for when your opponent starts turtling.

### Why this direction is the right one

You put it well: *no more bolting a super-weapon onto the flagship, more what
kind of fleet do you want and how do you want the damage taken.* The Rocket was
fun but it was a number you buy. This is a decision you make with the pieces
already on the table — and it turns the moment you open the app, which is
currently passive ("you took 22"), into the most interesting choice of the round.

---

## 14 · Cannon fodder — the numbers behind it

You asked what the maths and the fun say. Here's both.

### First: how much damage actually arrives?

This turns out to be the number everything else hangs on, and it isn't what the
averages suggest — **the distribution is wildly skewed.**

| Round | 10th %ile | Median | 90th %ile | 99th %ile | Rounds where nothing gets through |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 0 | **2** | 7 | 11 | 36% |
| 4 | 0 | **3** | 12 | 23 | 35% |
| 7 | 0 | **7** | 25 | 38 | 27% |
| 10 | 0 | **15** | 34 | 47 | 14% |
| 12 | 2 | **20** | 39 | 54 | 8% |

Two things to take from that. **Most rounds barely hurt** — a third of early
rounds land nothing at all, because shields eat the lot. And **the damage that
matters arrives in spikes**: a round-ten hit is typically 15 but one in ten is 34
and one in a hundred is 47.

That's the shape that makes fodder interesting. If damage were a steady 15 every
round, sacrificing a ship would be routine bookkeeping. Because it's 2, 2, 0, 31,
4, 0, 44, you're deciding *is this the spike?*

### Your half-and-half idea, measured

**It breaks the game, and badly:**

| Each ship eats | Max ships | Always-sacrifice beats never |
| --- | ---: | ---: |
| 50% of the hit | 2 | **99.8%** |
| 50% of the hit | 1 | 92.3% |
| 25% of the hit | 2 | 76.2% |
| **Half the ship's own faces** | **1** | **39.7%** |

The reason is in the table above. Half of a 34-point spike is 17 absorbed by one
ship — more than three times what that ship produces over the four rounds it
spends crippled. **A proportional soak pays you most exactly when you need it
most**, which is the definition of a broken defensive rule: it removes the spikes
that are supposed to be the danger.

So the principle is: **the hull decides what it can eat, not the shot.** A d10
soaks 5 whether the incoming is 6 or 46. Against a median round-ten hit of 15
that's a third of it blunted; against a 40-point spike it's a rounding error.
Fodder softens ordinary rounds and cannot save you from a real one — which is
what keeps the flagship in danger and the match ending.

### How many ships per round?

| Max per round | Always-soak beats never | Restraint beats always-soak | Ships given up per match |
| ---: | ---: | ---: | ---: |
| **1** | 40.3% | 63.1% | **10.4** |
| 2 | 33.3% | 70.7% | 20.8 |
| 3 | 31.2% | 73.6% | 23.0 |
| Any | 31.3% | 74.2% | 23.9 |

Raising the cap doesn't make sacrificing stronger — it makes it *easier to
overuse*, so reflexive soaking gets worse and restraint gets more valuable.
Tempting, but look at the last column: **two ships a round means 21 sacrifices a
match**, which is a lot of taps and a lot of half-dark dice on a phone.

**One ship a round.** One decision, one animation, one thing to explain, and the
discipline test is already there at 40.3%.

### Where it lands

| | |
| --- | --- |
| Who chooses | The defender, always |
| How many ships | **One a round** |
| What it soaks | **Half its faces** — d4 soaks 2, d6 3, d8 4, d10 5 |
| What it costs | That half of the die goes blank for **4 rounds** |
| Which half | **You choose** — red-damaged loses the evens, blue-damaged the odds |

And the decision you're actually making, which is the good bit: *this hit is 22.
I can eat 5 of it with my d10 and lose its guns for four rounds, or take all 22
on the flagship and keep shooting.* That question has a different answer at 55
health than at 12, and a different answer again in round three than in round ten.

---

## 15 · The flagship is a normal d6

Your idea, and it's the cleanest thing we've done. **The flagship's faces mean
what the same numbers mean on every other ship**, so there is nothing new to
learn:

| Face | Boosts | Because on a ship… |
| ---: | --- | --- |
| **1** | Energy | a 1 pays Energy |
| **2** | *held open* | — |
| **3** | Health | a 3 heals |
| **4** | Direct | a 4 is the Direct face |
| **5** | Shields | 5 is odd, and odd blocks |
| **6** | Attack | 6 is even, and even hits |

You're right that this is the tell we haven't over-built it. **Every piece of
this game is now a real object you could put on a table** — four ship dice, one
flagship d6, a health track, and a pile of Energy tokens. Nothing needs an app to
adjudicate it. That's worth protecting as we add the rest.

---

## 16 · How much should a ship absorb?

You asked whether it should be a flat 5 for everyone, and worried that scaling by
size means you'd always feed the small ones in first. The maths says something
sharper than either.

### Flat is right, and the reason is counter-intuitive

**Half of a big ship is barely worth more than half of a small one.**

| Ship | Half of it is worth, per round | Cost of 4 rounds crippled |
| --- | ---: | ---: |
| d4 | 2.38 | 9.5 |
| d6 | 2.50 | 10.0 |
| d8 | 2.81 | 11.3 |
| d10 | 3.20 | 12.8 |

A d10 is 2.5× the price of a d4 but sacrificing half of it only costs you 35%
more. So if the soak scaled with size, you'd get this:

| Ship | Soak per point of value lost — flat 5 | — soak = half its faces |
| --- | ---: | ---: |
| d4 | **0.53** | 0.21 |
| d6 | 0.50 | 0.30 |
| d8 | 0.44 | 0.36 |
| d10 | 0.39 | **0.39** |

**Scaled soak makes your d10 the best fodder in the fleet** — twice as efficient
as a d4 — which is exactly backwards. You'd feed your capital ship to the guns
and keep the scouts safe.

**Flat soak puts it the right way round.** Small ships become 36% more efficient
as shields, so cheap hulls are cannon fodder, which is both the fantasy and the
first real job d4s have had since we priced them.

### But 5 is too much

| Soak | Always-soak beats never | Restraint beats always-soak |
| --- | ---: | ---: |
| Half its faces (2/3/4/5) | 42.4% | 59.7% |
| **Flat 3** | **51.3%** | **52.3%** |
| Flat 4 | 59.8% | 46.5% |
| Flat 5 | **67.2%** | 42.1% |
| Flat 8 | 82.4% | 31.3% |

At a flat 5, sacrificing becomes automatic — 67% says you should always do it,
and a mechanic you always use isn't a decision. **At a flat 3 both policies sit
within two points of even**, which is what a live choice looks like.

### Finishing off a crippled ship

Letting an already-damaged ship soak again and die is a strong option, so it
needs paying for:

| Flat soak, with finish-it-off allowed | Always-soak beats never |
| ---: | ---: |
| 1 | 38.8% |
| **2** | **49.6%** |
| 3 | 61.0% |
| 4 | 70.4% |

**So: 3 if a crippled ship is spent, 2 if it can be finished off.** I'd take the
second — the extra rule earns its place, because "my d4 was already half dead so
I threw the rest of it in front of the shot" is a better moment than "that ship
is unavailable."

And it closes a loop: destroying your own ship **frees the slot**, so a d4 you
finished off costs 4 Energy to replace while a d10 costs 13. Cheap ships are
cheap to lose *and* cheap to rebuild, which stacks the fodder role onto them
twice over.

### All the reasons you'd pick a different ship

With a flat soak, "use the smallest" is the default — but it's a default, not a
rule, and here's everything that overrides it:

1. **Your small ships are already crippled.** The obvious one, and it arrives
   fast: nine or ten ships get spent in a typical match.
2. **You need this round's Energy.** The d4s are your fuel — 38% of a d4's value
   is Energy against a d10's 10%. Crippling the blue half of a d4 costs you the
   1s and the 3s, which is the fuel and the healing at once.
3. **Straights need low numbers.** Only d4s and d6s cover 1 through 4 reliably.
   Cripple two d4s and your straight of six may be gone.
4. **Which half is worth more depends on the round.** If you're playing a
   defensive round anyway, taking the *red* half off a d10 costs you almost
   nothing right now — you weren't going to use those five attack faces.
5. **You're about to be finished.** At 8 health, efficiency is irrelevant; you
   take the soak from whatever is still whole.
6. **Replacement cost.** A destroyed d4 is 4 Energy to replace, a d10 is 13 — so
   the *finish-it-off* option is far more attractive on a small hull.

### Where it lands

| | |
| --- | --- |
| Who chooses | The defender |
| Ships per round | One |
| Soak | **A flat 2, any hull** |
| Cost | Half that die goes blank for 4 rounds — **you choose red or blue** |
| Already crippled? | It may soak again, and is **destroyed** — the slot frees up |

---

## 17 · Should the flagship join the straight?

Yes — and your instinct to raise the minimum to five is right for a reason from
our own rulebook.

### How much does a ninth die distort things?

| Fleet | Straight of 5+ — ships only | with the flagship | Flagship helps |
| --- | ---: | ---: | ---: |
| Mid — 4d4 2d6 2d8 | 52% | **60%** | 13% |
| Late — 2d4 2d6 2d8 2d10 | 47% | **56%** | 15% |
| Capital — 2d6 3d8 3d10 | 42% | **51%** | 16% |

About **eight points at every tier**, and it bites in one round in seven. Real,
but not a takeover.

### Why five is the right minimum anyway

At a minimum of four, **a mid-game fleet lands a straight in 82% of rounds.** One
of the six rules we wrote after the early disasters says: *a bonus that fires most
rounds isn't a bonus — at 75% it's just base attack with extra steps.* We broke
our own rule and hadn't noticed.

| Minimum | Mid-fleet rounds with a straight |
| ---: | ---: |
| 4 | **82%** |
| 5 | 52% |
| 5, with the flagship allowed to join | **59%** |

Five plus the flagship lands at 59% — often enough to chase every round, rare
enough to feel like something happened. **Raising the minimum pays for the ninth
die almost exactly.**

The cost lands on the opening: four d4s cannot make a straight of five at all,
because that's only four dice. Which turns out to be a feature — see below.

### The best part: it's the 5 that matters

I measured which flagship face is actually worth spending, and it isn't close:

| Fleet | 1 | 2 | 3 | 4 | **5** | 6 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Start — 4× d4 | 0% | 0% | 0% | 0% | **23%** | 0% |
| Mid — 4d4 2d6 2d8 | 3% | 5% | 5% | 5% | **27%** | 6% |
| Late | 5% | 7% | 9% | 10% | **21%** | 9% |

**Your guess was backwards, and the reason is the good bit.** Low faces are
nearly worthless to a straight *because your d4s already cover 1 to 4.* The
flagship's 5 is the one number your small ships can never reach — it's the wall
your fleet keeps hitting, and the flagship is the only thing that breaks it.

Which produces a focal point the game didn't have to be given:

> **The 5 face is the Shields boost.** So the marquee decision, three or four
> times a match, is *do I take the shields, or spend the 5 to finish my line?*

And for the starting fleet it's the **only** way in — four d4s make 1-2-3-4, and
the flagship's 5 completes it 23% of the time. Your first straights will all be
that exact moment, which is a very good thing to have happen in round two.

### The fun read

The trade prices itself. A flagship boost is worth about **6 a round**; stepping
a straight up a tier is worth about **8 to 10**. So joining is usually right and
skipping is never a disaster — the same shape as the charged panels, which is the
best-feeling decision in the game already.

**Recommended:** minimum five dice, and the flagship may join a straight instead
of firing its boost — never both. One line of rules, one decision a round, and it
gives buying your fifth ship a purpose you can feel.

---

## 18 · Base Energy, and what face 2 should do

### Have we decided on a base? Yes — it's zero

There is no base income today. Every point of Energy comes from a face, a
straight, or the flagship. Here's what a round actually earns:

| Round | Median | Mean | Rounds earning 0 or 1 | What +1 base would add |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 3 | 3.7 | **22%** | **+27%** |
| 3 | 5 | 5.8 | 14% | +17% |
| 5 | 8 | 8.2 | 6% | +12% |
| 7 | 9 | 8.9 | 5% | +11% |
| 11 | 5 | 7.8 | 13% | +13% |

**Your instinct is exactly right: base Energy is an early-game effect.** A flat
+1 is worth 27% in round one and 11% by round seven, because income roughly
doubles as the fleet grows while the base stays still.

### Why I'd keep the base at zero and make you earn it

A universal base has a quiet problem. Energy per die per round is 0.75 on a d4
and 0.30 on a d10, so a flat handout helps the *capital* fleet proportionally far
more:

| Fleet | Earns per round | With +2 base | Gain |
| --- | ---: | ---: | ---: |
| Eight d4s | 6.0 | 8.0 | +33% |
| Eight d10s | 2.4 | 4.4 | **+83%** |

DIRECTIONS.md warns that **fuel is the only thing stopping bigger-is-always-better**
and that any mechanic handing out free Energy is quietly attacking it. A flat base
is precisely that, and it aims at the wrong target.

So: **base stays 0, and face 2 is how you raise it.** Base income becomes
something you build rather than something you're given — which is a better story
and doesn't touch the brake.

### Face 2, and the problem with "+1 forever"

As a straight permanent gain it's worth about **9 Energy over a match** in
expectation — you roll the 2 about 1.8 times in eleven rounds, and each +1 is
worth (rounds remaining).

But the spread is ugly. Roll it in rounds one and two and you're +2 for nine
rounds — **18 free Energy, a d10 and a half.** Never roll it and you get nothing.
That's a large swing driven entirely by luck with no decision attached to it, and
it compounds, which is the one thing our rules say never to allow.

**The fix is to make it a choice:**

> **Face 2 — Reactor.** Take **4 Energy now**, or **+1 to your base Energy for the
> rest of the match**. Base may not go above +3.

The crossover is clean, because +1 base is worth exactly the rounds remaining:

| You roll the 2 in… | +1 base is worth | 4 now is worth | Take |
| ---: | ---: | ---: | --- |
| Round 2 | 9 | 4 | the engine |
| Round 5 | 6 | 4 | the engine |
| **Round 7** | **4** | **4** | either — the hinge |
| Round 9 | 2 | 4 | the cash |

So it's an investment early and a payday late, it self-limits (nobody takes the
engine in round ten, so there's no runaway), and the cap at +3 bounds the worst
case. Same shape as the charged panels, which is the best-feeling decision we
have.

It also gives the flagship a fifth thing to be, and it's the only face that
changes your future rather than your round.

---

## 19 · Damaged, not dark — the simpler fodder rule

Your rewrite: **a ship you throw in front of a shot is *damaged*. It sits out the
next round entirely, then comes back.** No odd/even halves, no four-round
sentence. You still own it, it's greyed out and marked DAMAGED, and you can still
sell it.

It's better, and for a reason beyond simplicity: **the cost is immediate and
visible.** You see the hole in your fleet next round, not spread thinly over four.

### What a ship is worth for one round

Measured on a fleet of two of each size — remove one ship and see what the fleet
loses:

| Ship | Costs the fleet, for that round |
| --- | ---: |
| d4 | 8.63 |
| d6 | 9.30 |
| d8 | 9.23 |
| **d10** | **10.37** |

**Almost flat.** A d10 costs only 20% more to lose than a d4. Which kills the
"mid dice soak more" idea stone dead — if they all cost the same to lose, they
should all soak the same, or the bigger one is simply better fodder again.

The reason is that the fleet covers for a missing ship: three rolls and seven
other dice absorb most of the gap, and a d4's Energy and Repair are worth about
as much as a d10's bigger numbers.

### The cap is the whole design

Your instinct — *you could block everything but have a terrible round* — turns out
to be the danger rather than the feature:

| Soak | Ships per round | Using fodder beats never | Playing it smart beats spamming it |
| ---: | ---: | ---: | ---: |
| 3 | any | 1.6% | 97.9% |
| 5 | any | 35.9% | 81.0% |
| **6** | **any** | **80.0%** | 47.5% |
| **4** | **2** | **47.3%** | **58.1%** |
| 5 | 2 | 61.4% | 46.5% |
| 5 | 1 | 63.3% | 44.0% |

**Uncapped, there is no middle.** At a soak of 5 fodder is useless; at 6 it's
dominant. Nothing sits between, because "block the whole hit" is either
achievable or it isn't — and the moment it is, you do it every round and never
take damage again.

**A cap of two creates the middle.** At two ships and 4 each, using fodder is
roughly break-even against never using it (47.3%), and playing it with judgement
still beats spamming it (58.1%). That's a live decision instead of a solved one.

### Where it lands

| | |
| --- | --- |
| Who chooses | The defender |
| Ships per round | **Two** |
| Each soaks | **4**, any hull |
| Cost | That ship is **damaged** — out for the next round, then back |
| Most you can block | **8** in a round |

Eight is about half a typical round-ten hit and a fifth of a bad one, so fodder
blunts and never negates. And the price is steep and legible: two ships out next
round costs about **19** of your roughly 60 points of production. You'd only pay
that when the alternative is worse — which is the definition of a desperation
move worth having.

### Is it fun?

I think so, and more than the version it replaces. The trade is one sentence —
*two ships for eight damage* — you watch the hole appear in your own fleet the
following round, and the answer genuinely changes with your health. At 55 you
take the hit. At 12 you feed it two ships and hope. That's the moment.
