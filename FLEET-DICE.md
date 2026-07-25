# Fleet Dice — core design

Status: design proposal, v2 (numeric face model)
Date: 2026-07-24
Supersedes: the multiplayer sections of BATTLE-DESIGN.md. The solo game there stays playable and becomes the tutorial.

---

## The idea in one paragraph

Every die is a ship. The number on a face is how hard it hits; the color tells you whether it hits or holds; the low faces pay you Energy instead. You start with three small ships and finish with seven or eight, and along the way you decide both how big each hull gets and what every individual face on it does. Bigger dice roll bigger numbers — but bigger numbers are harder to match, and matching is where the game gets loud. Each round everyone rolls in private, arranges their dice, and hits Submit. Nothing resolves until the last player has locked, and then you open the app later to find out what your plan actually did.

---

## The face model

This is the heart of it, and it is a better foundation than the version I wrote first.

**Every face has a number and a symbol, and the number does double duty.** It is the magnitude of whatever the symbol is, and it is the thing you try to match. A red 7 is seven damage. A blue 4 is four shields. And three dice all showing 4 is a Triad, whatever colors they happen to be.

The factory printing on a fresh die:

| Face | What it is |
| --- | --- |
| **1** | **Wild** — counts as any symbol, and pays the most Energy |
| **odd (3, 5, 7, 9)** | **Attack** — red |
| **even (2, 4, 6, 8, 10)** | **Defense** — blue |
| **bottom half (n ≤ S/2)** | also carries **Energy**, on a descending ramp |

So a factory d6 reads: `1 Wild ⚡3` · `2 Def ⚡2` · `3 Atk ⚡1` · `4 Def` · `5 Atk` · `6 Def`.

Three things about this are load-bearing, and two of them are changes from your sketch that the simulations argued for hard.

### Numbers are fixed by geometry. Only symbols can be bought.

You can never raise a number. A d6 will roll 1 through 6 forever, no matter how much Energy you pour into it. The **only** way to reach a 7, 8, 9, or 10 is to Size Up the hull.

This single restriction solves the problem BATTLE-DESIGN.md spent pages fighting. Size Up and face-upgrade were competing to be the same thing — both were just "make this die better" — which is why one always dominated. Now they do genuinely different jobs and can never substitute for each other. **Size Up raises your ceiling. Face-upgrade chooses your identity.** Neither is optional and neither is a trap.

It also kills my blank-face idea, which is fine, because this is better. Blank faces meant a fresh d10 was mostly dead weight. Here every face always does *something* — you are not filling holes, you are re-sculpting a die that already works.

### Rolling a 1 is Wild — and that is what balances the whole game

Your even/attack, odd/defense split has a hidden bias I did not see until I ran it. Because the top face of every die is even, the defense side quietly gets the bigger numbers — or the attack side does, depending which parity you assign. Either way it is lopsided, and worst exactly where new players live:

| Die | Average even face | Average odd face | Gap |
| --- | ---: | ---: | ---: |
| d4 | 3.00 | 2.00 | **50%** |
| d6 | 4.00 | 3.00 | 33% |
| d8 | 5.00 | 4.00 | 25% |
| d10 | 6.00 | 5.00 | 20% |

Pull the 1 out and make it Wild, and look what happens to the remaining odds:

| Die | Average even face | Average odd face (3+) | Gap |
| --- | ---: | ---: | ---: |
| d4 | 3.00 | 3.00 | **0%** |
| d6 | 4.00 | 4.00 | **0%** |
| d8 | 5.00 | 5.00 | **0%** |
| d10 | 6.00 | 6.00 | **0%** |

Exactly zero, on every die size, forever. That is not a tuned number, it is an identity — the evens on a dS average (S+2)/2 and so do the odds above 1. Attack and defense are perfectly balanced by construction and will stay balanced through every expansion you ever add.

And it fixes a feel problem for free. Rolling a 1 should not be the worst moment of your round. Making it the most flexible face on the die means the lowest roll is the one that can become anything. Your own example — "what if you get three 1s" — becomes three Wilds, which is the coolest possible version of that outcome.

### Energy belongs on the LOW faces, not the high ones

This is the one place I would push back on your sketch, and the data is lopsided enough that I want to show it rather than assert it.

You suggested the top half carries Energy — 4, 5, 6 on a d6. The trouble is that it makes Energy and combat power perfectly correlated, and a game where your best rolls give you *everything* has no texture. Two measurements:

| | Energy on TOP half (your version) | Energy on BOTTOM half |
| --- | --- | --- |
| Correlation of combat and Energy | **+0.84** | **−0.85** |
| Round-to-round swing (5×d6) | ±29% | ±15% |
| 10th–90th percentile round (7 ships) | 19 → 38 | 23 → 34 |
| Faces where keeping vs. rerolling is a real choice | **0 out of 9** | **9 out of 9** |

That last row is the one that decides it. With Energy on top, every face on the die is strictly better or strictly worse than every other face. The reroll rule becomes "reroll anything low," which a player learns in ninety seconds and then never thinks about again — and rerolling is supposed to be the most engaging decision in a dice game. With Energy on the bottom, **every single face** presents a tradeoff: this 3 is weak but it is paying me, this 9 hits hard but I am broke next round.

The variance halving matters too, and specifically because of the format you chose. In an asynchronous game you wait a day to find out what happened. Losing a round to a cold streak stings much worse when you had to sleep on it, and cutting the swing from ±29% to ±15% is the difference between "that was close" and "why did I bother."

**The ramp, not a flat pip.** Rather than every low face paying 1 Energy, the payout descends: on a d10, face 1 pays 5, face 2 pays 4, down to face 5 paying 1. This flattens the value curve dramatically — spread between best and worst face drops to about 1.6x, versus 3.3x for a flat pip — and it holds up whether a player values Energy highly or barely at all. It is robust rather than finely tuned, which is what you want in a number you will be re-balancing for months.

The result is a die with a **U-shaped value curve**. On a d10, faces 1 and 10 are both excellent for opposite reasons, and face 6 is the dead spot. The middle of the die is what you reroll. That is a genuinely interesting object to hold.

---

## Ships

Four families. A family does not change the *numbers* — those are geometry — it changes the **factory symbol layout**, which is what gives each hull a personality before you have spent a thing on it.

| Family | Factory printing | Plays like |
| --- | --- | --- |
| **Interceptor** | Odds are Lasers | Precise. Wants Triads and Fire Control. |
| **Lancer** | Odds are Missiles | Heavy. Punishes fleets with no Flak. |
| **Bulwark** | Evens are Flak instead of Shield | Defensive. The team's insurance policy. |
| **Reactor** | Energy ramp extends one face higher | Slow, rich, builds the biggest ships. |

| Size | Faces | Top number | Structure | Cost to reach |
| --- | ---: | ---: | ---: | ---: |
| d4 | 4 | 4 | 2 | buy |
| d6 | 6 | 6 | 3 | 3 Energy |
| d8 | 8 | 8 | 5 | 5 Energy |
| d10 | 10 | 10 | 7 | 8 Energy |

Eight bays. Deploying more than five ships costs 1 Energy per extra ship each round — the swarm's recurring tax, and the reason wide is not automatically correct. No Command stat; Energy and bays are the only limits.

---

## Upgrading a face

Two Energy re-symbols one face. That is the whole action, and it is deliberately the simplest thing in the game because you will do it constantly.

| Action | Cost | Effect |
| --- | ---: | --- |
| Re-symbol a face | 2 Energy | Any face becomes any symbol — Laser, Missile, Shield, or Flak |
| Extend the ramp | 4 Energy | One face above the halfway line gains an Energy pip of 1 |
| Overcharge a face | 6 Energy | d8+ only. That face rolls at **+3**, but only if you pay 1 Energy at lock |

Re-symboling is where fleet identity lives. A factory d8 is four attack and four defense; spend 6 Energy flipping its three even faces to Laser and you have a die that attacks on seven of eight faces and is visibly, obviously an aggressor. Your opponent can see it on the board and has to respond.

**Overcharge** is what a big hull can do that a pile of small hulls cannot. It prints two results — 7 becomes 10 if you can pay, stays 7 if you cannot — so in a round where you burned everything on rerolls your flagship fires soft. Big ships want Reactors near them, which is a fleet composition decision rather than a rule to memorize.

Upgraded faces persist through Size Up. You never lose paid work by growing.

---

## The round

Five beats. The first four happen privately on your phone at whatever hour suits you.

**1. Yard.** Spend banked Energy: buy a ship, Size Up, re-symbol faces, repair Stress, advance Fire Control. The budget is the limit, not an action count.

**2. Roll.** Every deployed ship rolls. The server generates it, not your browser, so refreshing gets you nothing.

**3. Shape.** **Two free ship-rerolls every round.** Past that, each reroll costs 1 Energy — money that would have bought a ship. Assign Wilds. Pay for Overcharges.

The free allowance is not generosity, it is structural. With one currency and no free rerolls, the correct play is always to reroll, because a bird in the hand beats a hull four rounds away — the first simulation had every bot finish round ten with the three d4s it started with. Two free rerolls make shaping the default and paying for a third an actual sacrifice. The question stops being "should I reroll" and becomes "is this third reroll worth a ship."

**4. Commit.** Arrange dice into Formations, pick your target, set damage priority, Submit.

**5. Resolve.** Nothing moves until every player has locked. Then all fleets resolve at once and the report is written.

Energy you *roll* banks for next round's Yard. Energy in the bank can be pulled mid-round for rerolls and Overcharges. One pool, two uses, every round.

---

## Formations — the matching game

**Each die belongs to at most one Formation.** Nine dice means at most three Formations, exactly as you said. That constraint is doing real work: a fourth matching die is sometimes better spent starting a second Formation than reinforcing the first.

There are three ways to match, and you asked for two of them — numbers and symbols. The third exists because the simulation said the game breaks without it.

| Formation | Trigger | Reward |
| --- | --- | --- |
| **Triad** | Three or more dice showing the **same number** | The swarm's bread and butter. Scales with the number matched. |
| **Run** | Three or more **consecutive** numbers | The mixed fleet's specialty. Tiered by how high it reaches. |
| **Battery** | Three or more dice showing the **same symbol** | The reliable fallback. Unlocks that symbol's tactic. |

A **Wild** (any die showing 1) fills a gap in a Run or stands in for a number in a Triad, but only for a value its own die could actually roll — a d4's Wild can become a 3, never an 8. This restriction is doing more work than it looks like it is; see below.

### Why three types instead of just numbers

Matching numbers gets dramatically harder as your dice grow, which is a serious problem if Triads are the only match:

| Fleet | Chance of at least one Triad |
| --- | ---: |
| 8 × d4 | **96.1%** |
| 7 × d6 | 54.1% |
| 7 mixed, late game | 49.3% |
| 4 × d10 | **3.7%** |

A capital fleet would essentially never see the mechanic you like most. But add Batteries and Vectors, scale each reward by the numbers involved, and total Formation value per round converges on its own:

| Fleet | Triads | Vectors | Batteries | **Total** |
| --- | ---: | ---: | ---: | ---: |
| Swarm, 8 × d4 | 9.8 | 3.2 | 0.8 | **13.8** |
| Swarm, 7 × d6 | 6.0 | 6.7 | 2.5 | **15.3** |
| Mixed, 7 late | 4.0 | 5.4 | 3.8 | **13.2** |
| Capital, 6 ships | 2.3 | 5.8 | 4.7 | **12.7** |
| Capital, 4 × d10 | 0.6 | 2.4 | 4.2 | **7.2** |

Two things fall out of this that I did not design and would not have thought of. First, the totals land within about 20% of each other across wildly different fleets, without any hand-tuning. Second, look at *where* each fleet's value comes from — the swarm lives on Triads, the capital fleet lives on Batteries and Vectors. Every build path gets its own way to be exciting, and it emerges from the arithmetic rather than being bolted on. The all-in 4 × d10 fleet sits low at 7.2, which is correct: four dice can only ever form one Formation, and that is the honest price of putting everything into hulls.

---

## Runs, and why they are tiered

Your tiering instinct is right and the simulation backs it hard. **A Run's tier is set by the highest number in it**, which means the tiers gate themselves on hull size with no extra rules at all:

| Tier | Top number | Requires |
| --- | --- | --- |
| **I** | 3–4 | anything |
| **II** | 5–6 | at least one d6 |
| **III** | 7–8 | at least one d8 |
| **IV** | 9–10 | at least one d10 |

A fleet of eight d4s can roll a hundred Runs and every one of them is Tier I, because 5 is not a number those dice contain. Nothing enforces this — it is just true. That is the most elegant kind of game rule.

### Wilds are what make long Runs possible at all

I built the Run tables first without Wilds filling gaps, and the result was that Runs of five and six essentially never happened — 2.7% at best, which in a ten-round match means you would never see one. Letting a Wild plug a hole changes everything:

| Fleet | Run 3+ | Run 4+ | Run 5+ | Run 6+ |
| --- | ---: | ---: | ---: | ---: |
| 4 × d4 (opening) | 77.8% | 28.6% | — | — |
| 8 × d4 (swarm) | 98.8% | 85.3% | — | — |
| 6 mixed | 89.8% | 66.2% | 34.1% | 8.9% |
| 7 mixed, late | 92.8% | 74.0% | 46.3% | **20.1%** |
| 6 big | 77.9% | 51.7% | 25.9% | 7.0% |
| 4 × d10 (capital) | 37.7% | 8.9% | — | — |

A Run of six now happens about one round in five for a well-built mixed fleet — rare enough to be a genuine event, common enough that chasing it is a real plan. And notice that **d4-only fleets can never reach Run 5**, because with only four values on the board there is no fifth number to find. Your gate holds perfectly.

### The reward: sum of the Run

I tested five reward formulas against six fleet compositions. Sum of the numbers in the Run was the flattest by a wide margin — 2.13x spread between best and worst fleet, versus 3.1x to 4.1x for every length-and-tier multiplier I tried. It is also the one a player can compute instantly without a lookup.

| Fleet | Expected Run yield per round |
| --- | ---: |
| 5 × d4, early | 8.6 |
| 8 × d4, swarm | 9.7 |
| 4 × d10, capital | 7.7 |
| 6 mixed | 13.8 |
| 6 big | 15.9 |
| 7 mixed, late | **16.4** |

The shape of that table is the design working. Mixed fleets are the best at Runs, which gives "diversify your hull sizes" a real payoff it did not have before. The extremes are worse at Runs and make it up elsewhere — the swarm on Triads, the capital fleet on raw numbers and exclusive Tier IV access. Three coherent philosophies, none of them dominant.

**Yield is a budget, not a damage number.** This is the part borrowed from Dice Throne, and it is what turns Runs from a bonus into a build.

---

## Protocols — the ability cards

Your fleet board has **three Protocol slots**, one per Formation type. You choose which card sits in each slot, and you spend Energy to level it. The Formation is the trigger; the Protocol decides what the trigger *does*.

This is the answer to a question the design had been dodging: where does progression live once numbers are fixed by geometry? It lives here. Two players can roll the identical Run of five and get completely different things out of it.

| Slot | Fires on |
| --- | --- |
| **Set** | Triad, or Quad for the top clause |
| **Run** | Run of 3, 4, 5, or 6 |
| **Battery** | Three of a symbol |

Each Protocol has three levels. Level I is free at match start, II costs 6 Energy, III costs 12.

### Run Protocols

**Broadside** — turn the yield into damage.
Lv I: deal damage equal to the Run's yield. · Lv II: the damage ignores Shields. · Lv III: also strikes a second target for half.

**Aegis** — turn the yield into defense.
Lv I: gain Shields equal to the yield. · Lv II: surplus converts to Energy 1:1 instead of 2:1. · Lv III: the Shields protect a teammate too, and stop Missiles as well as Lasers.

**Shipwright** — turn the yield into fleet.
Lv I: gain Energy equal to half the yield. · Lv II: on a Run of 4+, Size Up one ship free — but only to a size within the Run's tier. · Lv III: on a Run of 5+, Size Up free *and* re-symbol two faces; on a Run of 6, add a new ship.

Shipwright is your idea about trading in a d4 for a d6, and the tier restriction makes it sing. A Tier I Run can only push a d4 to d6. To free-upgrade a d8 you need a Tier III Run, which means you already own a d8 to roll the 7 or 8 with. Growth compounds, but slowly, and the Energy shop stays open as the reliable path for anyone who does not roll it.

### Set Protocols

**Fire Control** — the destruction ladder, now a card rather than a separate track.
Lv I: Triad of Locks → **Scar** one upgraded face back to factory. · Lv II: → **Stun**, the ship does not roll next round. · Lv III: **Quad** of Locks → **Breach**, destroy a ship; the owner picks which of theirs to scrap.

**Resonance** — Lv I: the matched number is dealt again as raw damage. · Lv II: doubled on a Quad. · Lv III: a Triad of Wilds counts as a Quad of any number you name.

**Cascade** — Lv I: gain Energy equal to the matched number. · Lv II: also gain a free reroll next round. · Lv III: banked Energy above 10 no longer decays, and Overcharges cost 0 this round.

### Battery Protocols

**Focused Array** — the symbol's total ignores the matching defense. · **Kill Net** — Flak Batteries cancel a Precision Strike and add +2. · **Overload** — convert the Battery to any other symbol before resolution.

Folding Fire Control into a card removes a whole subsystem and loses nothing. Going for Breach is now visibly a *choice you made instead of another choice*, which is exactly the weight it should carry.

### Power budgeting

The frequencies above are what set the numbers. Eight d4s trigger a Run 85% of rounds but always at Tier I, where the yield is around 9 — so Tier I effects must stay modest. A capital fleet triggers one only 38% of the time but reaches Tier IV, where a Run of three can yield 27 alone. High tier, low frequency, big payoff; low tier, high frequency, small payoff. The tiering does the balancing, which is why it should stay the only lever.

---

## Combat resolution

Both fleets resolve simultaneously from their locked totals. No cancellation cascades within a volley.

```
Damage you deal = max(0, your Laser  − their Shield)
                + max(0, your Missile − their Flak)
```

Surplus Shield or Flak is not wasted: every 2 points converts to 1 Energy, capped at 3 per round. A defensive round funds an offensive one, so holding the line never feels like a failed attack.

Damage lands as Stress, assigned down a priority order you set before locking, so resolution never stops to ask you a question. A ship whose Stress reaches its Structure sits out a round and returns clean. One Energy repairs two Stress.

---

## Fire Control — how ships die

Damage alone never destroys a ship; a lucky roll taking out someone's flagship is arbitrary and feels terrible. What destroys a ship is **aim plus investment** — the Fire Control Protocol in your Set slot, levelled up, plus the Locks to fire it.

| Level | Cost | Requires | Precision Strike |
| --- | ---: | --- | --- |
| **I — Scar** | free | Lock Triad | One upgraded face on the target reverts to factory printing, permanently |
| **II — Stun** | 6 Energy | Lock Triad | Target ship does not roll next round. Or Scar instead. |
| **III — Breach** | 12 Energy | Lock **Quad** (four) | Destroy a ship. The owner chooses which of theirs to scrap. |

Because it occupies your Set slot, teching into destruction means giving up Resonance and Cascade entirely. That is the right price — the scariest thing in the game should cost you a whole avenue of play, not just Energy.

Scarring is better under this face model than it was under the old one. You spend the whole game re-symboling faces away from the factory default, sculpting a die into an attacker or a wall — and your enemy spends their best rolls **shooting it back to stock**. Nothing is destroyed, only undone, so it hurts without humiliating, and re-doing the work costs Energy you wanted to spend growing.

Breach needing four of a kind rather than three is the escalation you described, and it is earned twice: once by fourteen Energy sunk into a track instead of ships, once by rolling four matching Locks in a round. Letting the *owner* choose which ship to scrap is the right call — deciding between the half-built d8 and the reliable little Interceptor is agonizing in the best way.

**Flak Batteries cancel Precision Strikes.** That is what keeps this from being oppressive and what gives defensive builds a job worth doing. When you see an opponent stacking Interceptors and buying Fire Control, you *know* you need Flak, and that read is what makes a strategy game feel alive.

---

## The team layer

Everything above works in 1v1. This is what only exists at 2v2 and 3v3.

The principle: **team mechanics should reward talking outside the app, and should be able to fail.** Coordination that is automatic is not coordination.

**Joint Formations.** Before locking, mark dice as committed to a joint number or symbol. If your team's committed dice reach three, the Joint version triggers — roughly twice as strong, applied to the whole team's totals. If your teammates do not come through, your committed dice still do their ordinary jobs but earn no Formation at all, and because a die can only be in one Formation, you gave up your own Triad chasing theirs. Real upside, real betrayal, and a reason to text your partner "going for 6s, please roll 6s."

**Screening.** Assign your surplus Shield and Flak to a teammate instead of converting it to Energy. The Bulwark player becomes a genuine role — rolls almost no damage, keeps the fleet-builder alive long enough to finish the d10.

**Fire Direction.** Donate your Lock faces to a teammate's Precision Strike. One player runs Interceptors and rolls the Locks, another buys the Fire Control levels, and together they Breach a ship neither could have touched alone. This is the most exciting interaction in the design and it should be the centerpiece of the tutorial.

**Energy Transfer.** Gift banked Energy at 3 given for 2 received. The tax stops it being a shared pool, but it lets a team elect a carry — two players feeding the third until one enormous d10 exists by round seven. A legitimate strategy that simply cannot happen in 1v1.

**Focus Fire.** If two teammates target the same opponent, their damage combines *before* that opponent's defenses subtract, rather than each being reduced separately. Focusing overwhelms; spreading lets everyone block. This makes target selection the team's most important shared decision and is why a 3v3 will not feel like three parallel duels.

---

## Match structure and winning

| Players | Format | Length |
| --- | --- | --- |
| 2 | 1v1 | 8 rounds |
| 4 | 2v2 | 10 rounds |
| 6 | 3v3 | 10 rounds |

**Nobody is eliminated.** In a match that may run ten days, knocking someone out on day four means they sit and watch, which is the fastest way to kill an asynchronous game. Damage does its work through attrition instead: Stress benches ships, Scars strip your upgrades, Breaches take ships away permanently. A player who has been beaten up arrives at round nine with fewer and weaker dice and loses on score — which is losing, just gradually, with agency the whole way down.

Scoring each round: 2 per damage dealt · 1 per damage prevented (cap 6) · 3 per Formation, 6 per Joint · 5 per Scar, 8 per Stun, 15 per Breach · 1 per Energy left at the end of the final round. Highest team total wins, with per-player contribution shown in the report, which teammates will absolutely use to give each other a hard time.

---

## What the screen looks like

Mobile first, vertical, one scrolling column. The counter rule and all current totals visible without scrolling.

**Each ship is a card.** The top two-thirds is the die itself — a large SVG polyhedron in its family color showing the rolled face as a big legible number in that face's symbol color. Underneath runs a strip of small pips, one per face, each showing its number in its symbol color with an Energy dot if it carries one, and the currently rolled face highlighted. That strip is the thing you asked for. At a glance you know this d8 rolls Laser on five faces, has Energy down to 4, and is showing a 6 — so you know instantly whether rerolling it is worth an Energy.

Tapping the card expands to the full face list with re-symbol buttons. Tapping the die toggles reroll selection. Matching numbers across dice should visibly pull toward each other and glow when a Formation completes — that feedback is most of the joy.

**A persistent bottom bar** holds banked Energy, reroll cost, assembled Formations, and Submit. Submit becomes a lock icon plus a list of who has and has not committed.

**The report** is what you open the app for. Both fleets' dice fly in, Formations fire in sequence, cancellations visibly subtract, damage lands on named ships, with a plain numeric breakdown underneath for anyone who wants to check the math. This screen carries the emotional weight of the whole asynchronous format and deserves more polish than anything else in the app.

---

## Server and async contract

The server is authoritative; the browser is a view.

- **Match creation** — choose format, get a six-character code and a shareable link. Others open it, pick a name and a team, host starts.
- **Rolls are server-side**, generated from the match seed and stored. Refreshing does not reroll. Worth doing even among friends, because knowing it is impossible removes the question.
- **Locked packets are immutable** — fleet version, roll, Formations, commitments, target, Overcharge payments, damage priority, timestamp.
- **Resolution fires when the last packet arrives.** No deadline, per your call. Add a "waiting on Sarah" indicator and, later, push notification.

Store matches as JSON under `.data/matches/<code>.json`, matching the existing scoreboard style. Reuse `battle-engine.js` for the resolver — the simultaneous-counter logic and Stress assignment already exist and are tested.

---

## Economy

Modelled before writing down, which was worth doing because two earlier versions of these numbers were broken in instructive ways.

Start with three d4s and 3 banked Energy. Income is a 3-Energy stipend, plus roughly 2 from combat salvage, plus your rolled Energy ramp, minus 1 for every deployed ship past the fifth. Buying ships uses an **escalating ladder** — 4, 5, 6, 8, 10 Energy for your fourth through eighth hull — which is what paces growth across the match rather than letting you fill every bay by round four.

Running bot policies over ten rounds:

| Policy | Never pays for extra rerolls | Pays for 3 extra rerolls a round |
| --- | --- | --- |
| Swarm | 8 ships | 7 ships |
| Capital | d10 by round 5, 7 ships by round 10 | d10 by round 10, 5 ships |
| Balanced | d10 plus six d4s | d8 plus five d4s |

Three or four ships early, seven or eight late, with a large gap between the player who shapes every roll and the player who banks everything. Five ships versus eight is a completely different fleet and neither is obviously wrong.

Two failures the model caught that I would not have caught on paper. With no free rerolls the single-currency design collapses entirely — every bot finished round ten with its starting three dice. And in the earlier blank-face version, the optimal opening was rushing a d10 on round two and letting its empty faces fund the game. The numeric model kills that one outright, because a fresh d10 is immediately good, so there is no free-money exploit to find.

Fire Control's 26 Energy for all three levels is about a third of a fleet's lifetime income. Going for Breach means being genuinely smaller than the player across from you, which is the correct price for the scariest thing in the game.

These need re-running against the new face model with real scored battles before I would trust them.

---

## Build order

1. Numeric face model, Wild on 1, Energy ramp, three Formation types with Wild gap-filling — pure and tested in `battle-engine.js`, no UI changes.
2. Protocol slots and the nine starting cards, including Fire Control and its Flak counterplay.
3. Match state and packet API in `server.js`. Lobby, join link, lock, resolve-on-last-lock.
4. The 1v1 client end to end: yard, roll, shape, commit, report. **Play one full match against a real person before touching teams.**
5. Team layer — joint formations, screening, fire direction, transfer, focus fire.
6. Re-run the bot harness on the numeric economy and retune.
7. Polish the report screen, because that is the screen the game lives or dies on.

Ship 1v1 first even though teams are the goal. Every team mechanic sits on top of the solo mechanics, and if the duel is not fun by itself, no amount of coordination will save it.

---

## Where expansions go later

Worth noting now so the base game leaves room, without building any of it yet. The numeric model opens doors the symbol-only version did not:

- **Dice that shift numbers** — a module that reads a rolled 5 as a 4 or 6, making Triads and Vectors buildable rather than lucky.
- **Odd geometries** — a d7 or d9 whose numbers overlap awkwardly with everyone else's, making it a deliberate anti-matching pick.
- **Faces above the die's own size** — a d6 with a printed 8, breaking the geometry rule as a rare, expensive artifact.
- **Parasite** — the `ownerId` / `teamId` split in the existing engine already supports transferring a fleet's allegiance at reveal.

All of these manipulate the number line rather than adding new symbols, which is why the base game should keep its vocabulary small.

---

## Three open questions

**Does the Yard happen before or after the roll?** Before, as written, means you build blind and then hope. After would be more forgiving but drains the tension. I lean before, strongly, but it is the biggest feel decision in the design.

**Do teammates see each other's dice before locking?** Written as no — you tell each other what you are doing, and you can be wrong or be let down. More dramatic. Showing dice makes joint Formations reliable and the game more tactical but less human. Worth testing both.

**Should Protocols be visible to opponents?** Hidden makes a Breach genuinely shocking the first time. Visible lets people counter-build, which is what Flak is for and probably the better game. I lean visible, with the *level* hidden — you can see they went Fire Control, not how far.

**Should Triads require matching color as well as number?** Right now three 4s count even if one is red and two are blue. Requiring color too would make Triads much rarer and push players harder toward re-symboling their dice into a single identity. I lean toward keeping it loose for the base game and saving the strict version as a hard-mode variant.
