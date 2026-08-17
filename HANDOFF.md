# Fleet Dice — read this first

This is the single entry point for anyone new to the project, human or AI.
Everything you need to be useful is either here or pointed at from here.

**There are three ways to play now:**

| Track | What it is | Where |
| --- | --- | --- |
| **Solo (Fleet Dice 1)** | The live single-player game people are enjoying | `simple.html` (v88) — online at `/solo/` |
| **Solo (Fleet Dice 2)** | Same rules, versus layout + new dice — prototype | `simple-v2.html` (2.06) — online at `/solo-v2/` |
| **Versus (online)** | Two humans, private room, Jackbox-style code, live sync | `web/` → [davepartin.github.io/spacetribe-dice](https://davepartin.github.io/spacetribe-dice/) |

Versus is **not** an auto-conversion of `simple.html`. It is a separate Next.js /
React app under `web/` that reimplements the same rules in TypeScript
(`web/lib/game.ts`) and aims to **feel** like solo — same 3×3 fleet, same hull
shapes, same colours, same how-to depth.

**Dave is not a developer.** Prefer plain words. When a change is ready to play,
push it to `main` so the phone site updates — he gave standing permission.
Prefer showing something he can open on a phone over inventing architecture.

---

## The prompt to hand a new assistant

Copy everything between the lines.

---

> I'm designing a dice-building battle game called **Fleet Dice**. I'm not a
> developer — I think in terms of how the game feels, and I rely on you for the
> maths and the code.
>
> **Read `HANDOFF.md` in this folder before doing anything.** It has the current
> rules, the numbers, the file map, solo vs versus, Firebase, artwork, and the
> working process. Then read `IDEAS.md` for where the game stands as a design,
> and `VERSIONS.md` for how we got here. For the online app, also skim
> `web/README.md`.
>
> How I want you to work:
>
> 1. **Measure before you believe.** Almost every design instinct in this project
>    turned out to be wrong, mine and yours. Before you tell me a change is good,
>    play it out in simulation and show me the numbers. If you're guessing, say
>    you're guessing.
> 2. **Two codebases, one game.** Solo design still lives in **`simple.html`**
>    (one file, no build). Online solo + versus live under **`web/`** (Next.js,
>    Firebase, GitHub Pages). Know which track you're changing. Do not "port by
>    rewriting the whole game" when a small solo→versus visual fix is enough.
> 3. **Snapshot before you change solo rules.** Copy `simple.html` to the next
>    `simpleNN.html`, bump the `VERSION` string, then edit. Never edit an old
>    snapshot. Write up what changed and why in `VERSIONS.md`, newest at the top,
>    including the measurements that justified it. Versus rule changes go in
>    `web/lib/game.ts` and need tests under `web/tests/`.
> 4. **Numbers are mine, rules are ours.** In solo, anything numeric lives in the
>    `C` object and is editable live in the Tune panel. If I tell you a setting
>    felt right, make it the default. Versus currently hard-codes the same
>    numbers in TypeScript — keep them aligned with solo unless we decide
>    otherwise.
> 5. **Test in the real build, not just in a model.** Root `test-*` scripts boot
>    `simple.html`. Versus has `web` unit tests (`pnpm test` from `web/`). Run
>    the ones that touch what you changed.
> 6. **Assert before you write.** A find-and-replace that matches nothing reports
>    success and changes nothing. Every edit should prove it matched.
> 7. **Tell me when I'm wrong, and show your working.** I'd rather hear "that
>    measured at 84% and would break the game" than have you build it politely.
> 8. **Plain words.** If you use a term, make sure it names something in the game
>    today. We once carried a word for nine versions after deleting the rule it
>    described.
> 9. **When a build is done, push it.** Commit and push to `main` so GitHub
>    Pages updates. Do not wait for a separate "Push." Never force-push. Never
>    commit `firebase-debug.log` or secrets.
>
> Write like you're explaining it to me over coffee — warm, direct, and no
> jargon I haven't used first.

---

## What the game is

Each player commands a **fleet of dice**. Every die is a ship: a **d4**, **d6**,
**d8** or **d10**, sitting in a 3×3 grid. In the middle is your **flagship**, a
normal **d6** with **health**. The match ends when a flagship is destroyed.

**Ship shapes (read these at a glance):**

| Die | Hull shape |
| --- | --- |
| d4 | triangle |
| d6 | square |
| d8 | diamond |
| d10 | pentagon |

**Printed marks (always pay):**

| Mark | Colour | Meaning |
| --- | --- | --- |
| Lightning bolt | yellow | Energy |
| Plus / cross | green | Repair |
| Chevron | violet | Direct (unblockable) |

The design brief that started it: *dice that upgrade in size and in individual
faces, some faces blank and upgradeable, and it has to be genuinely fun.*

Family playtests (Dave and his daughter) proved the emotional core: health going
up, then a killer roll and a straight you can *see*, and you cheer. Clarity of
buttons, scoring colours, and how-to matter as much as balance.

---

## The rules as they stand (v88)

These rules are the truth for **solo**. Versus follows the same combat math.
Versus UI differences are called out in [Online versus](#online-versus--what-we-learned).

**Solo Enemy picks a plan** at match start — **Width**, **Capital**, or
**Command** — and grows that way for the whole match. You can read it on the
shipyard. Versus needs no such rule; the other human is the plan.

### Every ship die

**Even hits, odd blocks** — that covers every face on every ship, the 1 included.
Some faces also carry printed marks. Every mark pays:

| Face | Fights | Also, always |
| ---: | --- | --- |
| **1** | blocks for 1 | **two yellow bolts** — 2 Energy |
| **2** | hits for 2 | **two violet chevrons** — 2 **Direct**, unblockable |
| **3** | blocks for 3 | **three green crosses** — repairs 3 |
| **4** | hits for 4 | **one yellow bolt** — 1 Energy |
| **5** | blocks for 5 | repairs 1 |
| **6** | hits for 6 | 1 Direct |
| **7** | blocks for 7 | repairs 2 |
| **8** | hits for 8 | 2 Direct |
| **9** | blocks for 9 | repairs 3 |
| **10** | hits for 10 | 3 Direct |

**Direct moved to the 2 in v78, and Energy to the 4.** On a d4 the 4 is the top
face, so it was collecting the biggest attack *and* the unblockable damage at
once. The odds are identical either way, but it mattered enormously, because
everyone **holds their high numbers** — "keep your best attack" had been quietly
farming Direct every round. d4 Direct fell from 6.57 to 2.77 a round. Attack and
Direct now pull against each other, which is a real decision.

**Every printed symbol always pays.** The flagship boosts them; it never switches
them on.

The upper marks arrive only when a ship upgrades far enough to own that face. They
make upgrading a genuine path: bigger ships still roll higher, and now their new
faces add a rising repair/Direct ladder rather than being plain numbers.

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

**Each fleet has one Flagship Token per match.** Anytime after the first roll,
its owner may rotate the flagship one number up or down; 1 and 6 wrap. The token
is spent permanently, and turning the flagship immediately changes both its face
bonus and the straight it may complete. The opponent evaluates and spends its
own token by the same rule.

### A round

1. **Between rounds.** Upgrade a ship one size, buy a new ship, unlock a fleet
   slot, or upgrade the flagship's level. *(Solo still allows **scrap** for half
   price. Versus shipyard UI no longer offers scrap — upgrade / buy / slots /
   flagship only.)*
2. **Roll.** The page begins with every available die Ready. Roll 1 rolls
   everything. Before rolls 2 and 3, tap only the dice you want to change.
   Afterward use the once-per-match Flagship Token, or buy an extra reroll for
   1 Energy per selected die, including the flagship. Whatever you send back
   gambles the attack it was already showing.
3. **Straights.** Five or more consecutive numbers across the fleet, and the
   flagship's number counts toward the line. **Length** decides what kind of prize;
   the **biggest ship in the line** decides how big. A long straight may be cashed
   as a shorter one — there is a banner on the roll screen with a button per tier
   and the totals move live as you pick. Dice in the straight get an **orange bar
   across the bottom of the slot** (solo and versus).
4. **Submit / lock.** Both fleets fire once both sides have locked. Your **volley**
   is `your attack − their shields`. **Direct** is tracked separately and
   **nothing stops it** — not shields, not a ship thrown in front of it.
5. **Take the hit.** If the volley got through, *you* decide: all on the flagship,
   or put **as many available ships as you want** in front of it. Each blocks its
   own size — a d10 blocks 10 — and is **Damaged** for the next round: greyed in
   its slot, not rolling, not rerollable, not scrappable. Every ship used is one
   less die next round. **No ship can touch Direct.**
6. **Repair.** Your 3s repair your flagship.

### Winning

The match ends when a flagship reaches zero. There is no round limit in practice
(a 40-round backstop exists and measurement says it never fires). The current
five-policy pass averaged 13.7 rounds.

If both flagships fall in the same round the tiebreak runs: **heavier final
volley**, then **most damage across the match**, then a true draw.

After round 8 **the war escalates**: ordinary attack gets +4 in round 9, +8 in
round 10, +12 in round 11, and so on. Dice and Direct do not change. This is the
long-game timer that stops repeated ship sacrifices from stalling the match.

---

## The numbers today

All live in the solo **Tune** panel, which opens from the **version number** next
to the title. It is a designer tool, so it does not get a player-facing button.
Versus hard-codes matching values in `web/lib/game.ts`.

| Setting | Value | |
| --- | ---: | --- |
| Flagship health | **60** | the length dial — 40 gives an 8-round match, 60 gives about 12 |
| Repair a 3 gives | 3 | each point adds roughly a round to a match |
| Direct a 2 gives | **2** | always, on every ship |
| Energy: a 1 pays / a 4 pays | 2 / 1 | |
| Dice needed for a straight | **5** | at 4, straights fired in 82% of rounds |
| Straight multiplier | 1 | scales the whole prize table |
| Ship prices — d4/d6/d8/d10 | 4 / 6 / 9 / 13 | priced by measured value, not by size |
| Scrap value | 50% | solo only in the UI now |
| Fleet slots | 4 open of 8 | plus the flagship. You start with 4 d4s and 0 Energy |
| Unlock slots 5 / 6 / 7 / 8 | 7 / 8 / 9 / 10⚡ | always 2 more than the slot number |
| Upgrade d4→d6 / d6→d8 / d8→d10 | 2 / 3 / 4⚡ | the difference between ship prices |
| Rolls a round | 3 | then 1 Energy a die |
| A ship blocks | **its own size** | d4 blocks 4, d10 blocks 10 |
| Ships you may feed a round | **as many as you want** | each misses the next round |
| Flagship level | 1 of 3 | the bonus is 2, then 3, then 4 |
| Flagship upgrades | 10⚡ then 16⚡ | one purchase raises all six faces |
| Flagship Tokens | one per fleet, once per match | after first roll, rotate the flagship ±1 |
| Reactor cap / overflow | 6 / 2⚡ | once base is capped it pays Energy instead |
| War escalates after round | 8, by 4 a round | |
| **How fast they grow** | **1** | a rate, not a chance |
| **Enemy plan** | **0** (random) | Tune: `1` Width, `2` Capital, `3` Command |

**The straight ladder**, with `runMin` at 5:

| | d4 | d6 | d8 | d10 |
| --- | --- | --- | --- | --- |
| **5 in a row** | 6⚡ | 9⚡ | 12⚡ | 15⚡ |
| **6 in a row** | 8 attack | 12 | 16 | 20 |
| **7 in a row** | 12 attack | 18 | 24 | 30 |
| **8 in a row** | free d4 + 8 | free d6 + 12 | free d8 + 16 | free d10 + 20 |

---

## Where the game stands — read this before changing anything

### Solo balance (unchanged brief)

v88 keeps quit/home, the quiet board, v85 roll layout, and Enemy plans. Solo
dice now **bump/shake** on Roll so a same-number reroll still feels like a roll.
Versus motion waits until this solo feel is approved. You start with four open
slots and must buy width; or you can spend small amounts upgrading the four
ships already in formation.

This is a **first balance pass, not proof of balance**. Five automated policies
played the real game against the pace-1 opponent:

| Plan | Preliminary win rate |
| --- | ---: |
| Unlock slots and add d4s | 34% |
| Build a fifth d6, then upgrade the largest ship | 42% |
| Build toward six ships, then upgrade the smallest | 34% |
| Flagship levels first, then balanced upgrades | 38% |
| Unlock every slot with d4s, then upgrade | 46% |

No plan swept the field; the old fill-first plan had won **100%**. With both
Flagship Tokens in play, these matches averaged 13.3 rounds. These policies
are deliberately simple and this is a 50-match sample per plan, still only about
±14 points at 95% confidence. Pairwise human play,
especially intelligent straight-tier choices and better flagship timing, is the
next evidence that matters.

**What eight ships of one size actually produce a round** (three rolls, the
opponent's own hold logic, 4,000 rounds each):

| Fleet | Cost | Attack | Shields | Repair | Direct | Straight% |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 × d4 | 32⚡ | 14.8 | 11.1 | 9.5 | 2.76 | 15% |
| 8 × d6 | 48⚡ | 24.9 | 15.1 | 5.5 | 4.37 | **63%** |
| 8 × d8 | 72⚡ | 30.1 | 17.8 | 6.2 | 5.78 | 48% |
| 8 × d10 | 104⚡ | 34.2 | 22.3 | 7.8 | 7.55 | 39% |

**A d6 remains the best straight fleet** — it covers 1–6 tightly while a d10
spreads across ten numbers. But the escalating upper marks now give every growth
step a visible output gain: d10s no longer lose repair and Direct merely because
their faces are larger.

### Versus / human play

Versus is live online. Dave and family play it for real. Priority has shifted from
"does multiplayer exist?" to **clarity and solo parity**: can a new person learn
from How to play, see a straight on the board, read Energy / Repair / Direct, and
join a room without getting stuck.

---

## Online versus — what we learned

### Product shape

- **Home:** key art hero, Solo, Create match, Join with four-digit code,
  optional Continue match, live battles board.
- **Create:** name → private room → big room code + share / text invite.
  **Host stays on that page.** They are already in the game.
- **Guest:** opens invite link *or* types the four numbers on the home page
  (Jackbox-style) → joins → both play.
- **Do not open your own invite link** after creating a room. That was the #1
  confusion. Opening it after a friend has joined looks like a Firebase
  "permissions" error; it really means "this room already has two players."

### Sync model (important)

- Waiting for the opponent is only required **after locking rolls** (both must
  submit before the volley resolves).
- **Brace**, **report Continue**, **shipyard**, and **starting the next roll**
  are per-player. You do not wait on them to shop or assign damage.

### Solo → versus parity (done or in progress)

| Solo feel | Versus status |
| --- | --- |
| 3×3 fleet with flagship in the center | Done on roll / brace / shipyard |
| Hull shapes + face marks | Done (`DieArt.tsx`) |
| Flagship face colours + captions (not "FLAGSHIP · …") | Done |
| Orange straight bar on slots (`.inrun`) | Done |
| Health board You / Enemy | Done — **You** is dark theme with a **thin white border** (not light grey); keep green / yellow / violet score colours |
| Round report You panel | Same dark + white border treatment |
| How to play with shapes, marks, every face, six flagship faces, straights table | Done in `ReferenceSheets.tsx` — keep it as deep as solo |
| Dock: How to play left, Cancel right as real buttons | Done; Cancel asks "Are you sure?" |
| Solo quit / back home | Done in v87 — online top bar + in-board Quit + result Back home |
| Versus brace endgame | Inescapable volleys auto-finish for both players; brace button warns when damage exceeds current HP |
| Scrap in shipyard | **Removed from versus UI** (solo still has scrap) |
| Upgrade labels readable on 3×3 cells | Done (stacked label + cost) |
| Guided first-match tips | Removed — How to play carries the teaching |

### Jackbox join / Firebase lessons

1. **Room codes** live in Firestore `codes/{0000}` → `matchId`, plus seating
   (`hostUid`, `guestUid`, `status`) so the client can say "room full" or
   "re-enter" without needing a forbidden read on an active match.
2. **Anonymous Auth** only — no passwords. Browser remembers the anonymous uid.
   Creating on phone A and joining from phone B as "the same person" does not
   reclaim host; stay on the original tab.
3. **`firestore.rules` must stay deployed** whenever join/create rules change:
   ```bash
   cd web
   npx -y firebase-tools@latest deploy --only firestore:rules --project space-tribes
   ```
4. Friendly errors beat "Missing or insufficient permissions." Prefer:
   *That room already has two players. If you created the game, stay on your
   original game tab.*
5. Invite URLs should include `id` and `code` when possible:
   `/join/?id=…&code=0525`.

### Key files (versus)

| Path | Role |
| --- | --- |
| `web/lib/game.ts` | Rules engine (shared truth for online) |
| `web/lib/firebase-match.ts` | Create / join / play / watch / cancel |
| `web/lib/firebase.ts` | Anonymous auth + config (`space-tribes`) |
| `web/firestore.rules` | Security rules — deploy separately from Pages |
| `web/components/MatchGame.tsx` | All match screens + dock |
| `web/components/DieArt.tsx` | Ship / flagship SVGs + mark icons |
| `web/components/ReferenceSheets.tsx` | How to play + upgrade costs |
| `web/components/HomeScreen.tsx` | Landing + code join |
| `web/public/fleet-dice-key-art.png` | Brand key art |
| `web/public/fleet-dice-v88.html` | Fleet Dice 1 solo file shipped inside the online app |
| `web/public/fleet-dice-2.html` | Fleet Dice 2 prototype (same rules, new dice) |
| `.github/workflows/deploy-web.yml` | Push `main` → GitHub Pages |

---

## Brand and artwork

**Key art:** `web/public/fleet-dice-key-art.png`  
(Cinematic flagship cube with faces 1 Reactor / 2 Direct / 3 Repair / 6 Attack,
floating polyhedral dice, title **FLEET DICE**, tagline **BUILD THE FLEET. BREAK
THE FLAGSHIP.**)

Used on:

- Home hero (billboard — the art *is* the brand; do not stack a second competing
  headline on top of it)
- Nav / match header brand mark (cropped thumb)
- Versus create + join cards
- Open Graph / Twitter share image

Visual direction for UI: dark space panels, green repair, yellow energy, violet
direct, red attack, blue shields. Avoid light-grey "You" cards — dark background
plus a thin white border marks *your* side.

---

## Firebase and deploy

| Piece | Detail |
| --- | --- |
| Firebase project | `space-tribes` |
| Auth | Anonymous (must stay enabled) |
| Authorized domain | `davepartin.github.io` (and localhost for dev) |
| Firestore collections | `matches`, `codes`, `liveBattles` |
| Hosting of the app | **GitHub Pages**, not Firebase Hosting |
| App URL | https://davepartin.github.io/spacetribe-dice/ |
| Deploy app | push to `main` (workflow builds `web/` static export) |
| Deploy rules | `firebase deploy --only firestore:rules --project space-tribes` from `web/` |

Local versus:

```bash
cd web
pnpm install
pnpm dev
# open http://localhost:3000/spacetribe-dice/
```

---

## The files

| File | What it is |
| --- | --- |
| **`simple.html`** | Fleet Dice 1. One file, no dependencies. Always newest (v88). Do not use this file for Version 2 experiments. |
| **`simple-v2.html`** | Fleet Dice 2 prototype. Same rules; versus layout + tumbling dice. Bump 2.xx here. |
| **`simple01.html` … `simple87.html`** | Frozen Fleet Dice 1 snapshots. Never edited again. |
| **`web/`** | Online home + solo iframe/page + versus app (Next.js). |
| **`web/README.md`** | Online setup, routes, Firebase deploy one-liners. |
| **`HANDOFF.md`** | This file. The entry point. |
| **`IDEAS.md`** | Where the design stands, what playtests found, things worth building. |
| **`VERSIONS.md`** | Every solo version, newest first, with measurements. |
| **`TARGETING.md`** | Designed and measured, mostly unbuilt. Check dates — predates some rule changes. |
| **`DIRECTIONS.md`** | Paths to victory, bluffing, Secret Directives, Trumps, 2v2 layer. |
| **`DECISIONS.md`** | Every decision a player makes, marked strong or thin. |
| **`PANELS.md`** | Historical flagship-panel catalogue (removed in v72). |
| **`test-*.mjs` / `test-*.py`** | Solo harness tests against `simple.html`. |
| **`web/tests/`** | Versus engine / match tests. |

`README.md` at the repo root points here and to the live site.

---

## How we work

1. Dave plays (solo or versus, often on a phone) and says what feels off.
2. If it's a **solo number**, he can change it in Tune and report what felt
   right. That becomes the default — and versus should stay aligned.
3. If it's a **solo rule**, snapshot `simple.html`, bump `VERSION`, edit, write
   `VERSIONS.md`.
4. If it's **versus UX / online**, edit `web/`, keep copy plain, match solo
   visuals when that's the ask, then **commit and push to `main`** so he can
   play it on the phone.
5. If join/create breaks with permissions, check **rules deploy** before rewriting
   the client.

Numbers stay in his hands. Rules stay a conversation. Versus clarity is now part
of the product, not a side quest.

---

## How to measure

**Nearly every design intuition in this project has been wrong at least once.**

**Boot the real solo file with jsdom** and drive it through its own functions —
`newGame()`, `startRound()`, `submit()`, `nextRound()` — checking `errors` is
empty. Everything is at top-level scope, so `w.tally(...)`, `w.bestRun(...)`,
`w.priceOf(...)`, `w.C` and the rest are callable from a test.

```js
const dom = new JSDOM(html, { runScripts: "dangerously" });
const w = dom.window;
w.newGame();
while (w.G.phase !== "over") { /* drive the phases */ }
```

**The 30 test scripts, and what each is for:**

| Script | Checks |
| --- | --- |
| `test-report-adds-up.mjs` | every ledger row sums to its total — catches damage arithmetic that lies |
| `test-rolls-row.mjs` | the roll chips match the dice, the gold box holds exactly the straight |
| `test-straight-banner.mjs` | the tier chooser, and that a pick resets on a reroll |
| `test-flagship-rings.mjs` | rings × multiplier = what the face actually paid, for all six faces |
| `test-flagship-levels.mjs` | the level ladder and the ceiling |
| `test-flagship-language.mjs` | nothing anywhere says "face pays" instead of "adds" |
| `test-face-marks.mjs` | what each face pays, and what gets drawn on the ship |
| `test-shop.mjs`, `test-shop-actions.mjs` | every buy and scrap button, at 0 / 7 / 40 Energy, full fleet, damaged ship |
| `test-prices-page.mjs`, `test-reference-pages.mjs`, `test-reference-nav.mjs` | the two reference screens open and return from every phase |
| `test-dump-roll.mjs`, `test-dump-round.mjs`, `test-dump-pages.mjs` | print every screen as plain text — read these when reviewing copy |
| `test-v82-economy.mjs` | the current five-policy upgrade/slot/flagship win-rate table, with both tokens |
| `test-v81-playtest.mjs` | every request from the first v80 phone playtest |
| `test-v82-guidance.mjs` | quiet solo board (no guided tips), upgrade jumps, both Flagship Tokens, six flagship faces |
| `test-v88-roll.mjs` | each die size stays inside its own face range (d4/d6/d8/d10 + flag) |
| `test-strategies.mjs` | historical pre-v80 economy comparison |
| `test-fleet-output.mjs`, `test-fleet-value.mjs` | what a fleet of one size produces a round |
| `test-head-to-head.mjs` | frozen fleets against each other |
| `test-face-ladder.mjs`, `test-face-ladder-topplain.mjs` | the four variants of the bigger-dice idea |
| `test-bot-pace.mjs`, `test-balance.mjs` | the difficulty dial and the win rate |
| `test-enemy-plan.mjs` | Enemy Width / Capital / Command pick, labels, and growth shapes |
| `test-handoff-accuracy.mjs` | every rule number claimed in this file, checked against the engine |
| `test-dead-code.py`, `test-dead-css.py`, `test-vocabulary.py` | unreferenced functions, unapplied CSS, inconsistent words |

**Versus:** from `web/`, `pnpm test` exercises the TypeScript engine and match
helpers. Human play on two phones remains the real acceptance test for join UX.

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
- **At equal ship count big ships dominate** (8 d10 beat 8 d4, 96%). **At equal
  money small ships dominate** (8 d4 beat 2 d10, 100%). The thing that wins is
  slot count.
- **A d6 is the best straight fleet**, better than a d10.
- **Attacker-chosen targeting won 84%** and stripped the loser to under one ship.
  Defender-chosen absorption fixes it completely.
- **Price cannot balance a consumable you can time.**
- **Half a d10 is barely worth more than half a d4**, so a soak scaled to ship
  size makes your capital ship the best fodder — backwards.
- **Energy saturates.** Doubling the Reactor barely moved its worth, because
  slots fill up and there is nothing left to buy.
- **A dial that is a coin flip has no upper half.** `botPace` was
  `Math.random() < pace`, so everything at or above 1 was the same opponent.
- **Versus join "permissions" errors were often UX, not broken rules** — host
  clicking their own invite after the guest seated, or reading an active match
  as a third anonymous browser identity.

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
11. **Versus should look like solo.** If solo teaches a symbol or a shape, versus
    How to play and the board must show the same pictures.
12. **Host stays; guest joins.** Creating a room is not the same as opening the
    invite. Explain that on the waiting screen every time. If nobody joins,
    **Cancel game** (waiting page or Your matches) closes the room. Creating a
    new match also closes an empty waiting room this phone still remembers.
    Empty rooms drop off **Now on the field** after 45 minutes with no heartbeat.

---

## What is designed but not built

- **A decision attached to the flagship** — holding it deliberately, or spending
  its number once a match as a wild. `IDEAS.md` §4.
- **A shareable round** — the report screen as an image you can send. `IDEAS.md`
  §5, and still high upside for playing over days (versus makes this even more
  valuable).
- **Targeting** — shooting the economy or the heavies. Works only as *crippled
  for three rounds*, never as destruction. `TARGETING.md`.
- **Jam, Secret Directives, Trumps** — `DIRECTIONS.md`. Jam is the important one:
  the first mechanic that reaches across and touches an opponent's roll.
- **Joint / 2v2 straights** — teammate dice combine into one line. Still future;
  basic 1v1 versus is live.
- **Versus guided first-match tips** — neither track uses them; How to play is enough.
- **Full Tune panel in versus** — solo only; versus constants are code defaults.

~~**Multiplayer**~~ — **built** as private 1v1 rooms with invite link + four-digit
code. Remaining work is clarity, parity, and reliability — not greenfield sync.

## Open questions

- **Should base Energy start above 0?** It is 0 today and only the Reactor raises
  it. A flat handout helps a capital fleet proportionally more than a swarm.
- **An Energy carry cap.** Careful: a cap is a price ceiling. The average bank
  sits at 13–15 and a d10 costs 13, so under 15 quietly deletes d10s and over 20
  never binds.
- **Do the upper-face marks overshoot?** They fixed the inverted repair/Direct
  ladder, but they need human play to establish whether d10s now do too many jobs.
- **`TARGETING.md` predates several rule changes.** It still says a cheap wide
  fleet cannot win because eight d4s cap at a straight of four — that stopped
  being true when the flagship joined the line and `runMin` went to 5. Treat its
  conclusions as shapes, not current numbers.
- **Should versus drop scrap from the engine entirely**, or only from the UI?
  UI is already upgrade-only.
- **Should solo and versus share one visual component library** so hulls / help
  never drift again?
