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

Thirty-odd settings, all live. Change one, hit **Start a fresh match**, and feel it.
**Reset to defaults** puts everything back.

The three most useful settings for the current game:

- **Straight bonus multiplier** — currently 1. It scales every prize on the
  five-through-eight straight ladder.
- **Extra damage per round after escalation** — currently 4. Lower it if late
  matches end too abruptly; raise it if defensive matches still drag.
- **How fast they grow** — 1 is the present baseline. Drop it to 0.5 if the
  opponent is running away while other numbers are still being tuned.
- **Enemy plan** — 0 picks Width / Capital / Command at random each match. Set
  1, 2 or 3 to force one plan while you feel it.

---

## Versions

### 87 — quit game / back home (current)

Solo can leave a match the same way versus can cancel one:

- Online `/solo/` has a top bar with **Quit game** (asks first) and **Home**
- Inside the board: **Quit** in the header, **Quit game** in the dock, and
  **Back home** on the result screen
- Quit returns to the site home; mid-match quit asks so you do not lose a game
  by accident

No combat numbers changed.

### 86 — quiet solo board

Solo drops the guided first-match tips and the long coaching copy under the
dice, brace, and shipyard. The board stays as short as versus; **How to play**
is the teaching surface. No combat numbers changed.

### 85 — Fire up top, roll under the dice

The roll screen swaps the two main actions:

- **Roll / reroll** sits **under the fleet** — a clean full-width button you hit
  every round.
- **Fire** appears **between the health scores** once you have rolled — a red
  lock-in button. It replaces the old bottom-dock “Submit round” / “Lock orders”
  control on this screen.

The **Flagship Token** is available anytime after the first roll, not only after
roll 3. Help copy, versus, and the solo file all match.

### 84 — Enemy has a plan

Solo Enemy no longer follows one invisible growth schedule. At the start of each
match it picks **Width**, **Capital**, or **Command**, and spends its growth
actions that way for the whole game.

| Plan | What you read | What it does |
| --- | --- | --- |
| **Width** | going wide | Opens slots and adds ships first; upgrades the smallest later |
| **Capital** | building capital | Buys less often (d6s after the fifth ship); upgrades the biggest |
| **Command** | flagship command | Takes flagship levels earlier; then grows a mixed fleet |

The plan is visible on the shipyard (`Enemy · going wide · largest d8`), repeated
in the round report and on a kill-screen line, and named in How to play. Tune
setting **Enemy plan** forces one while testing: `0` random, `1` Width, `2`
Capital, `3` Command.

`botPace` is still the overall speed dial. The three plans keep roughly the same
action budget as the old pace-1 schedule; they aim it differently so a loss can
feel like “they outgrew me wide” instead of “the timer bought ships.”

Versus is unchanged — a human opponent already has a real plan.

### 83 — rolls stay put

**Reset choices on this page** no longer appears on the rolling screen. A roll is
a committed move: once the dice have been rolled, you cannot undo that roll (or
a whole string of them) with a page reset. The button remains on the shipyard
for undoing buys and upgrades, and the brace screen still has its own reset for
which ships you put in the way of damage.

No combat numbers changed. This is a clarity / commitment rule for the roll
page only.

### 82 — teach the depth, then give each flagship one command

Dave's second phone-playtest response was not that the game lacked decisions. It
was that the best one — building a straight — was easy to forget while learning
the symbols and combat. v82 adds a guided first match that teaches each decision
on the screen where it first appears. The roll lesson explicitly explains that a
d4's narrow 1–4 range makes it excellent at anchoring the low end of a straight.
The guide does not alter any roll and may be skipped; after the first shipyard it
gets out of the way.

The Upgrade Costs page now opens with six jump buttons: Buy ships, Upgrade ships,
Open slots, Flagship, Rerolls, and Earn Energy. They move directly to the named
section. Player-facing shipyard and upgrade-page language now says **upgrade**,
not grow.

**Both fleets now receive one Flagship Token per match.** After the third free
roll, its owner may turn the flagship one number down or up; 1 and 6 wrap. That
single turn can change the face bonus, complete or break a straight, and alter
which straight tier is available. The opponent scores the same two adjacent
faces against its current fleet and saves the token unless the improvement is
meaningful.

Fifty matches per existing fleet policy, with both sides using the same token
threshold:

| Plan | Win rate | Average rounds |
| --- | ---: | ---: |
| Formation first | 34% | 13.3 |
| Capital ship | 42% | 13.4 |
| Balanced upgrades | 34% | 13.3 |
| Flagship first | 38% | 13.6 |
| Fill then upgrade | 46% | 12.9 |

The range tightened to 34–46% and the average stayed at 13.3 rounds. That is a
safe first signal: the token adds control without making the flagship-first path
automatic. It is still a policy simulation, not proof of human balance.

How to play now draws all six actual flagship faces, with each number, colour,
name and complete effect. It also explains the Flagship Token beside those faces
instead of leaving the new rule in a separate reference.

The round report now distinguishes the sides before the labels are read. The
entire **You** story — health, roll, incoming damage and notes — stays in one
light-silver column with dark ink. The entire **Enemy** story stays in a
near-black column with a red accent. Attack is red, Shields blue, Repair green,
Direct purple and Energy yellow on both the words and their numbers, so the
combat result can be scanned by color. Each health card ends its damage and
repair summary with the large signed total change — for example **+4** — while
retaining the previous-health → current-health story above it. Every large
flagship-health total is green throughout the board and report, so that color
always means flagship health. The flagship chip in each report roll now reuses
the exact solid face color from the flagship die itself — yellow Reactor/Energy,
green Repair, purple Direct, blue Shields or red Attack — with its original dark
ink and gold ring. The compact health bar at the top now carries the same side
language as the report: Your score sits on light silver, the center stays
neutral, and Enemy remains near-black with red labeling. The game now calls the
opposing fleet **Enemy** instead of Them or Their in every player-facing combat,
shop, instruction and game-over label.

### 81 — the first phone playtest

Dave played v80 on his phone and reported the things that only appear when a
human thumb meets the game.

**The roll now begins Ready.** Entering a round shows every available die marked
Ready and a large `Roll 1 of 3` button. Rolls 2 and 3 use the same language after
the player selects what should roll again. The shipyard now says `Go to round N`.
A paid flagship-only reroll was also broken: the button counted selected ship
dice but ignored the selected flagship, so it disabled itself. The flagship now
counts as one selected die and costs 1 Energy like everything else.

**Damage may be spread across as many ships as the defender wants.** Every chosen
ship blocks its own size and misses the next round. This replaces the often
obvious “pick the one ship closest to the damage” answer with a larger decision:
how much health to save now versus how many dice to give up next round. Direct
still reaches the flagship.

Repeated ship defense stretched the first simulation from roughly 13 rounds to
16. The existing war-escalation timer was therefore tested at +3 and +4 attack
per late round. +4 restored the five policies to a 13.7-round average. It begins
in round 9: +4, then +8, then +12. The instructions now explain this explicitly.

**Prices came down.** Slots 5–8 now cost 7 / 8 / 9 / 10 Energy — always two more
than the slot number. Flagship levels fell from 16 / 26 to 10 / 16. Fifty matches
per policy against the pace-1 opponent:

| Plan | Win rate | Average rounds |
| --- | ---: | ---: |
| Formation first | 42% | 13.9 |
| Capital ship | 36% | 13.5 |
| Balanced growth | 48% | 13.7 |
| Flagship first | 32% | 13.8 |
| Fill then grow | 44% | 13.4 |

The command policy now actually buys flagship levels (average 2.1) without
becoming dominant. The 32–48% range is encouraging, but 50 matches per policy is
still only a first pass.

**The screens now tell the truth more directly.**

- Player-facing copy uses ship or die, never “hull.”
- Buttons show their price without calculating “3 short” for the player.
- Grow sits above each ship; Scrap stays below it.
- Flagship face 4 says exactly what it does: each ship showing 4 earns the
  flagship bonus as Energy.
- How to play lists all 28 faces across d4, d6, d8, and d10, including every
  printed mark.
- Roll, shipyard, and damage decisions have `Reset choices on this page`.
- The result shows two side-by-side health stories: previous health, damage,
  repair, and current health. The full ledgers remain below.

**Two navigation bugs closed.** Clicking Upgrade costs while already there used
to replace the return destination with the same page, trapping the player. The
button now toggles back to the saved game screen. Reference navigation is tested
from roll, report, and shipyard.

---

### 80 — grow the fleet, or widen it

This version makes the two changes that most directly attack the solved economy
and add recurring decisions to the shipyard.

**Ships grow in place.** A d4 becomes a d6 for 2 Energy, a d6 becomes a d8 for 3,
and a d8 becomes a d10 for 4 — exactly the difference in their purchase prices.
The ship keeps its slot. A Damaged ship cannot grow until it returns. The old
scrap-and-rebuy route remains available, but is no longer the only path to a
capital ship.

**Fleet width now has a price.** You begin with four open slots rather than all
eight. Slots 5–8 cost 6 / 10 / 15 / 20 Energy. This turns “another die forever”
from an automatic purchase into a strategic commitment: spend on formation,
grow the ships already rolling, or invest in the flagship.

Growth needed an actual reward beyond a larger number. New faces therefore carry
escalating printed marks:

| Face | Additional effect |
| ---: | --- |
| 5 / 7 / 9 | repair 1 / 2 / 3 |
| 6 / 8 / 10 | Direct 1 / 2 / 3 |

Every printed mark still pays automatically. The d6 remains the tightest straight
fleet, while larger hulls now gain repair and Direct instead of steadily losing
both outputs. Measured over 4,000 rounds per homogeneous fleet:

| Fleet | Attack | Shields | Repair | Direct | Straight% |
| --- | ---: | ---: | ---: | ---: | ---: |
| 8 × d4 | 14.8 | 11.1 | 9.5 | 2.76 | 15% |
| 8 × d6 | 24.9 | 15.1 | 5.5 | 4.37 | 63% |
| 8 × d8 | 30.1 | 17.8 | 6.2 | 5.78 | 48% |
| 8 × d10 | 34.2 | 22.3 | 7.8 | 7.55 | 39% |

The latest 50-match real-build strategy pass against the pace-1 opponent came
back at 22% for formation-first, 34% for a capital-hull policy, 48% for balanced
growth, 26% for flagship-first, and 32% for fill-then-grow. Fifty matches still
means roughly ±14 points at 95% confidence, so this is not a final balance claim.
It is a large improvement over the old fill-first policy's 100%.

One serious existing bug surfaced during measurement: `themGrow()` ran inside
the shop renderer, so re-rendering the shop could grow the opponent repeatedly
in one round. It now runs once in the round transition. The default difficulty
returns to pace 1 because v79's 1.75 was compensating for the old economy and the
render-triggered growth made any comparison unreliable.

The shop, reference pages, help, symbols, and ledger now explain all of this. A
top-tier straight also says when its free ship requires an open slot. The test
harnesses now find `simple.html` relative to themselves, so they run from this
repository instead of a machine-specific path.

---

### 79 — the difficulty dial was a coin flip

v78 left the player winning **81%**, so the first job was to strengthen the
opponent. There was no way to do it: **`botPace` did nothing above 1.**

Every line of the opponent's growth was gated on `Math.random() < pace`. At a pace
of 1 that test always passes, so 1, 1.5, 2 and 3 were the same opponent. The Tune
panel offered a dial to 3 and two thirds of it was decoration — which is why my
first three measurements came back 81%, 50% and 83% and looked like noise. They
*were* noise; I was measuring the same thing three times.

It is a **rate** now. `timesPerRound(0.25 × pace)` buys a ship, `timesPerRound(0.33
× pace)` grows a hull, and the flagship levels arrive at `round 4/pace` and
`8/pace`. The rates are chosen so **pace 1 reproduces the old schedule exactly** —
a ship on rounds 2, 4 and 6, a hull grown on 3, 5, 7 and 9 — because that is the
schedule every measurement in this file was taken against.

Now it moves, and monotonically. Opponent's fleet after 12 rounds, 400 runs each:

| Pace | Ships | Biggest | Total sides | Flagship |
| --- | --- | --- | --- | --- |
| 0.5 | 5.5 | d7.6 | 26.0 | 2.0 |
| 1 | 6.8 | d9.5 | 35.1 | 3.0 |
| 1.5 | 7.5 | d9.9 | 41.8 | 3.0 |
| 2 | 7.9 | d10.0 | 47.4 | 3.0 |
| 3 | 8.0 | d10.0 | 55.7 | 3.0 |

And the win rate finally responds: **pace 1 → 81%, 1.5 → 63%, 1.75 → 46% over 46
matches, 2 → 21%.**

**The default is now 1.75.** Worth knowing why that is the right side of even: the
simulated player is deliberately plain — it buys the biggest hull it can afford,
always braces, holds by the opponent's own logic, and **never chooses a straight
tier**. A person who reads the straight banner and picks their prize is playing
better than that, so 46% for the simulation should land a thoughtful human a bit
above half. That is the feel this game wants. If it is wrong, the dial works now.

---

### 78 — Direct moves to the 2, Energy to the 4

Your read: on a d4 the **4** is the top face, so it was collecting the biggest
attack *and* the unblockable damage at once — the best face on the smallest die.
So Direct moves to the **2** and Energy moves to the **4**.

| Face | Was | Now |
| --- | --- | --- |
| **1** | blocks 1 · 2 Energy | blocks 1 · **2 Energy** |
| **2** | hits 2 · 1 Energy | hits 2 · **2 Direct** |
| **3** | blocks 3 · 3 repair | blocks 3 · **3 repair** |
| **4** | hits 4 · **2 Direct** | hits 4 · **1 Energy** |

The flagship followed, because its whole trick is that a face means what the same
number means on a ship: **#2 now boosts Direct** and **#4 now boosts Energy**.

**I expected this to change nothing and I was wrong.** On paper the 2 and the 4
are equally likely on any die, so moving Direct between them should not touch the
d4's advantage. It halved it — d4 Direct fell from **6.57 to 2.77** a round.

The reason is what players *hold*. Everyone keeps their high numbers. On a d4 the
4 **is** the high number, so "keep your best attack" was quietly farming Direct
every single round. Now the unblockable damage sits on a face nobody wants to
keep, so you have to choose between attack and Direct. That is a real decision
where there was none, and it is the kind of thing only a playtest finds — the
paper odds said this change was a no-op.

**What it did to the strategy table** (same plans as v77, same harness):

| Plan | v77 | v78 |
| --- | --- | --- |
| Fill all 8 slots with d4s, then trade up | 100% | 100% |
| Flagship levels first | 43% | **83%** |
| Buy the biggest hull affordable | **21%** | **75%** |
| Hoard for d10s only | **7%** | **58%** |
| Only ever buy d4s | 57% | **43%** |

The order **inverted**: d4-forever went from second-best to worst, and buying big
went from worst to strong. The spread narrowed from 93 points to 57.

**Two things this did not fix, stated plainly.** *Fill all eight slots then trade
up* still wins 100% — that is the slot economy, not the faces, and no change to a
die face can touch it. And everything got easier: the baseline win rate went from
about 56–61% to **81%**, so the opponent now needs strengthening. `botPace` in the
Tune panel is the lever.

**A refactor that closes a bug class.** Every flagship face now declares what it
matches (`match:3`, `even:true`, `odd:true`) and both the payout and the ring on
the board read that one field. They used to be two hand-written lists that had to
agree, and twice they did not. Swapping Direct and Energy was then a two-line data
change instead of an edit in five places.

The legend on the How to play page is also generated from the settings now, so if
you move a number in the Tune panel the key moves with it. It used to hard-code
"2 Energy" and "3 crosses", which is how it drifted before.

---

### 77 — full review: the missing straight screen, and a solved game

A slow pass over every screen and every process, the dead code out, and playtests.
The housekeeping is below; the finding is first, because it changes what to build
next. **Full write-up in `IDEAS.md`.**

**The game is currently solved.** Five plans a person might actually adopt, each
played through full matches:

| Plan | Wins |
| --- | --- |
| Fill all 8 slots with d4s, then trade up | **100%** |
| Only ever buy d4s | 57% |
| Flagship levels first | 43% |
| Buy the biggest hull affordable | 21% |
| Save up for d10s only | 7% |

93 points of spread, and **the shop was recommending one of the worst lines.**

Two measurements that pull opposite ways explain it. At equal ship *count* eight
d10s beat eight d4s **96%**. At equal *money* eight d4s beat two d10s **100%**. So
what wins is **slot count**, not hull size — and slots are nearly free.

The second half is the low faces. Eight ships of one size, 4,000 rounds each:

| Fleet | Cost | Attack | Repair | Direct | Straight% |
| --- | --- | --- | --- | --- | --- |
| 8 × d4 | 32⚡ | 15.0 | **9.4** | **6.57** | 13% |
| 8 × d6 | 48⚡ | 25.0 | 3.5 | 2.42 | **63%** |
| 8 × d10 | 104⚡ | 34.4 | 2.5 | 1.69 | 40% |

Every hull carries exactly one 1, 2, 3 and 4, so a small die shows a special face
far more often. A d4 fleet makes **4× the Direct and 4× the repair** — the two
outputs nothing can block — while big hulls buy attack, the only output shields
eat. Size buys the weak resource and sells the strong ones.

Also worth knowing: **d6 is the best straight fleet at 63%**, beating d10 at 40%,
because a d6 covers 1–6 tightly while a d10 spreads across ten numbers and misses
the middle.

The shop copy is fixed so it no longer points at a losing plan. **The balance is
untouched** — that is a design decision, and it is ideas 1 to 3 in `IDEAS.md`.

**A rule with no way to use it.** You may cash a long straight at a shorter
length. It is in the rules and the report had a line for it — and there was **no
control anywhere on screen.** `straightPick` was never set by a human, so that
branch was unreachable. Worse, a straight announced itself with a faint orange
underline and nothing else. There is now a **straight banner**: what you rolled,
whether the flagship is in the line, and a button per tier showing what each pays,
with the totals moving live as you choose. Dave asked for this around v28 — *"the
selection of options should be clear, choose your reward"* — and it was lost in a
layout pass. A tier you pick now also resets on a reroll, so you cannot choose 5,
reroll into 7, and quietly cash the short one.

**Dead code, found by script rather than by eye.** 18 CSS rules for classes nothing
applies, 3 uncalled functions, 4 stray modifier rules. `test-dead-code.py` and
`test-dead-css.py` will catch the next batch.

**Comments describing a game we no longer have** — worse bloat than dead code,
because they misinform whoever reads next. The flagship comment said you design its
six faces and that it cannot join a straight; both were once true. The straight
comment described the pre-v12 ladder. The rules header said a 1 has no combat
value. The Rocket sat at the top of the file as an idea to build, long after we
removed it; it is now recorded as a decision with a pointer to its measurements.

**One word per thing.** "Berth" was mine, "slot" is Dave's — slot everywhere.
"Hit points" and "health" were one number under two names — health. A toast still
said *sell a ship*. Internally `panel` was the deleted store's word and collided
with the `--panel` colour and the Tune panel: `PANELS` → `FACES`, `flagPanel` →
`flagFace`, `flag.panels` → `flag.faces`.

**Twelve smaller fixes the review turned up:** the brace screen blamed your fleet
when the real limit was your one-ship allowance · it advertised "blocks 4" on cards
you could no longer tap · the report repeated the health strip three inches above
it · "They attacked" against "Your fleet attacked" for the same act · their repair
buried in a note about your Energy while their flagship visibly rose · the shop
drew a number in each hull meaning its *maximum* where the same picture on the
board means the *current roll* · the payout table stopped at 7 and never showed the
free-ship tier · "They finished it in 1 rounds" · and "no round limit" where a
40-round backstop exists.

21 test scripts now run on every change.

---

### 76 — the top button says "Upgrade costs"

Renamed as you asked. Two things went with it, because a button that disagrees
with the page it opens is its own small confusion: the page heading changed from
**Prices** to **Upgrade costs**, and the shop's pointer to it — which still said
"on the Energy page at the top" — now names the button a player can actually see.

---

### 75 — "pays" becomes "adds", everywhere

You pointed at *"every face pays 3"* and said it should be **adds** — that what
really happens is **each matching face gets a bonus**. You are right, and the old
wording was doing real damage: *"every face pays 3"* sounds like the flagship
hands you three of something. It does not. It adds to **each of your dice showing
that number**, so on a fleet with four 3s a flagship 3 is worth twelve, not three.
The old sentence hid the most important thing about the flagship — that its value
scales with how many dice match.

Rewritten in all ten places it appeared:

| Was | Now |
| --- | --- |
| every face pays 3 | each matching die gets **+3** |
| Every face goes from 2 to 3 | The bonus on every face rises from **+2** to **+3** |
| One purchase lifts all six faces | One purchase **raises the bonus** on all six faces |
| a flagship 3 pays extra repair for each of your 3s | a flagship 3 **adds** repair to each of your 3s |
| Flagship upgraded — every face now pays 3 | Flagship upgraded — each matching die now gets **+3** |

The explanation now shows the mechanic instead of naming it: *"Every ship showing
that same number gets a bonus — a flagship 3 adds repair to each of your 3s, a
flagship 6 adds attack to each of your evens."*

**And the one exception is now stated where the claim is made.** "Each matching
die gets +2" is not true of the **#1** face — the Reactor has no matching die, it
raises your standing Energy. That was only explained on the How to play page, so
the shop was making a promise with a silent exception. It says so now, right under
the ladder.

The Tune panel notes were carrying the old wording too, so those changed with the
rest. A screen and a settings panel disagreeing about what a rule does is how this
project has confused itself before.

Measured: the shop's flagship section, the level ladder, the upgrade button, the
ceiling notice, the toast and the How to play page all read the new way, the
ceiling correctly offers no purchase, and nothing anywhere still says "face pays".
`test-flagship-language.mjs` checks that last one on every future change.

---

### 74 — the nudge is gone, and the Energy page is a price list

I built you the wrong page. You asked for **store prices you can check to decide
whether to save**, and I wrote an essay about Energy in general — with the nudge
as its headline, a mechanic you did not want.

**The nudge is deleted.** The `+1` / `-1` buttons, `doNudge`, the `nudgeCost`
setting, the wiring, and the two old comments that still listed nudging as one of
the things Energy is for. Energy now has exactly two uses: **extra rerolls during
a round**, and **everything in the shop**.

**The page is now called Prices**, and it does one job — tells you whether to
save. It opens with the only sentence that matters, and it changes as you play:

> You have **7 Energy** and **+2** comes in each round. Enough for a **d6** right
> now, and **2** more reaches a **d8**.

With nothing banked it says *"Not enough for anything yet, and 4 more reaches a
d4."* Every hull you can already afford carries a small green **YOU CAN AFFORD
THIS**, so the list answers "what can I buy" before you do any arithmetic.

Then: the four hull prices with what each averages and which straight tier it
lifts you to · both flagship levels and which one you are on · the reroll cost ·
where Energy comes from · and how many berths you have left, because that is the
real constraint:

> **Save or spend?** You only have 8 berths, and scrapping loses half the price —
> so a berth is worth more than the Energy it takes to fill. Waiting a round for
> a **d10** beats filling two berths with **d4**s you will later pay to remove.

**Balance:** unchanged, and I want to be exact about why. The simulation never
used the nudge, so removing it moves no measured number — 18 matches came in at
50% and ~12.8 rounds, the same place as v72. What actually changed is the game
for a **human**, who now has one fewer thing to spend on, so slightly more Energy
reaches the shipyard. That is a real shift the harness cannot see, and it wants a
play session rather than a simulation.

**Two near-misses worth recording.** A draft line `var next = [4,6,10,13].length
? null : null` survived into the file doing nothing — caught by reading the
rendered page, not the diff. Then removing it, my search for `"  var next = "`
matched the **flagship upgrade** line first and would have deleted that instead;
the assertion that the upgrade line must survive is what stopped it. Both of
these are the v45 lesson again: an edit that reports success has not proved
anything.

---

### 73 — two reference pages, and Tune gets out of the way

You asked whether **Tune** matters and whether that space could tell people what
Energy is for — because they will sit on a pile of it without knowing why.

**Tune matters to you, not to a player.** It is how every number in this game
gets balanced without a rebuild, and it has earned its place. So it is not
deleted — it moved to **the version number**. Tap `v73` next to the title and the
Tune panel opens exactly as before. A player will never press it; you always
know where it is.

**The top button is now `Energy ⚡`.** It opens a page that answers the question
the board never did: *what is this number for?*

- **During a round** — a **nudge** is 1⚡ and moves one die up or down by one.
  That is the cheapest thing in the game and usually the best: one point turns
  four in a row into five. An extra reroll past your three is 1⚡ a die.
- **Between rounds** — every hull price, what it averages, and which straight
  tier it lifts you to. Both flagship levels with their cost.
- **Where it comes from** — every 1 pays 2, every 2 pays 1, your standing income
  and what raises it, and the straight tier that pays Energy.

It ends with the part that actually answers your worry:

> **Why hold on to it.** A single 1⚡ nudge at the right moment completes a
> straight, and saving three rounds for a d10 beats spending the same Energy on
> two d4s — small hulls fill your berths and then you have to pay to scrap them.

**How to play** sits at the bottom left, right beside Submit round: the round in
four steps, how to read a die, what the flagship does and why those rings appear,
straights with the payout table, taking damage and why Direct ignores all of it,
and how the match ends. On a narrow phone the Ships counter in the bar hides so
the button always has room.

Neither page shows the bottom bar — they are places you read, not places you act,
and both return to exactly the phase you left.

Measured: both pages opened and returned cleanly from **roll, report and shop** —
right phase, Back present, dock correctly hidden, and the phase restored on the
way out. Every earlier suite still passes.

**A note on how this nearly went wrong.** Moving Tune onto the version number
silently did nothing the first time: my find-and-replace string had a stray
quote, matched no text, and reported success. That is the exact failure written
down in `HANDOFF.md` from v45. The fix was to assert the match before writing the
file, which is now how these edits get made.

---

### 72 — the old panel game is deleted

You looked at what I was doing and said: *this is all old game mechanics, only
use the mechanics of the flagship dice we have made and the different dice
sides.* You were right, and I had it backwards — I spent four measurements
balancing the opponent's **Rocket** instead of noticing the Rocket should not
exist any more.

**Deleted, not retired.** About 8,900 characters of a different game came out:

- the **Rocket** — a one-shot that filled two faces and launched itself
- **charged panels** — Overload, Bulwark, Full Spread, Refit Bay, and the whole
  pay-Energy-to-fire mechanic with its button, its `charged` flag and its "at
  full power" report line
- the **bought panel tiers** — Medical Bay, Attack +2 each, Shield +2 each,
  Energy +5, Attack +9
- the **panel store**: the face picker, the offer list, `storePanels`,
  `panelCost`, `mountPanel`, `countPanel`, `facesUsed`, `isOneShot`,
  `launchIfRocket`, `panelPick`, and both click handlers
- the settings that only served them: `maxSame`, `rocketPay`, `rocketCost`
- the opponent's grants of `atkEach2`, `atk9` and a Rocket on a schedule

What is left is the game we actually built: **six flagship faces, one per number,
each boosting the dice showing that number**, and one purchase that raises all
six together. Nothing to fit, nothing to choose, nothing to look up.

**The shop, in your order.**

1. **Scrap a ship for Energy** (red) — the only room that *raises* Energy, so it
   goes first. Your own 3×3 board with a Scrap price on each hull.
2. **Buy a new ship** (blue) — the four hulls drawn as hulls.
3. **Upgrade your flagship** (gold) — the level ladder, all three rungs visible
   at once, with the six faces listed for reference.

Headings are coloured and say what you *do* there. "Shipyard" was a place;
"Buy a new ship" is an action.

**The price never dims.** You asked for exactly this: the hull greys out when you
cannot afford it, but the price stays bright yellow and readable, with a small
`3 SHORT` beneath it rather than the price being replaced by an excuse.

**What deleting the Rocket cost the opponent.** Measured on equal play — same
holds, same three rolls, buying the biggest hull affordable — the bot went from
winning most matches to losing them: **you now win about 56–61%** across three
runs of 18 (56%, 61%, and 44% at pace 1.5). Matches still run ~12 rounds. The
Rocket and its two attack panels had been carrying the opponent's late game.

That is a small sample and I am not going to dress it up: 18 matches gives about
±12 points. The honest read is that a well-played fleet is now slightly favoured
at the default, and **"How fast they grow" in the Tune panel is the knob** — 1.5
measured harder. Worth a longer run before we call it balanced.

---

### 70 — the shop looks like the game

The store was the last screen still made of grey text rows with a button on the
right. Everywhere else in this game you look at **hulls**; in the shop you read a
table and then had to go find the shape on the board. Two languages for one
object.

**The shipyard now shows the ship.** Same hull the board draws, at the same
angle, with the price under it. Affordable hulls are lit and outlined;
unaffordable ones dim and the button says **"need 4⚡ more"** instead of going
quietly grey. A full fleet says **"No berth."**

**The scrapyard is your own board.** Same 3×3, same berth numbers, same hulls,
with a small **Scrap 2⚡** under each ship and the free berths drawn as free
berths. *"Scrap the d4 in slot 2"* is now something you can see instead of
something you have to translate from a list.

**The shop was lying about what a ship carries.** It said a d10 had *"4 attack
faces, 4 shield"* — it was skipping the 1 and the 2, which was true of a rule we
dropped long ago. Every face fights: **evens hit, odds block**, and the 1 and 2
pay Energy *on top of that*. A d10 is **5 hit, 5 block**. The card now counts the
faces rather than describing them, and the test compares those counts against
what the engine actually scores, face by face, for all four hulls.

**Something the shop had never said out loud.** I first gave each hull a row of
its special marks — and all four rows came out identical, because every die from
a d4 up carries exactly one 1, 2, 3 and 4. Four cards saying the same thing is
four cards saying nothing. So it is stated once, for the whole shipyard:

> Every hull carries the same low faces — ⚡1 ⚡2 ✚3 ⟩⟩4 — so paying more never
> buys you more Energy, repair or Direct. It buys reach and size.

That is a real strategic fact the store had never told anyone. Each card instead
carries what genuinely differs: hit and block faces, its **average roll**, and
which **straight tier** it lifts a line to.

**Also fixed:** damage is red everywhere — *You took* was drawn in white. And a
duplicate `.rep` rule left behind by the v67 edit sat *after* the new one and
reset `display:grid`, so the two-column notes promised in v68 were never
actually columning up. They are now. Claiming a layout worked without checking
the rendered result is exactly the mistake this project keeps writing down.

Measured: every buy and scrap driven through the real buttons — affordability at
0, 7 and 40 Energy, buying a d10, scrapping for the right refund, a full fleet
locking all four buttons, and a damaged ship refusing to scrap when clicked. All
pass, alongside the ring, ledger, roll-row and full-match suites.

---

### 69 — every flagship power rings the dice it is paying

You liked the thin violet line round a **4** while the flagship is firing Direct,
and asked for it on every power. Right instinct — and the reason it was worth
doing is that having it on Direct alone quietly said the other five faces were
doing less. They are not. They multiply just as hard.

| Flagship face | What it rings | Colour |
| --- | --- | --- |
| **#6 Attack** | every even die | red |
| **#5 Shields** | every odd die | blue |
| **#4 Direct Hit** | every 4 | violet |
| **#3 Repair** | every 3 | green |
| **#2 Energy** | every 2 | yellow |
| **#1 Reactor** | *nothing, on purpose* | — |

The **#1** stays bare exactly as you said. The Reactor raises your standing
income for the rest of the match and does not care what any die shows, so there
is nothing to point at. A ring there would be a lie.

The risk in a feature like this is a ring appearing on a die that is not actually
paying — worse than no ring at all, because the board would be teaching a rule
the engine does not follow. So the test does not check the colours; it sets the
flagship to each face in turn over a fleet showing 1 through 6, counts the rings,
then asks the engine what that panel really paid and checks
`rings × multiplier = payout`. **All six agree.** That check is
`test-flagship-rings.mjs` and runs from now on.

The old `pierce` class is gone rather than left lying about — dead furniture from
a removed rule is how this project has fooled itself before.

---

### 68 — both rolls, side by side, straights in a gold box

You said the result screen is as important as the rolling screen — it is how you
enjoy knowing what happened — and that it never showed **their flagship number**.

**Both rolls now sit one above the other**, yours then theirs, as plain numbers.
Red for even, blue for odd, and the flagship drawn as a white number ringed in
gold so you can see it took part.

The numbers are **sorted low to high**, which is the whole trick: once sorted,
every value inside a straight is contiguous, so the run can be wrapped in a
single gold box and read as `3 4 5 6 7` at a glance. Slot order carries no
meaning by the time the round is over, and the notes still name the slot for
anything that mattered.

Under each row, what the straight was worth — and if you cashed it short,
it says so: *"6 in a row — cashed as 5 for 12 Energy."* Theirs says the same,
so you can finally see what the opponent chose.

**A bug found while wiring this up.** `tally()` read your `straightPick` for
*both* fleets, so when you cashed a straight short, **the opponent was forced to
cash theirs short too.** Measured over 90 matches with a player who always takes
the shortest tier: the bot was dragged down off its own straight in **11 of 88
straights**. Now it takes its full length every time. It never favoured you — it
just meant their result depended on your button, which is not a rule anyone
agreed to.

**The blank space.** Your shot and their shot now sit **side by side** the moment
the screen is wide enough, and the notes flow into columns instead of giving one
short sentence a full-width row. On a phone both stack, unchanged.

**The bottom bar** said `BANKED` and `BASE A ROUND`, which named nothing. It now
reads **Energy bank** — in larger type, since it is the number you spend — and
**Base energy per round**, which is the standing income the flagship's **#1**
face grows.

Measured: 230 result screens with a machine checking every row — the chips must
equal the roll, the gold box must hold exactly the run and nothing else, and
each side must show exactly one flagship. All pass, and the ledgers still add up
across another 195 screens.

**One thing worth knowing, not yet acted on.** Playing both sides equally well —
same holds, same three rolls, buying the biggest ship affordable — 16 matches ran
**8 to 17 rounds, median 12**, and you won 7 of 16. Small sample, but the shape
is right: no stalls, no runaway.

---

### 67 — the result screen adds up

You said the score screen could be better and that the **+3 repair was red when
it should be green**. The colour was a one-line fix — `.hit` set red and `.hp`
never won the tiebreak — but pulling on it found something worse.

**The arithmetic on screen was wrong.** The screen said *"You attacked with 12.
Their shields blocked 7. So 9 got through."* Twelve minus seven is five. The
missing four was the **Direct**, which the total quietly folded in but the
sentences never mentioned. Every round with a Direct in it had been showing a
sum that does not work, and a player checking our maths would have concluded the
game was cheating.

So the round result is now a **ledger** rather than a paragraph. Two of them —
your shot and their shot — each running top to bottom:

    Your fleet attacked                6
    Their shields                     −6
    They put a d10 in the way         −4
    ─────────────────────────────────────
    Through to their flagship          0
    Direct — no shield stops it       +2
    ═════════════════════════════════════
    Damage to their flagship           2

Direct is a **row**, so you can see it skip the shield line. Fodder is a row, so
you can see what the ship bought you. The subtotal is where the shot stops and
the total is what lands.

Above the ledgers, three counters: **You dealt · You took · Repaired**, the
repair in green. Below them, the things that are not arithmetic — the straight,
the free ship, wasted shielding, which panel each flagship fired, their dice,
Energy banked.

Two big stacked hero cards used to eat the whole phone screen to show two
numbers. Those numbers are now one strip, and the space goes to the ledgers.

Measured: 198 result screens across 25 full matches, with a machine checking
every ledger — that the rows above the rule sum to the total, and that the
subtotal equals everything before it. **All 198 add up.** That check now runs on
every future change, so this class of error cannot come back silently.

---

### 66 — the brace screen says what it does

Three complaints, all about the screen where you decide whether to put a ship in
front of an incoming shot. All three were the same complaint underneath: **the
screen was describing itself in game-designer shorthand instead of telling a
player what will happen.**

**All eight berths now show.** It was drawing one card per ship you own, so a
four-ship fleet showed four cards in a row and the board changed shape between
the roll screen and this one. It now draws the same 3×3 you've been looking at
all round — flagship in the middle, eight numbered berths around it, empty ones
drawn as empty. *Slot 5 is empty* is information; you should be able to see it.

**The instruction was stale and wrong.** It read *"Feed it a ship? — each blocks
half its faces and sits out one round."* Half its faces stopped being the rule
in v57 — a ship blocks its own size now — so the screen had been lying for nine
versions. It now says: tap a ship to take the hit there; it blocks damage equal
to its size, then it is damaged for the next round, will not roll, and cannot be
scrapped; it is back the round after.

**The button read like a choice it isn't.** *"Take 4 on the flagship"* sits next
to a row of ships you can tap, so it looks like the fourth option on a menu. It
is not an option — it is what happens when you stop choosing. Now:
**"Continue — flagship takes 4"**, and when nothing landed, **"Continue —
nothing gets through."**

Two things fixed on the way past: the hulls were drawing a **0** on every ship,
because the screen passed a value of zero to a die that isn't rolling. They now
show no number at all, just the hull and `d6 · blocks 6`. And the counter strip
is hard-coded to five columns, so a three-item strip was bunching to the left —
it takes a `three` variant now.

Measured: 40 full matches driven through the real screen, feeding a ship on half
the brace prompts. 40/40 reached a finish, 252 brace screens drawn, every one of
them 9 cells, 1,008 empty berths rendered, no console errors.

**A note on this file.** Versions 36 through 65 were never written up here — the
detail for those lives in `HANDOFF.md` and in the git log. Worth backfilling
before the next big rule change.

---

### 35 — the number is the die

The flagship had become a white card with panel text as the hero. Wrong way
round. **The number belongs on the front of a real d6**, same weight as the
ships, because it joins your straight. Panel name and description sit under
the cube, not on top of it.

The flagship is drawn as a white cube — front face with the number, a sliver of
top and side so it reads in three dimensions, the way a dice-rolling app does
it. Ship hulls get the same slight CSS tilt. A 6 gets the little underline so
it can't be a 9.

---

### 34 — the flagship is a real white die

The flagship used to be a dark gold card with a number in the label. It now
looks like what it is: a **big white d6**, with classic pips under the face and
the panel name sitting cleanly on top.

The pips are quiet on purpose — just enough that the board reads as a dice game
— and a soft frost in the middle keeps them from cutting through the text. The
thin gold ring is what says *this is the flagship*, not a paint job over the
die. Your ships stay coloured hulls; the centre of the board is a real cube.

---

### 33 — the chevrons stay on the 4

The purple chevrons on a **4** are the face's picture — same idea as the yellow
bolts on a 1 and the green crosses on a 3. They had been hidden unless the
flagship was showing Direct that round, so most of the time a 4 looked like a
plain red attack face. That was wrong: the mark belongs on the die.

They're back on every 4, always. Direct damage itself still only lands while
your flagship is firing Direct — the violet edge on the card lights when it is.

---

### 30–32 — the flagship faces, re-measured

Dave asked a simple question — *tell me the six sides of the flagship and why
they're balanced* — and answering it honestly meant admitting they weren't.

**What went wrong.** The four original panels were balanced back at v24, all
landing between 44% and 57% against each other. But that was measured under the
old straight rules, and **Direct and the Reactor had never been through the test
at all.** Running the full six:

| Face | Average against the other five |
| --- | ---: |
| 1 Energy | 63.9% |
| 2 Reactor | **67.5%** |
| 3 Repair | 58.3% |
| 4 Direct | **27.1%** |
| 5 Shields | 42.7% |
| 6 Attack | 40.3% |

Raising the straight minimum from four to five had quietly shifted the ground
under the original tuning. **Any change to a core rule means the flagship needs
re-checking** — that's the lesson worth keeping.

**v30 — three numbers.** Energy **3 → 2**, Direct **2 → 3**, Reactor cash
**4 → 3**.

**v31 — face 1 had no reason to exist.** Face 2 paid *more* cash than face 1 and
offered the engine on top: strictly better on both axes. Its cash dropped to 2 to
match. And testing the cap turned up something useful — **+1, +3 and uncapped all
measure the same**, because you rarely roll the 2 twice and a +1 arriving in round
nine has no time to pay for itself.

**v32 — no menus on a die.** Dave's call, and it's now a rule we keep: *a face
does one thing, automatically. The choosing lives in which dice you reroll.* Face
2 is simply **your base Energy rises by 1**. It's also why the whole game still
works with real dice on a table.

The cash-or-engine menu was never the reason face 2 was strong, either. With the
cash set to **zero** it still beat a second Energy face 53.7% of the time. **A
permanent gain beats a one-off and no number fixes that** — +1 base picked up in
round three pays about 8 Energy before the match ends, against a flat 2.

**Where the six landed.** Each face measured in place — the real flagship against
one with that face swapped for a second Attack:

| Face | Worth |
| --- | ---: |
| 1 Energy | 50.2% |
| **2 Reactor** | **56.0%** |
| 3 Repair | 52.4% |
| 4 Direct | 50.1% |
| 5 Shields | 49.0% |
| 6 Attack | 49.9% |

Five of six within a point and a half. The Reactor stays the strongest by about 6
points, and that's inherent rather than a tuning error. It doesn't unbalance
anything today because both players start with the identical flagship — **but it
will matter the moment flagship faces become buyable**, because nobody would ever
sell their Reactor. Price it accordingly.

One methodology note for next time: putting a panel on **all six faces** to
measure it *overstates anything permanent*, because the Reactor reaches its cap in
three rounds and then collects forever. For a face with a lasting effect, test it
in place instead.

---

### 29 — the flagship fires *and* joins the line

You were right and I was wrong. Making you choose between the flagship's boost
and its number was a false economy: **the moment worth building toward is your
whole fleet lining up, flagship included**, and charging you for it took the joy
out of the thing the game is about.

**It does both now.** The boost fires, and its number joins your straight. It
still never scores as attack or shields — that would be three jobs off one roll —
and the flagship card lights with the orange bar when it's part of the line.

Giving it away costs nothing, because **raising the minimum to five already paid
for the ninth die**:

| Fleet | Old — min 4, no flagship | v29 — min 5, flagship always in |
| --- | ---: | ---: |
| Mid — 4d4 2d6 2d8 | 82% | **60%** |
| Late — 2d4 2d6 2d8 2d10 | 75% | **56%** |

Straights are *less* frequent than they were in v27, not more — and 60% is inside
the band where a bonus still feels like an event rather than base attack with
extra steps.

The flagship turns a nothing into a straight in **8% of rounds**, and in the
opening it's the only way in at all: four d4s make 1-2-3-4 and the flagship's 5
completes the line. Your first straight of the match will almost always be that
exact moment.

---

### 28 — you choose how to take the hit

Four things at once, and they lean on each other.

**Cannon fodder.** When damage gets through, the round stops and asks you. Take it
on the flagship, or **put one ship in front of it**. That ship soaks a flat **2**
and loses half its faces for **4 rounds** — and *you* pick which half: **red-damaged**
loses its evens and can still block and heal, **blue-damaged** loses its odds and
can still shoot. A ship that's already crippled can be thrown in again, which
**destroys it** and frees the slot.

The attacker never picks a target. That inversion is the whole point: when the
attacker chose, economy-sniping won 84% of matches and left the loser with less
than one ship. When the *defender* chooses, nobody ever takes a trade that's worse
for them than the alternative, so the spiral can't start.

Why a flat 2 rather than something scaled to the hull:

| Soak | Always sacrificing beats never |
| --- | ---: |
| Half its faces (2/3/4/5) | 42% |
| **Flat 2, crippled ships can be finished off** | **49.6%** |
| Flat 5 | 67% — you'd always do it |

And flat is right because **half a d10 is barely worth more than half a d4** (12.8
against 9.5 over four rounds). Scale the soak to size and your capital ship
becomes the best fodder in the fleet, which is backwards. Flat makes cheap hulls
the fodder, which is both the fantasy and the first real job d4s have had.

**Straights need five dice now, and the flagship can join one.** At four, a
mid-game fleet landed a straight in **82% of rounds** — and our own rule says a
bonus firing above 75% is just base attack with extra steps. Five brings it to
52%, and letting the flagship in brings it back to 59%.

The flagship lends its **number** to the line and nothing else — no shields, no
attack — and its boost doesn't fire that round. Measured, the face worth spending
is the **5**, by a mile: 27% of rounds against 3–6% for every other face, because
your d4s already cover 1 to 4 and 5 is the wall they can never get past. Since the
5 face is Shields, the marquee decision is *take the shields, or finish the line?*

**Face 2 is the Reactor.** Take **4 Energy now**, or **+1 to your base Energy for
the rest of the match**, capped at +3. Base Energy is worth exactly the rounds
remaining, so the engine is right early and the cash is right late — the hinge is
about round seven. It's the only face that changes your future rather than your
round.

**The chevrons are on the 4** — but only while your flagship is actually firing
Direct, so the mark never promises damage that isn't happening. The card takes a
violet edge at the same time.

---

### 21 — health, hit points, and no more rounds

The biggest change since the game was rebuilt. **The scoreboard is gone.** Your
flagship has hit points, and the match ends when one of them is destroyed.

**Three green crosses ride on the 3**, on every die, the way Energy rides on the
1 and the 2. They heal your flagship.

| Face | Does |
| --- | --- |
| **1** | blocks for 1, pays 2⚡ |
| **2** | hits for 2, pays 1⚡ |
| **3** | blocks for 3, heals **3** |
| 4 and up | blocks or hits as normal |

The 3 is a *blue* face, so it blocks and heals at once — which is what finally
makes a defensive round pay for itself. That has been the game's biggest hole
since v07: shields evaporated while damage compounded, so nobody built defence.
Now a quiet round is a round you gained something in, and it needed one symbol
rather than a whole subsystem.

It's also a real reroll ache. You're looking at a 3 — take 3 shields plus 3
health, or push it to a 4 and hit? That's the same shape as the choice between a
1 and a 2, which is what the whole face model was built around.

**Flagships start on 60 and there is no round limit.** The worry was stalemates,
and they don't happen: across 54,000 uncapped matches in the model, **not one
failed to end**, and in the real build it's 100% with nothing reaching the safety
net. The reason is already in the dice — attack scales with fleet quality while
healing per die *shrinks* as your ships get bigger, because a d4 shows a 3 a
quarter of the time and a d10 only a tenth. The ramp is built in.

Starting HP is now the length dial:

| Starting HP | Median match | Slowest 10% | Longest seen |
| ---: | ---: | ---: | ---: |
| 40 | 8 rounds | 13 | 17 |
| 50 | 10 rounds | 14 | 17 |
| **60** | **11 rounds** | 15 | 18 |

**And the war escalates.** From round 8, every attack gains 2 more each round.
Without it a stubborn pair of walls can drag a match past 20 rounds, which in a
game played once a day is nearly a month — long enough that someone stops
answering. It moves a typical match by about one round and cuts the worst case
from 23 to 18.

All four numbers — hit points, health per 3, when the war escalates and by how
much — are in the Tune panel.

---

### 20 — the Rocket

A one-shot panel you bolt onto the flagship. **It fills two faces. The first
round either one comes up it launches for 25 attack, and both faces are left
blank** — and a blank is a hardpoint you can arm again with anything.

Costs 20⚡, and both numbers are in the Tune panel.

Two faces rather than one is the whole design, and it isn't cosmetic:

| Version | Fires | Best line wins |
| --- | ---: | ---: |
| One face, fires when rolled | 56% | 45.4% — a losing buy |
| **Two faces, fires when rolled** | **84%** | **54.7%** |
| One face, you choose the round | 100% | 66.8% — dominant |

Letting you pick the round breaks it, and **price can't fix that** — raising the
cost from 15 to 20 moved the best line by less than two points, because by round
eight the Energy you're hoarding was worthless anyway. What balances a consumable
in this game is not knowing when it goes off. It's a huge rocket, so it takes up
two sides of the ship: the theme and the balance are the same rule.

What makes it worth having at all is that **the shipyard is nearly dead in the
back half.** A d10 bought in round two adds 24 damage across the match; the same
d10 bought in round ten adds 0.1. A one-shot is worth the same whenever you fire
it, so it's the natural late buy — and the timing is a real test:

| You buy it in | Best line wins |
| ---: | ---: |
| Round 3 | 13.5% |
| Round 5 | 48.5% |
| Round 8 | 54.7% |

Buy it early and you starve the engine that was going to win you the match.

It did **not** fix the Energy problem, though — end-of-match banked Energy went
from 13.5 to 13.6. You spend 20 once and then carry on accumulating. The carry
cap stays an open question.

---

### 19 — the bolts are big and yellow

Energy is **yellow** now, and not only on the die — the whole resource changed
colour, so the bolt on the face and the Energy number in the totals bar and the
price in the shipyard are all the same `#ffe81f`. One resource, one colour. It
would have been worse to leave the symbol yellow and the number purple.

And the bolts are roughly **80% taller**:

| Hull | Bolt height was | Now | Number moved up to |
| --- | ---: | ---: | ---: |
| d4 triangle | 11.4 | **20.4** | y 50 |
| d6 square | 12.0 | **20.4** | y 48 |
| d8 diamond | 10.2 | **18.0** | y 48 |
| d10 pentagon | 12.0 | **21.6** | y 52 |

At this size the polygon walls become the real constraint, so I checked every
bolt corner against the actual hull outline rather than eyeballing it. All four
shapes clear it, with 9–10 units of air between the digit's baseline and the top
of the bolts.

The diamond is still the awkward one and still runs the smallest bolts — it
narrows fast, so two full-size bolts would poke through its lower edges.

One thing to watch on your phone: **energy yellow and straight gold are now
neighbours** (`#ffe81f` against `#ffd75e`). They're doing different jobs in
different places — bolts inside the shape, gold bar along the card's bottom edge
— but if it reads muddy to you, the clean fix is to hand straights the violet
that Energy just vacated. Say the word.

---

### 18 — the Energy bolts are printed on the face

The bolts moved **inside the shape**, sitting below the number the way they'd be
printed on a real die. The separate row underneath the card is gone.

They're drawn as a path rather than typed as ⚡, which matters for two reasons:
the glyph turns into a colour emoji on some phones, and a drawn bolt scales with
the hull instead of fighting the text baseline.

Each hull needed its own placement, because a polygon's usable space isn't where
you'd guess:

| Hull | Number sits | Bolts sit | Bolt size |
| --- | ---: | ---: | ---: |
| d4 triangle | y 60 | y 78 | 95% |
| d6 square | y 54 | y 74 | 100% |
| d8 diamond | y 56 | y 76 | 85% |
| d10 pentagon | y 58 | y 80 | 100% |

The diamond was the awkward one. It narrows fast toward the bottom — at y 76 it's
only about 34 units wide — so its bolts are shrunk to 85% and its number rides
higher to leave them room. The triangle is the opposite: widest exactly where the
bolts want to be, so they tuck in comfortably low.

A 1 shows two bolts and a 2 shows one, which is the rule made visible: **the lower
face pays more.**

---

### 17 — the hull is the shape

Ships are drawn as their dice now:

| Ship | Shape |
| --- | --- |
| **d4** | triangle |
| **d6** | square |
| **d8** | diamond |
| **d10** | pentagon |

Each is an SVG outline in the face's colour — red for a hit, blue for a block —
with the number sitting inside it and a soft fill so it reads as a hull rather
than a wireframe.

**The "d4" caption is gone**, which was the point. Once the silhouette carries the
size you read the ship at a glance instead of reading a label, and the card gets
its vertical space back.

One detail worth noting: the numbers sit at each shape's **visual** centre, not
its geometric one. A triangle's mass is low so the digit drops; a pentagon's is
slightly high so it lifts. Centring them all the same way looks subtly wrong even
though it's mathematically correct.

The d6 and d8 use the same four corners — the diamond is just the square turned
45° — which keeps them clearly distinct while making the family feel related.

White selection outline and the gold straight bar both still sit on the card
rather than the shape, so all three signals stay readable at once.

---

### 16 — the 1 and 2 rejoin the fight

You were right that there was no reason to sit them out. **Every face fights now:
odd blocks, even hits, and the two lowest also pay Energy on top.**

| Face | Does |
| --- | --- |
| **1** | blocks for 1, pays 2⚡ |
| **2** | hits for 2, pays 1⚡ |
| 3 and up | blocks or hits as normal |

The nice consequence is the shape it gives a die. Valuing an Energy at about two
attack, the faces of a d6 come out worth **5, 4, 3, 4, 5, 6** — so the **1 is your
best low roll**, the middle is a dead zone, and the top is the top. Both ends of
the die are good for opposite reasons, and the reroll decision lives in the
middle where it belongs.

What it changes elsewhere:

| | v15 pure Energy | v16 they fight |
| --- | ---: | ---: |
| d4 combat value | 1.75 | **2.50** |
| d10 combat value | 5.20 | **5.50** |
| d10 ÷ d4 | 2.97× | **2.20×** |

Small ships gained the most, so the gap between a scout and a capital ship
narrowed back from 2.97× to 2.20×. A fleet of d4s is a real fighting force again
rather than only a fuel operation.

The trade, stated plainly: with the 1 counted as a shield, red averages more than
blue again — 20% on a d10, 50% on a d4, because the top face of every die is even.
That gap is the price of the clean rule, and it lands on shields, which have been
the weaker side all along.

---

### 15 — white means you tapped it, and straights pay properly

**Gold was doing three jobs at once** — selection, straight membership, and the
flagship — so on a board where 1-2-3-4 lit up every die you couldn't tell which
one you'd tapped.

Now the two are different in both colour *and* shape:

| | Looks like | Means |
| --- | --- | --- |
| **Selected** | white outline, white REROLL tag | something **you** did |
| **In your straight** | gold bar along the bottom edge | something the **game** did |

Different hue and different shape, so it reads even at a glance on a phone.

**And a straight of four now pays the biggest ship in it, not half of it:**

| Straight of 4 | d4 | d6 | d8 | d10 |
| --- | ---: | ---: | ---: | ---: |
| Was | 2⚡ | 3⚡ | 4⚡ | 5⚡ |
| **Now** | **4⚡** | **6⚡** | **8⚡** | **10⚡** |

You were right that this was broken. Four in a row on a fleet of d4s paid 2
Energy — **exactly what a single die showing a 2 pays** — despite being vastly
harder to achieve. It now pays 4, so a straight is twice a lone Energy face. A
straight of five pays half again on top: 6 / 9 / 12 / 15.

Total Energy income goes from 3.9 to 4.8 a round early on, which means you can
buy roughly a ship a round from the start instead of waiting two.

---

### 14 — only the dice you rolled wiggle

A real bug, and an instructive one. `render()` rebuilds every die element from
scratch, so a CSS animation class attached to a die replayed **every time
anything re-rendered** — including tapping a die to select it. The whole board
shook whenever you touched one.

The fix is that the animation flag lives in a **one-shot set consumed by the next
render**, not on the dice themselves:

- Reroll → only the dice that actually changed are flagged
- Nudge → only that one die
- A fresh round → all of them, once
- Tapping, buying, cashing a straight → nothing, because the set was already
  emptied at the end of the previous render

So the wiggle now means exactly one thing: *this die just changed.* Which makes
it useful information rather than decoration — with three rolls a round you can
glance at the board and see what moved.

---

### 13 — tap what you want to change, buttons under the dice

Three interface fixes, and they turn out to be one idea: **you always tap the
dice you want to change**, whether the roll is free or paid.

**The selection flipped.** Tapping a die now marks it **REROLL** rather than HELD.
That's the right way round for two reasons — it matches how you think about it
("I want to change these two"), and it makes the paid reroll identical to the
free one instead of a second, backwards mechanic.

**The buttons moved up under the dice**, so the grid is still on screen when the
numbers change. They also tumble briefly when they land, so you can see which
ones moved.

**Energy rerolls are their own button.** While you have free rolls it reads
*Reroll 2 — 2 rolls left*. Once they're gone it becomes *Reroll 2 for 2⚡* — one
Energy per die. And when exactly one die is picked, **+1** and **−1** nudge
buttons appear next to it, so all three ways of changing a die sit in the same row:

| Situation | What you get |
| --- | --- |
| Free rolls remaining | Reroll any number of dice, free |
| Free rolls gone | Reroll for 1⚡ a die |
| Exactly one die picked | +1 or −1 for 1⚡ |

The distinction that makes both worth having: **a reroll is random, a nudge is
exact.** Same price, opposite tools. Late in a round when you need a 5 and you're
holding a 4, the nudge is worth far more than a gamble.

---

### 12 — three rolls a round, hold the dice you want

**Yahtzee structure.** Roll everything, tap the dice you want to **hold**, roll
the rest. Three rolls a round. Nudging still works after that for 1 Energy, and
does a different job — rolling is random, nudging is exact.

This is a different mechanic to the paid rerolls removed in v05, and better for a
specific reason. Paid rerolls were a soft decision you made over and over: *is
one more worth an Energy.* Three rolls is finite and free, so the decision moves
to **which dice to keep** — and that turns out to have real teeth, because the
dice you send back to chase a longer straight are dice whose **attack you're
gambling.** Reroll an 8 and a 10 hunting one more number and you've staked 18
attack on it.

**Three rolls makes a straight about two lengths easier**, measured on a full
eight-ship fleet:

| | 1 roll | 2 rolls | 3 rolls |
| --- | ---: | ---: | ---: |
| 4 in a row | 47% | 76% | **88%** |
| 5 in a row | 19% | 46% | **64%** |
| 6 in a row | 6% | 24% | **40%** |
| 7 in a row | 1% | 6% | **16%** |
| 8 in a row | — | — | **3.7%** |

So rather than raise the minimum, the **prize tiers step up two lengths.** The
odds at 6, 7 and 8 in a row are now almost exactly what 4, 5 and 6 used to be —
same feel, bigger numbers, and the whole top of the ladder finally gets used:

| Straight | Prize | d4 | d6 | d8 | d10 |
| --- | --- | ---: | ---: | ---: | ---: |
| **4 in a row** | Energy | 2⚡ | 3⚡ | 4⚡ | 5⚡ |
| **5 in a row** | Energy | 4⚡ | 6⚡ | 8⚡ | 10⚡ |
| **6 in a row** | Attack | 8 | 12 | 16 | 20 |
| **7 in a row** | Attack | 12 | 18 | 24 | 30 |
| **8 in a row** | A free ship + attack | d4 +8 | d6 +12 | d8 +16 | d10 +20 |

A straight of four is now just your income rather than a prize, which is the right
job for something that lands 88% of the time.

**On when the Energy arrives — it has to be at lock, spendable next round.**

If this round's Energy were spendable this round, there'd be a loop: nudge a die
down to a 2, collect 2 Energy, spend 1 nudging another die down to a 2, collect 2
more. A nudge costs 1 and a 2 pays 2, so it's net positive forever. So what you
spend during a round is what you banked before it, and what you earn lands when
you lock. Clean, and no arithmetic trap.

The opponent gets the same three rolls and holds toward its own best straight.

---

### 11 — upkeep removed, and charged flagship panels

**The upkeep is gone.** You were right to be confused by it — it was a second
concept doing almost no work. Measured across whole matches:

| | End fleet | d8+ ships | Total attack |
| --- | --- | ---: | ---: |
| Upkeep on | 7.9 ships, avg d5.2 | 1.0 | 127 |
| Upkeep off | 7.9 ships, avg d5.3 | 1.2 | 149 |

Almost identical, because **price was already the limiter.** Eight d10s cost
104 Energy to assemble and you only earn 60–80 across a match, so the tax was
guarding against a fleet nobody could afford. Removing it makes both sides about
17% stronger and changes nothing strategically. The setting survives in the Tune
panel as a safety valve, defaulted to 0.

So Energy now has **one job: it is what you spend.** Rerolls, nudges, ships,
panels — never a bill you owe.

**And your idea for the fourth thing to spend it on is in: charged panels.**

| Panel | Fire it | Free |
| --- | --- | --- |
| **Overload** | 3⚡ → add 20 attack | add 5 |
| **Bulwark** | 3⚡ → add 20 shields | add 5 |
| **Full Spread** | 2⚡ → every red die hits for 4 more | 1 more |
| **Refit Bay** | 4⚡ → a free d6 joins your fleet | gain 2 Energy |

When one of these comes up on your flagship, a **Fire** button appears and the
flagship lights up if you pay. Each is worth roughly three times its charge, so
firing is usually right and skipping is never a disaster — the decision is
whether this round is the one worth spending on, which is the good kind of
question.

This is a much better use of Energy than upkeep was. A bill you owe every round
is arithmetic; a button you choose to press is a decision.

The 1 and 2 are now called **Energy faces** rather than fuel, and the word fuel
is gone from the game entirely.

---

### 10 — the 1 and 2 are pure Energy

**The whole face rule now fits in one line: 1 and 2 are fuel and pay their own
number, everything above fights — odd blocks, even hits.**

This does three good things at once.

It's cleaner. A face is either fuel or a weapon, never both, and the number tells
you how much of whichever it is.

It narrows the red/blue imbalance, because the low faces were where the problem
lived. Red's edge over blue drops from 20–50% to **17–33%**.

And it makes "small ships are tankers, big ships are warships" **structurally**
true instead of merely statistical. A d4 has two fuel faces and two combat faces.
A d10 has two and eight.

| Per roll | d4 | d6 | d8 | d10 |
| --- | ---: | ---: | ---: | ---: |
| Combat value | 1.75 | 3.00 | 4.13 | 5.20 |
| Fuel | 0.75 | 0.50 | 0.38 | 0.30 |

A d10 is now 2.97× a d4 in combat, up from 2.20×. That's a real shift toward
bigger-is-better, so the thing worth checking was whether the fuel economy still
holds the line. It does — **the best fleet is unchanged:**

| Fleet | Attack, before | Attack, now |
| --- | ---: | ---: |
| 8 × d4 | 22.7 | 16.2 |
| 4d4 2d6 2d8 | 35.4 | 30.0 |
| **3d4 2d6 2d8 1d10** | **36.0** | **35.7** |
| 2d4 2d6 2d8 2d10 | 34.0 | 33.8 |
| 8 × d10 | 27.6 | 25.5 |

A flagship inside a screen still wins. What changed is that the all-small fleet
lost 29% of its punch, so the curve is steeper and a fleet of nothing but scouts
is now clearly a fuel operation rather than a fighting force.

**1 and 2 still count as numbers for straights**, which matters — it keeps the
best decision in the game and actually sharpens it. A 2 on a d8 now pays you fuel
*and* can bridge a straight, while a 4 on the same die just hits. Choosing between
them got harder.

The Tune panel setting is "Faces that are pure fuel" — set it to 0 to play v09,
or 3 if you want scouts to be almost purely tankers.

---

### 09 — shield panels halved, store priced flat

**The 1 stays blue.** It doesn't need to be white for the flagship's sake — the
flagship has its own six panels and never touches the numbered dice, so nothing
is being kept from it. Blue keeps the visual rule perfect and the extra point
lands where it's useful.

**Shield panels halved: +2 each becomes +1 each, and the store's +4 becomes +2.**

Your instinct was right and a bug was making it worse. `applyPanel` was still
skipping the 1 when it counted blue dice, left over from when the 1 wasn't blue.
Once fixed, the shield panel measured **exactly double** its red counterpart —
7.0 against 3.5. Halving it lands both on 3.5.

The reason a point of shield is now worth about a point of attack: damage is
`attack − their shields`, so adding one shield lowers their number by the same
amount that adding one attack raises yours. Both move the gap by one. That was
only untrue while shields were routinely wasted, and at 10 against 16 they rarely
are any more.

| Starting panel | Value |
| --- | ---: |
| Attack +1 each | 3.5 |
| Shield +1 each | 3.5 |
| Energy +2 | 4.0 |
| Attack +4 | 4.0 |

Spread 1.15× — the tightest the panels have ever been.

**Store repriced so every panel returns exactly 1.00 value per Energy:** Attack
+2 each and Shield +2 each at 7⚡, Attack +9 at 9⚡, Energy +5 at 10⚡. Nothing in
the store is a trap and nothing is an auto-buy; you're choosing what your fleet
needs, not what's underpriced.

Worth noting why this tuning is even possible: **both sides start with identical
ships.** There's no faction to balance against, only the internal question of
whether the four things you can spend on are worth the same. That's a much
easier problem and it's why the numbers are converging.

---

### 08 — the 1 turns blue, and straights pay three different prizes

**Every odd number is blue and every even number is red, no exceptions.** The 1
rejoins the shield side and still pays 2 Energy. The visual rule is now perfect,
which is worth more than the identity it costs.

The cost, stated plainly: with the 1 counted as defence, red averages more than
blue — 20% on a d10, 50% on a d4 — because the top face of every die is even.
Pulling the 1 out had made them exactly equal. But the extra point lands on
shields, which were the weaker side, so the practical effect is a buff to the
thing that needed one.

**Straights now pay by length, and the prizes are different in kind:**

| Straight | Prize | d4 | d6 | d8 | d10 |
| --- | --- | ---: | ---: | ---: | ---: |
| **4 in a row** | Energy | 2⚡ | 3⚡ | 4⚡ | 5⚡ |
| **5 in a row** | Attack | 10 | 15 | 20 | 25 |
| **6 in a row** | A free ship | d4 +8 | d6 +12 | d8 +16 | d10 +20 |
| **7 in a row** | A bigger free ship | d6 +12 | d8 +18 | d10 +24 | d10 +30 |

The ship you earn is the size of the biggest ship that took part, which is both
thematic and self-balancing.

**You may always cash a straight in at a shorter length.** Rolled five in a row
but would rather build than fight? Take the Energy. That choice is the best new
decision in the game and it costs no new rules.

Only ever one straight per round. Two separate straights of four turned out to
need eight distinct values in two blocks — it happens 0% of the time for a mixed
fleet and 2% for all-small, so it isn't worth the complexity.

**What this did to the shape of the game:**

| | v07 | v08 |
| --- | ---: | ---: |
| Straights as share of attack | 49% | **27%** |
| Shields per round | 5.6 | **10.0** |
| Base attack per round | 16.5 | 13.5 |

Straights were half the game and are now a quarter, which leaves room for the
other paths. Shields nearly doubled and now block about 62% of incoming attack
rather than 20% — so defence is a real thing for the first time, and your
straights-pierce-shields idea suddenly has a wall to punch through.

Damage per round drops a long way as a result, from roughly 23 to 6. That is a
much tighter game, which is what we were aiming at, but it is a big swing and
wants playtesting before we trust it. If it feels too tight, the fastest dials
are the straight multiplier and Energy from a 2.

---

### 07 — a straight needs four dice

**Straights now need 4 in a row, not 3.** At three you had a straight in 75% of
rounds, which meant it wasn't a bonus at all — it was part of your base attack.
Four lands it in 47%, so it's something you achieve about half the time.

| Minimum | Rounds with a straight |
| --- | ---: |
| 3 in a row | 75.5% — too common to feel earned |
| **4 in a row** | **46.9%** |
| 5 in a row | 19.3% — a genuine event |
| 6 in a row | 6.2% — too rare |

Also tested paying **2 × the number of dice** (4 in a row = 8, 7 in a row = 14)
and it doesn't work, though the reason is interesting. Every extension pays
exactly +2 whatever the difficulty:

| Extend | Linear 2×N | The table |
| --- | ---: | ---: |
| 3 → 4 | +2 | +4 |
| 4 → 5 | +2 | +6 |
| 5 → 6 | +2 | +8 |
| 6 → 7 | +2 | +10 |

Going 6 → 7 is **20× harder** than 3 → 4 — one round in 112 against one in three
— but linear pays the same for both, so you'd never chase it. Total value per
round comes out almost identical (6.0 against 6.7), so linear isn't weaker, it's
flat. The escalation is the whole point: each extra die is worth more than the
last, which is what makes a long straight worth spending Energy on.

Try minimum 5 in the Tune panel if you want straights to be rare and huge.

---

### 06 — straights priced by how hard they are

Every straight now pays attack from a table, and the table is built from measured
probability rather than a formula:

| | d4 | d6 | d8 | d10 |
| --- | ---: | ---: | ---: | ---: |
| **3 in a row** | 4 | 5 | 6 | 7 |
| **4 in a row** | 8 | 10 | 12 | 14 |
| **5 in a row** | 14 | 18 | 21 | 25 |
| **6 in a row** | 22 | 28 | 33 | 39 |

Measuring the odds overturned the obvious assumption. **A d10 straight is not
rarer than a d4 straight — it is far more common.** Once you own big ships they
join nearly every straight and quietly upgrade its tier, so the small-tier
straights almost vanish. In a fleet holding all four sizes, a d6 straight of
three lands under 1% of rounds while a d10 straight of three lands 23%.

What is actually rare is **length**. Three in a row happens most rounds; five is
roughly one in ten; six about one in twenty. So length sets the size of the
prize and the biggest ship in the straight lifts it for what you paid to own it.

That is why the table rises steeply down the rows and gently across the columns.
Straights are worth about a third of your attack early and two thirds late —
enough that nudging a die into place is usually the best Energy you can spend.

The engine now picks whichever straight **pays most**, not whichever is longest.
A d10 straight of five pays 25 while a d4 straight of six pays 22, so "longest
wins" would sometimes have handed you the weaker one.

A reference table appears on the roll screen whenever you have no straight, so
the payoffs are never a mystery.

---

### 05 — no rerolls, buy any size, scrap for room

**Rerolls are gone.** They were Energy with extra steps, and "roll again and hope"
isn't a skill. Nudging is now the only way to shape a roll: 1 Energy moves a die
up or down by one. What you roll is what you have, and Energy is how you change
it. (Still a Tune setting if you want them back.)

**Panels lost the clever names and the clever effects.** Four types now, and
they say what they do:

| Starting | Store |
| --- | --- |
| Attack +1 each | Attack +2 each — 9⚡ |
| Shield +2 each | Shield +4 each — 9⚡ |
| Energy +2 | Energy +5 — 9⚡ |
| Attack +4 | Attack +9 — 8⚡ |

The straight and reroll panels are cut. Straights belong to the fleet, not the
flagship.

**Growing a die is replaced by buying any size outright, and scrapping to make
room.** Prices are 4 / 6 / 9 / 13, and scrapping returns half — you lose on the
deal, so you scrap to free a slot, not to raise cash.

The prices took work. At the obvious ones (4 / 8 / 14 / 22) two d4s beat one d6
for the same money, so saving up was *mathematically wrong* and buying the
cheapest thing always won:

| Strategy | Old prices | Value prices |
| --- | ---: | ---: |
| Buy the biggest you can afford | 176 | **187** |
| Buy d4s forever | 170 | 169 |
| Only buy d6+ | 135 | 154 |
| Only buy d8+ | 122 | 134 |

Pricing dice by what they're worth rather than by how many sides they have gives
"buy bigger when you can" a real 11% edge. Note that pure hoarding still loses,
which is correct — sitting on Energy shouldn't be rewarded, and the decision is
"can I afford better this round" rather than "should I skip a turn."

Eight fleet slots now, since the flagship holds the ninth cell of the grid.

---

### 04 — the flagship you design

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
