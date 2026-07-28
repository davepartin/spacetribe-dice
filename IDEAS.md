# Five ideas — after a full review of v83

Dave, I went through the rules, the screens, the audits, and fresh measurements
against `simple.html` as it stands today. The big story from the v77 review is
over: the shop is no longer solved. What replaces it is quieter, and more useful.

The old v77 write-up is preserved at the bottom — it explains why upgrades,
escalating marks, and paid slots got built. Its “current game” numbers describe
v77, not v83.

---

## The finding that matters: the opening is contested; the endgame still loves width

Eighty full matches per plan against the pace-1 opponent, both sides using the
Flagship Token the same way:

| Plan | Wins | Avg rounds | Ships | Total sides |
| --- | ---: | ---: | ---: | ---: |
| **Fill slots with d4s, then upgrade the smallest** | **56%** | 13.6 | 5.6 | 48.9 |
| Build toward six ships, then upgrade | **53%** | 13.4 | 5.2 | 47.6 |
| Fifth d6, then upgrade the largest | **49%** | 13.2 | 4.6 | 43.6 |
| Only buy width, never upgrade | 38% | 14.1 | 7.9 | 31.6 |
| Flagship levels first, then balanced | **28%** | 13.5 | 4.5 | 40.9 |

Three plans sit inside seven points. That is the opposite of v77’s 100% / 7%
spread. **You can fill-then-upgrade, go balanced, or lean capital, and the bot
does not punish you for picking wrong.** Pure width that never upgrades falls
behind. Flagship-first is the weak path right now.

Always-upgrade-biggest versus always-upgrade-smallest, same opening to six
ships, fifty matches each: **48% vs 46%**. So “always finish the biggest ship”
is not secretly the answer. That decision in the shipyard is real.

What is *not* fixed is finished-fleet math when both sides stop shopping:

| Fight (frozen fleets, 60 matches) | Left wins |
| --- | ---: |
| 8 × d4 vs 4 × d10 | **95%** |
| 8 × d4 vs 6 × d6 | **97%** |
| 8 × d4 vs 4 × d8 + 2 × d4 | 47% |
| 4 × d6 + 2 × d8 vs 8 × d4 | 45% |

**Skinny capital fleets still lose to a full swarm.** Mixed fleets that keep
some width fight even. The escalating marks did their job — a grown d8 / d10 is
worth owning — but a board of eight small dice is still the strongest *finished*
shape at equal money.

That is the next balance question, not “is there one opening?” The opening is
healthy. The endgame still tips toward the widest legal fleet.

What eight ships of one size produce a round (three rolls, hold logic, 4,000
rounds each) still matches the HANDOFF table: d6 remains the straight king at
~63%, and Direct / repair now rise with size instead of collapsing.

---

## 1. Soften pure-width’s finished advantage without undoing the opening

Do **not** re-solve the shop by making d4s bad again. The fill-then-grow opening
is working. What you want is: eight d4s that never grew should feel finished and
fragile, not finished and dominant.

Three ways, in the order I trust them:

- **Make late Direct and repair lean on upgraded faces more than low faces.**
  The ladder already does some of this (d10 Direct 7.55 vs d4 Direct 2.82). A
  gentle nudge — slightly less Direct on the 2, slightly more on 8 / 10 — would
  push players to grow without taxing the opening.
- **Give surplus shields a job** (the Wall from `DIRECTIONS.md`). Formation’s
  raw attack is mediocre; if unused defence became Charge or Counterfire, a
  grown fleet that blocks hard would finally punish a swarm’s soft volleys.
- **Do not raise slot prices again on a hunch.** Slots already cost 7 / 8 / 9 /
  10. The policies that buy them and then upgrade are the ones winning.

I would measure a small Direct ladder tweak first. It is one Tune-panel afternoon
and it targets the exact column that made the old swarm unfair.

## 2. Rescue flagship-first, or admit it is a trap

At **28%** it is the only plan that looks broken rather than merely behind.
Either the level prices (10 then 16) still cost too much for what the rings pay
in a real match, or the bot’s growth schedule simply outruns a player who skips
ships for two purchases.

Two clean tests:

- Drop the second level to 14 and re-run the five policies.
- Or leave the prices and change the teaching: the guide / Upgrade Costs page
  should not present flagship levels as a peer of “buy a ship” if the maths say
  they are a garnish.

I would rather the path be *viable but specialised* than politely recommended
and secretly bad.

## 3. Make the Flagship Token rarer in practice

Both fleets spend it in almost every match under the current bot rule (~0.94
spends per match). A once-per-game button that fires every game is a free
reroll with extra steps, not a story.

Tighten the spend threshold, or teach humans to hold it for a straight / war
escalation turn. The measurement that matters is not “does the token change win
rate by 4 points” — samples that size are noise — it is “do humans remember they
have it, and do they regret spending it early?” Family play is the test; the
bot is currently too eager to model that.

## 4. Give Enemy a readable plan

`DECISIONS.md` still calls this thin, and it is right. Solo Enemy grows on a
schedule (`themGrow`). You cannot bluff it, starve it, or bait a bad shop. Versus
already has the real opponent; solo’s next jump in *feel* is an Enemy that looks
like it wants width, capital, or command — even a three-plan weighted picker
would make brace and shop reads mean something.

This is separate from balance. The 38–56% band can stay. What changes is whether
losing feels like “they outplayed my formation” instead of “the timer grew.”

## 5. Ship the shareable round (still the best unbuilt idea from v77)

Idea 5 from the v77 review is still open, and versus makes it more valuable, not
less. A round report that copies as one image — both fleets, the orange straight
bar, the ledger, the health cards — turns a play-by-day match into something you
send. The report screen is already honest and colour-split; it wants a button,
not a redesign.

Closest cousin for versus clarity: the guided first match is still solo-only.
Porting even the roll + straight tips into online would catch the exact failure
Dave hit on the phone — forgetting that straights are the engine while learning
the symbols.

---

## What the review checked and did not change

**Audits.** `test-dead-code.py` is clean. `test-vocabulary.py` is clean enough —
`sell` only survives as the internal `data-sell` / `sellValue` scrap wiring, not
as player-facing copy. `test-dead-css.py` still flags `.tone-red` and friends;
those classes *are* applied from JavaScript (`tone-` + colour), so the audit is
a false positive, not dead style.

**Screens.** How to play, the straight banner, Ready → Roll 1, brace multi-ship,
report health cards, and Upgrade Costs all still hang together. HANDOFF’s 24 rule
claims still match the engine. v83’s “no reset on the roll page” holds.

**Versus gaps (not bugs, just parity debt).** Guided tips are solo-only. Scrap
is solo-only on purpose. Rules live in `web/lib/game.ts` and need to stay lined
up when solo numbers move.

**No rule numbers were changed in this review.** The measurements above are the
argument; the Tune panel is still yours.

---

## Decision-density check (v83)

A normal round still asks for: one shipyard commitment, several keep/reroll
taps, an occasional straight-tier pick, one Flagship Token across the match, and
sometimes a painful brace. That target from `DECISIONS.md` still holds. The thin
spots are Enemy personality, flagship-first value, and whether eight unfinished
d4s should remain a complete plan.

---

# Archive — five ideas after a full review of v77

> **Status after v82/v83:** ideas 1 (upgrade ships in place), 2 (escalating marks
> on new faces), and 3 (buy fleet slots) are built. Idea 4 became the Flagship
> Token. Idea 5 (shareable round) is still open — see above. The analysis below
> is preserved because it explains why those changes were chosen; its “current
> game” numbers describe v77, not v83.

Dave, I went through every screen, every process, pulled out the dead code, and
ran playtests. Most of it was tidying. But the playtests turned up something that
changes what we should work on next, so I want to lead with that rather than bury
it under the housekeeping.

---

## The finding that matters: the game is currently solved

I played five strategies a real person might actually adopt, each through full
matches with both sides rolling and holding the same way.

| Plan | Wins |
| --- | --- |
| **Fill all 8 slots with d4s, then trade up** | **100%** |
| Only ever buy d4s, never trade up | 57% |
| Pour Energy into flagship levels first | 43% |
| Buy the biggest hull you can afford | 21% |
| Save up and only ever buy d10s | 7% |

A 93-point spread. There is one right answer, and **the shop was recommending one
of the worst ones** — it told you a bigger hull "rolls higher and reaches further
up the straight ladder," which is true and gets you beaten.

Here is why, and it is not what I expected. Two measurements pull in opposite
directions:

**At equal ship count, big hulls dominate.** Eight d10s beat eight d4s **96%**.

**At equal money, small hulls dominate.** Eight d4s (32⚡) beat two d10s (26⚡)
**100%**.

So the thing that wins is not hull size. It is **slot count** — and slots are
almost free. A d4 costs 4⚡ and a filled slot rolls every round forever.

The second half of it is the low faces. Every hull carries exactly one 1, 2, 3 and
4, so a small die shows a special face far more often. Eight ships of one size,
three rolls a round, 4,000 rounds each:

| Fleet | Cost | Attack | Shields | Repair | **Direct** | Straight% |
| --- | --- | --- | --- | --- | --- | --- |
| 8 × d4 | 32⚡ | 15.0 | 10.8 | **9.4** | **6.57** | 13% |
| 8 × d6 | 48⚡ | 25.0 | 15.1 | 3.5 | 2.42 | **63%** |
| 8 × d8 | 72⚡ | 30.1 | 17.6 | 2.8 | 1.93 | 49% |
| 8 × d10 | 104⚡ | 34.4 | 22.1 | 2.5 | 1.69 | 40% |

A d4 fleet produces **four times the Direct** of a d10 fleet and **four times the
repair**. Direct cannot be blocked and repair cannot be blocked. Attack — the one
thing big hulls are better at — is the only output shields eat.

Big hulls buy you the resource the opponent is allowed to answer. Small hulls buy
you the two the opponent cannot touch.

One more thing worth knowing: **d6 is the best straight fleet at 63%**, better
than d10 at 40%, because a d6 covers 1–6 tightly while a d10 spreads its rolls
across ten numbers and keeps missing the middle. Nobody would guess that from the
shop, which tells you bigger reaches further.

I have fixed the shop copy so it is no longer lying. I have not touched the
balance — that is yours to decide, and it is the first three ideas below.

---

## 1. Let a hull grow in place, and make growing the whole game

**The unfairness first: the opponent already has this and you do not.** In
`themGrow` the bot upgrades a hull in place, for free — `d4 → d6 → d8 → d10`, no
Energy, no lost round. You can only scrap at a **50% refund** and rebuy. The
opponent has been playing a better version of the economy than you this whole
time.

Fixing it opens the game up rather than just levelling it. **Pay the difference to
grow a hull where it sits:** d4 → d6 costs 2⚡ (6 − 4), d6 → d8 costs 3⚡, d8 → d10
costs 4⚡. Now "fill the board with cheap hulls" is not a trick that beats the game,
it is the *opening* — and the rest of the match is a long series of small, real
decisions about which ship to grow next.

This also fixes the thing that makes the current shop feel bad: you fill eight
slots and then the only way forward is to destroy something you paid for.

Cheap to build: one button per ship on the shop grid, one price, no new concepts.
It matches the brief you started from — *upgrading the size of the dice.*

## 2. Move the reward for size off attack and onto the faces

This is the deeper fix, and it goes at the root of the table above.

Right now a bigger hull gives you **more attack** — the one output shields absorb —
and **fewer specials**, because 1, 2, 3 and 4 are a smaller slice of a bigger die.
So size buys the weak resource and sells the strong ones. That inversion is what
makes the swarm win.

**Give big hulls more of the printed marks instead of just bigger numbers.** Your
original brief already has the mechanism: *some sides are blank that you can
upgrade.* So:

- a **d8** carries its 4 **and** an 8 that also fires Direct
- a **d10** carries its 3 **and** a 9 that also repairs

Suddenly a d10 has *two* Direct faces and *two* repair faces, and the low-face
advantage of the swarm disappears without nerfing anything. Big hulls stop being a
pile of attack that shields eat.

This is the most interesting idea on this list and the most work: it needs the
upgradeable-blank-face system you described at the start, and it wants real
measurement. I would do idea 1 first because it is a day, and this is a week.

## 3. Charge for slots, or stop giving them away

The cheapest possible fix, if you want the balance moved tonight rather than
rebuilt.

A slot costs nothing to hold and pays every round forever, so filling all eight is
never wrong. Three ways to price that, in order of how much I trust them:

- **Start with fewer slots and buy the rest.** Four open, and slots 5–8 cost
  Energy to unlock — rising, say 6 / 10 / 15 / 20. Now "wide" is a real
  investment, not a freebie, and the swarm has to earn its width.
- **Make repair and Direct scale with the hull, not the face.** A 3 on a d10
  repairs 5, a 3 on a d4 repairs 2. Kills the inversion in one line, but it
  breaks the rule you liked most — that a face means the same thing on every die.
  I would not do this one.
- **Cap the fleet lower, at five or six slots.** Fastest of all, and it makes each
  ship matter more, but it shrinks the 3×3 board that is currently the best thing
  about the game to look at.

I would try the first one. The other two cost more than they buy.

## 4. Give the flagship a reason to be somewhere

The flagship is the best-looking thing on the screen and mechanically it is a
lottery: it rolls, one of six faces comes up, you get a bonus on matching dice.
You never make a decision about it. The only choice attached to it is *buy a
level*, which is not a decision so much as a purchase.

Two ways to give it agency, both small:

- **Let it be held like any other die.** You can already reroll it — let it be
  *kept* deliberately when the face is good, so "I have three 3s showing and the
  flagship is on 3" becomes something you protect instead of something that
  happened to you.
- **Let its number be spent.** Once a match, use the flagship's face as a wild:
  count it as any number to complete a straight. One use, no menu, and it turns
  the flagship from decoration into the thing that saves a round.

The second is more interesting and still fits your rule that a face does one thing
automatically — because the *face* still does its automatic job; the wild is a
separate once-a-match button.

## 5. Make the report screen the thing people talk about

This is the async idea, and it is the one I think has the most upside for how you
actually want to play — friends, over days.

The result screen now adds up honestly and shows both rolls. That makes it
**shareable**. If a round produces one image — both fleets' dice, the gold box
round a straight, the ledger, the damage — then a match played over four days is
four little events you send each other rather than four times you open an app.

Concretely: a **"copy this round"** button on the report that renders the screen
to an image or a short block of text. No server, no accounts, no multiplayer code
— it works over whatever you already use to talk to your friends.

The reason I rank this alongside the balance ideas: the thing that kills
play-by-day games is not bad balance, it is forgetting it is your turn. A round
you can send is a round that reminds someone.

---

## What I changed while reviewing (all committed, all tested)

**A rule that had no way to be used.** You can roll a straight and cash it at a
shorter length — it is in the rules, the report even had a line for it. There was
**no control anywhere on the screen**. `straightPick` was never set by a human, so
that branch was dead. Worse, a straight — the biggest scoring event in the game —
announced itself with nothing but a faint orange underline. There is now a straight
banner: what you rolled, whether the flagship is in the line, and a button per tier
with what each pays, updating the totals live as you pick. You asked for this back
around v28 ("the selection of options should be clear, choose your reward") and it
got lost in a layout pass.

**Dead code, measured not guessed.** 18 CSS rules styling classes nothing applies,
3 functions nothing calls, 4 leftover modifier rules. About 2,500 characters. Every
one confirmed unreferenced by script before deleting, and there are now two audit
scripts (`test-dead-code.py`, `test-dead-css.py`) that will catch the next batch.

**Comments that described a game we no longer have** — the worse kind of bloat,
because they misinform whoever reads next, including me. The flagship comment said
you design its six faces and that it cannot join a straight; both were true once,
neither is now. The straight comment described the pre-v12 payout ladder. The rules
header said a 1 has no combat value. The Rocket sat at the top of the file as an
idea to build, three months after we removed it — it is now recorded as a decision
with a pointer to the measurements.

**One word per thing.** "Berth" was mine and "slot" is yours, so it is slot
everywhere. "Hit points" and "health" were the same number under two names — it is
health. A toast still said "sell a ship" where everything else says scrap. And
internally `panel` was the removed store's word and collided with both the CSS
`--panel` colour and the Tune panel, so `PANELS` → `FACES`, `flagPanel` →
`flagFace`, `flag.panels` → `flag.faces`.

**Smaller things the review turned up:** the brace screen blamed your fleet
("no ship can take this one") when the real limit was that you had already used
your one ship; the report repeated the health strip sitting three inches above it;
"They attacked" and "Your fleet attacked" described the same act in two voices;
their repair was buried in a note about your Energy while their flagship visibly
went *up*; the shop drew a number inside each hull that meant its maximum, when
the same picture on the board means the current roll; the payout table stopped at
7 in a row and never showed the free-ship tier; the game-over screen said "in 1
rounds"; and a straight tier you picked survived a reroll, so you could choose 5,
reroll into 7, and quietly cash the short one.

Everything above is covered by tests that run on every future change — 21 of them
now, including the ledger check, the ring check, the straight banner, and the
strategy playtests that produced the table at the top of this file.
