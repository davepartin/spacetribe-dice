# Fleet Dice — read this first

This is the single entry point for anyone new to the project, human or AI.
Everything you need to be useful is either here or pointed at from here.

---

## The prompt to hand a new assistant

Copy everything between the lines.

---

> I'm designing a dice-building battle game called **Fleet Dice**. I'm not a
> developer — I think in terms of how the game feels, and I rely on you for the
> maths and the code.
>
> **Read `HANDOFF.md` in this folder before doing anything.** It has the current
> rules, the numbers, the file map, and the working process. Then read
> `VERSIONS.md` for how we got here, and `TARGETING.md` for the mechanics we've
> designed but not built.
>
> How I want you to work:
>
> 1. **Measure before you believe.** Almost every design instinct we've had in
>    this project turned out to be wrong, mine and yours. Before you tell me a
>    change is good, simulate it — tens of thousands of matches — and show me the
>    numbers. If you're guessing, say you're guessing.
> 2. **The whole game is one file, `simple.html`.** No build step, no server. I
>    open it by double-clicking. Keep it that way.
> 3. **Snapshot before you change rules.** Copy `simple.html` to the next
>    `simpleNN.html`, bump the `VERSION` string, then edit. Never edit an old
>    snapshot. Write up what changed and why in `VERSIONS.md`, newest at the top,
>    including the measurements that justified it.
> 4. **Numbers are mine, rules are ours.** Anything numeric lives in the `C`
>    object and is editable live in the Tune panel, so I can feel a change
>    without a rebuild. If I tell you a setting felt right, make it the default.
> 5. **Test in the real build, not just in a model.** Use jsdom to boot
>    `simple.html`, play full matches, and confirm no errors. A model is for
>    exploring; the real file is what I play.
> 6. **Tell me when I'm wrong, and show your working.** I'd rather hear "that
>    measured at 84% and would break the game" than have you build it politely.
> 7. **Plain words.** If you use a term, make sure it names something that exists
>    in the game today. We once carried a word for four versions after deleting
>    the rule it described.
>
> Write like you're explaining it to me over coffee — warm, direct, paragraphs
> over bullet lists, and no jargon I haven't used first.

---

## What the game is

Each player commands a **fleet of dice**. Every die is a ship: a **d4**, **d6**,
**d8** or **d10**. In the middle of your board sits your **flagship**, a normal
**d6**, and your flagship has **hit points**. The match ends when someone's
flagship is destroyed.

You play a round at a time, and both sides submit at once — the idea is friends
playing over days, everyone locking in their round and finding out the next
morning what happened.

The design brief that started it: *dice that upgrade in size and in individual
faces, some faces blank and upgradeable, and it has to be genuinely fun.*

---

## The rules as they stand (v77)

### Every ship die

One rule covers every face on every ship:

| Face | Does | Symbol on the face |
| ---: | --- | --- |
| **1** | blocks for 1 | **two yellow bolts** — 2 Energy |
| **2** | hits for 2 | **one yellow bolt** — 1 Energy |
| **3** | blocks for 3 | **three green crosses** — 3 Repair |
| **4** | hits for 4 | **two violet chevrons** — 2 Direct, **always**, unblockable |
| **5 and up** | odd blocks, even hits | nothing — a big face is just its number |

**Even hits, odd blocks.** All the texture lives in the low faces, which is why
small dice stay worth owning: a d4 shows a 1, 2 or 3 three quarters of the time.

**Every printed symbol always pays.** A 1 always gives Energy, a 3 always repairs,
a 4 always sends 2 Direct. The flagship boosts them; it never switches them on.

### The flagship — a normal d6

Its faces mean what those numbers mean everywhere else, so there's nothing extra
to learn. **Each face does one thing, automatically. No menus on a die** — the
choosing in this game lives in which dice you reroll.

**The flagship has a level, and the level is the number on every face.** Level 1
pays **2**, level 2 pays **3**, level 3 pays **4**. You upgrade the whole ship in
the shipyard, not one face at a time.

| Face | At level 1 |
| ---: | --- |
| **1** | **Reactor** — your base Energy rises by **2**, for the rest of the match |
| **2** | Every **2** pays **2** more Energy |
| **3** | Every **3** repairs **2** more |
| **4** | Every **4** pays **2** more Direct, on top of the 1 it always pays |
| **5** | Every blue die blocks **2** more |
| **6** | Every red die hits **2** more |

The flagship **also lends its number to your straight**, and its boost still
fires.

**It never scores itself.** Its number bridges a straight and nothing else — it is
not attack, not shields, and it does not count as a match for its own face. A
flagship on 6 is not a red die for "+2 per attack"; a flagship on 4 is not one of
the 4s for Direct. Only ships pay. This has been got wrong three separate times,
so if a total looks high, check this first.

### A round

1. **Shipyard.** Buy ships, scrap ships, fit flagship panels.
2. **Roll.** Three rolls. Tap the dice you want to change. After the free rolls,
   1 Energy a die. **Nudge** one die up or down by one for 1 Energy.
3. **Straights.** Five or more consecutive numbers. Longer pays far more than
   bigger, and the biggest *ship* in the line sets the size of the prize. A long
   straight can always be cashed as a shorter one, so it's a real choice —
   **Refuel**, **Strike** or **Build**.
4. **Submit.** Your **volley** is `your attack − their shields`. **Direct** is
   tracked separately and **nothing stops it** — not shields, not a ship thrown in
   front of it. It always reaches the flagship.
5. **Brace.** If the **volley** got through, *you* decide: take it on the flagship,
   or **feed it one ship**. That ship blocks its own size — a d10 blocks 10 — and is
   **Damaged** for the next round: greyed in its berth, not rolling, not
   rerollable, not scrappable. It's back the round after. **A fed ship cannot
   touch Direct.**
6. **Repair, then take the hit.** Your 3s repair your flagship first.

### Winning

The match ends when a flagship reaches zero. There's no round limit. If both die
in the same volley — about **19% of matches**, so not an edge case — the tiebreak
runs: **heavier final volley**, then **most damage across the match**, then a true
draw, which lands about once in 5,000 matches.

From round 8 **the war escalates**: every attack gains 2 more each round, which
stops a stubborn pair of walls dragging a match into a fourth week.

---

## The numbers today

All of these are live in the **Tune** panel, top right.

| Setting | Value | |
| --- | ---: | --- |
| Flagship hit points | **60** | the length dial — 40 gives an 8-round match, 60 gives 11 |
| Repair a 3 gives | 3 | each point adds about one round to a match |
| Dice needed for a straight | **5** | at 4, straights fired in 82% of rounds — too often to feel special |
| Straight multiplier | 1 | scales the whole prize table |
| Energy: a 1 pays / a 2 pays | 2 / 1 | |
| Ship prices — d4/d6/d8/d10 | 4 / 6 / 9 / 13 | priced by measured value, not by size |
| Scrap value | 50% | |
| Fleet slots | 8 | plus the flagship |
| Rolls a round | 3 | then 1 Energy a die |
| A ship blocks | **its own size** | d4 blocks 4, d10 blocks 10 |
| Ships you may feed a round | **1** | at 2, careless play loses far too hard |
| Flagship level | **1** of 3 | the level is the number on every face: 2, 3, then 4 |
| Flagship upgrades | 16⚡ then 26⚡ | one purchase lifts all six faces |
| War escalates after round | 8, by 2 a round | |
| Rocket | 20⚡, pays 25, fills two faces | |

---

## The files

**Live — these are the project:**

| File | What it is |
| --- | --- |
| **`simple.html`** | The game. One file, no dependencies, opens by double-click. Always the newest version. |
| **`simple01.html` … `simple32.html`** | Frozen snapshots. Never edited again, so any version can be reopened in one click. |
| **`VERSIONS.md`** | Every version, newest first, with the measurements that justified it. |
| **`HANDOFF.md`** | This file. |
| **`TARGETING.md`** | Designed and measured, mostly unbuilt: targeting, hit points, health, fodder, Direct, buy order, the flagship as a d6. The deepest analysis in the project. |
| **`PANELS.md`** | The flagship panel catalogue and the rate card for pricing a per-number panel. |
| **`DIRECTIONS.md`** | Five paths to victory, bluffing, Secret Directives, Trumps, the 2v2 layer, and the six rules we learned the hard way. |
| **`DECISIONS.md`** | Every decision a player makes, marked strong or thin. |

**Dead — an earlier, different game called Apogee Forge. Ignore, and don't let
`README.md` mislead you; it describes that project, not this one:**

`README.md`, `index.html`, `server.js`, `app.js`, `battle-*.js`, `game-engine.js`,
`fleet-*.js` (except where noted), `solo-battle-engine.js`, `DESIGN.md`,
`BATTLE-DESIGN.md`, `FLEET-DICE.md`, `FLEET-DICE-PLAY.md`.

---

## How we work

1. Dave plays a few rounds and says what feels off.
2. If it's a **number**, he changes it himself in the Tune panel and reports what
   felt right. That becomes the default.
3. If it's a **rule**, snapshot `simple.html` to the next number, bump `VERSION`,
   change the live file, and write up the change in `VERSIONS.md` with the
   measurements behind it.

Numbers stay in his hands. Rules stay a conversation.

---

## How to measure

This is the part that matters most, because **nearly every design intuition in
this project has been wrong at least once.**

**Boot the real file with jsdom** and drive it through its own functions —
`newGame()`, `startRound()`, `submit()`, `nextRound()` — checking `errors` is
empty. The game exposes everything at top-level scope, so `w.tally(...)`,
`w.bestRun(...)`, `w.priceOf(...)` and the rest are all callable from a test.

```js
const dom = new JSDOM(html, { runScripts: "dangerously" });
const w = dom.window;
w.newGame();
while (w.G.phase !== "over") { /* drive the phases */ }
```

**For balance questions, run tens of thousands of matches** with two strategies
and compare win rates. 50% means a real choice. Anything past 60% means one line
dominates and the mechanic needs re-pricing.

**A model is for exploring; the real file is the truth.** More than once a model
gave a clean answer that the real build contradicted — and twice the *model* was
wrong because of a bug in the test harness, not the game.

### Things measured that contradicted the obvious guess

- A **d10 straight is more common** than a d4 straight, not rarer.
- **Shortening the match makes early rounds matter less**, not more.
- **Attacker-chosen targeting won 84%** and stripped the loser to under one ship.
  **Defender-chosen** absorption fixes it completely, because nobody picks a trade
  that's bad for them.
- **Healing made a cheap-swarm fleet worse**, not better — it lengthens matches,
  and long matches favour whoever is upgrading.
- **Price cannot balance a consumable you can time.** Raising the Rocket from 15
  to 20 moved the best line by under two points.
- **Half a d10 is barely worth more than half a d4**, so a soak scaled to hull
  size makes your capital ship the best cannon fodder — backwards.
- **A flat soak of 5 means you always sacrifice**; at 2 it stays a decision.

---

## The rules that keep us honest

1. **Nothing multiplies.** A bonus may scale with how many ships you own, never
   with how much damage you already deal. A ×2 panel tested 40% ahead early and
   69% ahead by mid-game.
2. **A bonus that fires most rounds isn't a bonus.** Past about 75% it's just base
   attack with extra steps.
3. **Price by measured value, not by size.**
4. **Defence needs a lasting effect** or nobody builds it. Health on the 3 is what
   finally solved this.
5. **Simulate before believing.**
6. **Simple beats clever.** The version that stalled on *"I don't know what all
   this means"* had more mechanics than the one that works.
7. **A face does one thing, automatically.** No menus on a die — the choosing
   lives in the reroll. This is also why the whole game still works with real
   dice on a table, which is the best signal we have that it isn't over-built.

---

## What's designed but not built

All measured and written up in `TARGETING.md`:

- **Targeting** — shooting the economy or the heavies rather than the flagship.
  Works only as *crippled for three rounds*, never as destruction.
- **Secret Directives, Trumps, Jam** — `DIRECTIONS.md`. Jam is the important one:
  the first mechanic that reaches across and touches an opponent's roll.
- **The flagship shop** — buying and swapping faces. Note the Reactor measures as
  the strongest face by about 6 points, so it needs a price that reflects that.
- **Level 2 panels** haven't been rebalanced since the level-1 set changed.
- **Multiplayer** — deliberately last. Lead with **joint straights**: your dice
  and your teammate's dice combine into one line.

## Open questions

- **Should there be a base Energy income?** It's currently 0, and a flat handout
  helps a capital fleet proportionally far more than a swarm — see `TARGETING.md`
  §18.
- **An Energy carry cap.** Probably solving a problem we don't have: the ~13
  Energy left over at match end is float, not hoarding.
- **A cheap wide fleet can't win**, and it isn't a tuning problem — eight d4s cap
  out at a straight of four because a d4 only carries 1 to 4. Fleet composition is
  the wrong place to look for alternate paths; targeting is the right place.
