# Fleet Dice — read this first

This is the single entry point for anyone new to the project, human or AI.
Everything you need to be useful is either here or pointed at from here.

**Current version: v79.** Open `simple.html`.

---

## The prompt to hand a new assistant

Copy everything between the lines.

---

> I'm designing a dice-building battle game called **Fleet Dice**. I'm not a
> developer — I think in terms of how the game feels, and I rely on you for the
> maths and the code.
>
> **Read `HANDOFF.md` in this folder before doing anything.** It has the current
> rules, the numbers, the file map, and the working process. Then read `IDEAS.md`
> for where the game stands right now and what I'm deciding between, and
> `VERSIONS.md` for how we got here.
>
> How I want you to work:
>
> 1. **Measure before you believe.** Almost every design instinct in this project
>    turned out to be wrong, mine and yours. Before you tell me a change is good,
>    play it out in simulation and show me the numbers. If you're guessing, say
>    you're guessing.
> 2. **The whole game is one file, `simple.html`.** No build step, no server. I
>    open it by double-clicking. Keep it that way.
> 3. **Snapshot before you change rules.** Copy `simple.html` to the next
>    `simpleNN.html`, bump the `VERSION` string, then edit. Never edit an old
>    snapshot. Write up what changed and why in `VERSIONS.md`, newest at the top,
>    including the measurements that justified it.
> 4. **Numbers are mine, rules are ours.** Anything numeric lives in the `C`
>    object and is editable live in the Tune panel, so I can feel a change without
>    a rebuild. If I tell you a setting felt right, make it the default.
> 5. **Test in the real build, not just in a model.** There are 27 `test-*` scripts
>    in this folder. Run them. They boot the actual file, play real matches and
>    read what the screen says.
> 6. **Assert before you write.** A find-and-replace that matches nothing reports
>    success and changes nothing. This has cost us four separate versions. Every
>    edit should prove it matched before saving the file.
> 7. **Tell me when I'm wrong, and show your working.** I'd rather hear "that
>    measured at 84% and would break the game" than have you build it politely.
> 8. **Plain words.** If you use a term, make sure it names something in the game
>    today. We once carried a word for nine versions after deleting the rule it
>    described.
>
> Write like you're explaining it to me over coffee — warm, direct, paragraphs
> over bullet lists, and no jargon I haven't used first.

---

## What the game is

Each player commands a **fleet of dice**. Every die is a ship: a **d4**, **d6**,
**d8** or **d10**, sitting in a 3×3 grid. In the middle is your **flagship**, a
normal **d6** with **health**. The match ends when a flagship is destroyed.

Both sides submit a round at once — the idea is friends playing over days,
everyone locking in their round and finding out next morning what happened.

The design brief that started it: *dice that upgrade in size and in individual
faces, some faces blank and upgradeable, and it has to be genuinely fun.*

---

## The rules as they stand (v79)

### Every ship die

**Even hits, odd blocks** — that covers every face on every ship, the 1 included.
On top of that, the four lowest faces each do a second job:

| Face | Fights | Also, always |
| ---: | --- | --- |
| **1** | blocks for 1 | **two yellow bolts** — 2 Energy |
| **2** | hits for 2 | **two violet chevrons** — 2 **Direct**, unblockable |
| **3** | blocks for 3 | **three green crosses** — repairs 3 |
| **4** | hits for 4 | **one yellow bolt** — 1 Energy |
| **5 and up** | odd blocks, even hits | nothing — a big face is just its number |

**Direct moved to the 2 in v78, and Energy to the 4.** On a d4 the 4 is the top
face, so it was collecting the biggest attack *and* the unblockable damage at
once. The odds are identical either way, but it mattered enormously, because
everyone **holds their high numbers** — "keep your best attack" had been quietly
farming Direct every round. d4 Direct fell from 6.57 to 2.77 a round. Attack and
Direct now pull against each other, which is a real decision.

**Every printed symbol always pays.** The flagship boosts them; it never switches
them on.

### The flagship — a normal d6

It rolls with the fleet and **never fights**. Its number joins your straight, and
whichever face it lands on **adds a bonus to every ship showing that same
number**. Those ships get a thin ring in the flagship's colour so you can see it.

**Each face does one thing, automatically. No menus on a die** — the choosing in
this game lives in which dice you reroll.

| Face | At level 1 |
| ---: | --- |
| **1 Reactor** | your base Energy rises by **2** a round, for the rest of the match (cap 6) |
| **2 Direct** | every **2** you roll fires **2** more Direct |
| **3 Repair** | every **3** you roll repairs **2** more |
| **4 Energy** | every **4** you roll pays **2** more Energy |
| **5 Shields** | every blue die blocks **2** more |
| **6 Attack** | every red die hits **2** more |

**The level is the size of the bonus.** Level 1 adds 2 a match, level 2 adds 3,
level 3 adds 4. One purchase raises all six faces. The **#1** face is the
exception — it has no matching die, so it rings nothing.

**It never scores itself.** Its number bridges a straight and nothing else. A
flagship on 6 is not a red die for "+2 per attack". This has been got wrong three
separate times; if a total looks high, check this first.

### A round

1. **Between rounds.** Scrap a ship, buy a ship, upgrade the flagship's level.
2. **Roll.** Three rolls. Tap the dice you want to change, then Reroll. After the
   free rolls it costs 1 Energy a die. Whatever you send back gambles the attack
   it was already showing.
3. **Straights.** Five or more consecutive numbers across the fleet, and the
   flagship's number counts toward the line. **Length** decides what kind of prize;
   the **biggest ship in the line** decides how big. A long straight may be cashed
   as a shorter one — there is a banner on the roll screen with a button per tier
   and the totals move live as you pick.
4. **Submit.** Both fleets fire at once. Your **volley** is `your attack − their
   shields`. **Direct** is tracked separately and **nothing stops it** — not
   shields, not a ship thrown in front of it.
5. **Take the hit.** If the volley got through, *you* decide: all on the flagship,
   or put **one ship** in front of it. That ship blocks its own size — a d10
   blocks 10 — and is **Damaged** for the next round: greyed in its slot, not
   rolling, not rerollable, not scrappable. Back the round after. **A fed ship
   cannot touch Direct.**
6. **Repair.** Your 3s repair your flagship.

### Winning

The match ends when a flagship reaches zero. There is no round limit in practice
(a 40-round backstop exists and measurement says it never fires). Matches run
about 8 to 17 rounds, median 12.

If both flagships fall in the same round the tiebreak runs: **heavier final
volley**, then **most damage across the match**, then a true draw.

From round 8 **the war escalates** — every attack gains 2 more each round — so a
stubborn pair of walls cannot drag a match into a fourth week.

---

## The numbers today

All live in the **Tune** panel, which now opens from the **version number** next
to the title. It is a designer tool, so it does not get a player-facing button.

| Setting | Value | |
| --- | ---: | --- |
| Flagship health | **60** | the length dial — 40 gives an 8-round match, 60 gives about 12 |
| Repair a 3 gives | 3 | each point adds roughly a round to a match |
| Direct a 2 gives | **2** | always, on every ship |
| Energy: a 1 pays / a 4 pays | 2 / 1 | |
| Dice needed for a straight | **5** | at 4, straights fired in 82% of rounds |
| Straight multiplier | 1 | scales the whole prize table |
| Ship prices — d4/d6/d8/d10 | 4 / 6 / 9 / 13 | priced by measured value, not by size |
| Scrap value | 50% | |
| Fleet slots | 8 | plus the flagship. You start with 4 d4s and 0 Energy |
| Rolls a round | 3 | then 1 Energy a die |
| A ship blocks | **its own size** | d4 blocks 4, d10 blocks 10 |
| Ships you may feed a round | **1** | at 2, careless play loses far too hard |
| Flagship level | 1 of 3 | the bonus is 2, then 3, then 4 |
| Flagship upgrades | 16⚡ then 26⚡ | one purchase raises all six faces |
| Reactor cap / overflow | 6 / 2⚡ | once base is capped it pays Energy instead |
| War escalates after round | 8, by 2 a round | |
| **How fast they grow** | **1.75** | a rate, not a chance — see below |

**The straight ladder**, with `runMin` at 5:

| | d4 | d6 | d8 | d10 |
| --- | --- | --- | --- | --- |
| **5 in a row** | 6⚡ | 9⚡ | 12⚡ | 15⚡ |
| **6 in a row** | 8 attack | 12 | 16 | 20 |
| **7 in a row** | 12 attack | 18 | 24 | 30 |
| **8 in a row** | free d4 + 8 | free d6 + 12 | free d8 + 16 | free d10 + 20 |

---

## Where the game stands — read this before changing anything

**There is one dominant strategy and it is not fixed.** Five plans played through
full matches:

| Plan | v77 | v78 | |
| --- | ---: | ---: | --- |
| **Fill all 8 slots with d4s, then trade up** | 100% | **100%** | unsolved |
| Flagship levels first | 43% | 83% | |
| Buy the biggest hull affordable | 21% | 75% | |
| Hoard for d10s only | 7% | 58% | |
| Only ever buy d4s | 57% | 43% | |

The v78 face swap inverted the order — **d4-forever is now the worst plan** — but
*fill the slots then trade up* still wins every match. That is the **slot
economy**, not the faces: slots are nearly free, every slot rolls every round, and
no change to a die face can touch it. `IDEAS.md` has the three candidate fixes.

**The opponent grows a hull in place, for free, and you cannot.** `themGrow` does
`d4 → d6 → d8 → d10` at no cost; you must scrap at 50% and rebuy. This is a real
unfairness that has been running the whole time, and fixing it — pay the price
difference to grow a hull where it sits — is the recommended next move. It is also
the mechanic the original brief asked for.

**What eight ships of one size actually produce a round** (three rolls, the
opponent's own hold logic, 4,000 rounds each):

| Fleet | Cost | Attack | Shields | Repair | Direct | Straight% |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 × d4 | 32⚡ | 15.0 | 10.9 | **9.3** | 2.77 | 14% |
| 8 × d6 | 48⚡ | 25.0 | 15.0 | 3.5 | 2.43 | **64%** |
| 8 × d8 | 72⚡ | 30.0 | 17.8 | 2.8 | 1.91 | 50% |
| 8 × d10 | 104⚡ | 34.4 | 22.2 | 2.4 | 1.50 | 40% |

Two things fall out of that table that nothing on screen tells you. **A d6 is the
best straight fleet by a distance** — a d6 covers 1–6 tightly while a d10 spreads
across ten numbers and keeps missing the middle. And **small hulls still out-repair
big ones four to one**, because a 3 is a quarter of a d4's faces and a tenth of a
d10's. That is the open question behind Dave's "give the bigger dice some nuance"
idea; `IDEAS.md` has four measured variants of it, and the honest finding is that
only the escalating one (marks on 5/7/9 and 6/8/10) produces a real ladder.

---

## The files

| File | What it is |
| --- | --- |
| **`simple.html`** | The game. One file, no dependencies, opens by double-click. Always newest. |
| **`simple01.html` … `simple79.html`** | Frozen snapshots. Never edited again, so any version reopens in one click. |
| **`HANDOFF.md`** | This file. The entry point. |
| **`IDEAS.md`** | Where the game stands now, what the playtests found, and five things worth building. Read after this. |
| **`VERSIONS.md`** | Every version, newest first, with the measurements that justified it. |
| **`TARGETING.md`** | Designed and measured, mostly unbuilt: targeting, fodder, Direct, buy order. Deepest analysis in the project — but written before several rule changes, so check dates. |
| **`DIRECTIONS.md`** | Paths to victory, bluffing, Secret Directives, Trumps, the 2v2 layer. |
| **`DECISIONS.md`** | Every decision a player makes, marked strong or thin. |
| **`PANELS.md`** | The old flagship-panel catalogue. **Historical** — that store was removed in v72. Do not rebuild from it without reading VERSIONS.md v72 first. |
| **`test-*.mjs` / `test-*.py`** | 27 scripts. See below. |

`README.md` is accurate and describes this project.

---

## How we work

1. Dave plays a few rounds and says what feels off.
2. If it's a **number**, he changes it himself in the Tune panel and reports what
   felt right. That becomes the default.
3. If it's a **rule**, snapshot `simple.html` to the next number, bump `VERSION`,
   change the live file, and write it up in `VERSIONS.md` with the measurements.

Numbers stay in his hands. Rules stay a conversation.

---

## How to measure

**Nearly every design intuition in this project has been wrong at least once.**

**Boot the real file with jsdom** and drive it through its own functions —
`newGame()`, `startRound()`, `submit()`, `nextRound()` — checking `errors` is
empty. Everything is at top-level scope, so `w.tally(...)`, `w.bestRun(...)`,
`w.priceOf(...)`, `w.C` and the rest are callable from a test.

```js
const dom = new JSDOM(html, { runScripts: "dangerously" });
const w = dom.window;
w.newGame();
while (w.G.phase !== "over") { /* drive the phases */ }
```

**The 26 test scripts, and what each is for:**

| Script | Checks |
| --- | --- |
| `test-report-adds-up.mjs` | every ledger row sums to its total — catches damage arithmetic that lies |
| `test-rolls-row.mjs` | the roll chips match the dice, the gold box holds exactly the straight |
| `test-straight-banner.mjs` | the tier chooser, and that a pick resets on a reroll |
| `test-flagship-rings.mjs` | rings × multiplier = what the face actually paid, for all six faces |
| `test-flagship-levels.mjs` | the level ladder and the ceiling |
| `test-flagship-language.mjs` | nothing anywhere says "face pays" instead of "adds" |
| `test-face-marks.mjs` | what each face pays, and what gets drawn on the hull |
| `test-shop.mjs`, `test-shop-actions.mjs` | every buy and scrap button, at 0 / 7 / 40 Energy, full fleet, damaged ship |
| `test-prices-page.mjs`, `test-reference-pages.mjs`, `test-reference-nav.mjs` | the two reference screens open and return from every phase |
| `test-dump-roll.mjs`, `test-dump-round.mjs`, `test-dump-pages.mjs` | print every screen as plain text — read these when reviewing copy |
| `test-strategies.mjs` | the five-plan win-rate table above |
| `test-fleet-output.mjs`, `test-fleet-value.mjs` | what a fleet of one size produces a round |
| `test-head-to-head.mjs` | frozen fleets against each other |
| `test-face-ladder.mjs`, `test-face-ladder-topplain.mjs` | the four variants of the bigger-dice idea |
| `test-bot-pace.mjs`, `test-balance.mjs` | the difficulty dial and the win rate |
| `test-handoff-accuracy.mjs` | every rule number claimed in this file, checked against the engine |
| `test-dead-code.py`, `test-dead-css.py`, `test-vocabulary.py` | unreferenced functions, unapplied CSS, inconsistent words |

**Sample sizes.** Full matches through the real DOM are slow — 16 matches is about
40 seconds, and 16 matches is ±12 points. Do not call a 5-point difference real on
one run. For questions about a single round (what a fleet produces, what a face
pays) you can do thousands cheaply, and those numbers are solid.

**A model is for exploring; the real file is the truth.** More than once a model
gave a clean answer the real build contradicted — and twice the *model* was wrong
because of a bug in the harness, not the game.

### Things measured that contradicted the obvious guess

- **Moving Direct from the 4 to the 2 halved the d4's Direct**, even though the
  two faces are equally likely. What changed was what players *hold*.
- **At equal ship count big hulls dominate** (8 d10 beat 8 d4, 96%). **At equal
  money small hulls dominate** (8 d4 beat 2 d10, 100%). The thing that wins is
  slot count.
- **A d6 is the best straight fleet**, better than a d10.
- **Attacker-chosen targeting won 84%** and stripped the loser to under one ship.
  Defender-chosen absorption fixes it completely.
- **Price cannot balance a consumable you can time.**
- **Half a d10 is barely worth more than half a d4**, so a soak scaled to hull
  size makes your capital ship the best fodder — backwards.
- **Energy saturates.** Doubling the Reactor barely moved its worth, because
  slots fill up and there is nothing left to buy.
- **A dial that is a coin flip has no upper half.** `botPace` was
  `Math.random() < pace`, so everything at or above 1 was the same opponent.

---

## The rules that keep us honest

1. **Nothing multiplies.** A bonus may scale with how many ships you own, never
   with how much damage you already deal.
2. **A bonus that fires most rounds isn't a bonus.** Past about 75% it is base
   attack with extra steps.
3. **Price by measured value, not by size.**
4. **Defence needs a lasting effect** or nobody builds it. Repair on the 3 solved
   this.
5. **Simulate before believing.**
6. **Simple beats clever.** The version that stalled on *"I don't know what all
   this means"* had more mechanics than the one that works.
7. **A face does one thing, automatically.** No menus on a die. This is also why
   the game still works with real dice on a table — the best signal we have that
   it isn't over-built.
8. **Every printed symbol always pays.** A mark that only sometimes counts reads
   as a bug.
9. **A rule with no control is not a rule.** Cashing a straight short was in the
   rules and in the report for many versions with no button anywhere.
10. **Delete the furniture with the rule.** Comments describing a deleted mechanic
    are worse than dead code, because they misinform the next reader.

---

## What is designed but not built

- **In-place hull growth** — pay the price difference to grow a ship where it
  sits. Recommended next. `IDEAS.md` §1.
- **Marks on the bigger dice** — four variants measured. `IDEAS.md` and
  `test-face-ladder.mjs`. Only the escalating version makes a real ladder.
- **Pricing the slots** — start with 4 open, unlock the rest. `IDEAS.md` §3.
- **A decision attached to the flagship** — holding it deliberately, or spending
  its number once a match as a wild. `IDEAS.md` §4.
- **A shareable round** — the report screen as an image you can send. `IDEAS.md`
  §5, and the one with the most upside for playing over days.
- **Targeting** — shooting the economy or the heavies. Works only as *crippled
  for three rounds*, never as destruction. `TARGETING.md`.
- **Jam, Secret Directives, Trumps** — `DIRECTIONS.md`. Jam is the important one:
  the first mechanic that reaches across and touches an opponent's roll.
- **Multiplayer** — deliberately last. Lead with **joint straights**: your dice
  and your teammate's combine into one line.

## Open questions

- **Should base Energy start above 0?** It is 0 today and only the Reactor raises
  it. A flat handout helps a capital fleet proportionally more than a swarm.
- **An Energy carry cap.** Careful: a cap is a price ceiling. The average bank
  sits at 13–15 and a d10 costs 13, so under 15 quietly deletes d10s and over 20
  never binds.
- **Does repair need to scale with the hull?** A 3 repairs 3 on every die, which
  hands a d4 fleet four times a d10 fleet's healing. Fixing it would break the
  rule that a face means the same thing everywhere, which is the rule that keeps
  the game playable with real dice. Currently unresolved and deliberately so.
- **`TARGETING.md` predates several rule changes.** It still says a cheap wide
  fleet cannot win because eight d4s cap at a straight of four — that stopped
  being true when the flagship joined the line and `runMin` went to 5. Treat its
  conclusions as shapes, not current numbers.
