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

### 30–32 — the flagship faces, re-measured (current)

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
