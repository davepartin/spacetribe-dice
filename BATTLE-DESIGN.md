# Apogee Forge — Fleet Battle design v0.1

Status: isolated rules kernel and headless prototype implemented; visible game not yet migrated  
Date: 2026-07-22

This document extends the current ten-round solo score attack into a fleet-building battle system. It deliberately defines the rules before any gameplay code changes. Provisional numbers are marked as balance targets rather than final values.

The isolated rules kernel lives in `battle-engine.js`. Prototype faces and threats live in `battle-content.js`, while `solo-battle-engine.js` runs the full ten-round economy and enemy schedule. None of these modules changes the current playable UI yet.

## Product promise

Build a fleet by buying small ships, expanding selected ships into larger polyhedral dice, and forging their individual faces. Every round, decide whether to score now, improve the fleet, or prepare a counter to an enemy whose exact orders are still hidden.

The same rules should support:

- A ten-round solo high-score game against enemy dice.
- Asynchronous 1v1 fleet battles.
- Asynchronous 2v2 and 3v3 battles whose locked results combine by team.
- A later Parasite variant that can change a fleet's allegiance at reveal time.

The solo game remains the first product. Multiplayer is a design constraint, not an implementation requirement for the first battle release.

## Design pillars

1. **Every build path must have a job.** A swarm, a capital-ship fleet, a forged specialist fleet, and an energy-control fleet should all be credible.
2. **Large dice must do something small dice cannot.** A larger die is not merely a worse probability of finding one desired face.
3. **Hidden plans, visible possibilities.** Players can read an enemy fleet and its likely intent, but exact results stay hidden until orders lock.
4. **One combat language.** Solo enemies and human fleets use the same icons, counters, and resolver.
5. **A bad round bends a run; it does not waste it.** Damage and poor rolls create recovery decisions rather than early elimination.
6. **Readable on a phone.** The core counter rule and all current totals must fit on one screen.

## Why the current Size Up is dominated

Current un-forged face-value averages show the problem:

| Ship | d4 | d6 | d8 | d6 → d8 gain |
| --- | ---: | ---: | ---: | ---: |
| Core | 1.000 | 1.167 | 1.250 | +0.083 |
| Attack | 1.000 | 1.167 | 1.375 | +0.208 |
| Energy | 1.000 | 1.167 | 1.375 | +0.208 |

Buying an ordinary d4 adds approximately 1.0 output every remaining round, provides another independently rerollable result, and makes multi-die resonances easier. Upsizing one d6 to d8 currently provides only a fraction of that output. Unless the bay is already full, another d4 is usually the correct purchase.

Prices alone cannot repair this relationship. Size Up needs command efficiency, durability, and exclusive effects.

## The three fleet-building actions

### Buy a ship — quantity

- Adds a new specialized d4.
- Consumes one bay and two Command.
- Adds a complete independent roll, which is reliable and resonance-friendly.
- Begins fragile and cannot carry capital systems.

A d4 may be traded in for a different d4 family for 2 Credits. This provides a deliberate culling/specialization route without adding another die or preserving upgrades from the discarded hull.

### Size Up — expansion

- Advances d4 → d6 → d8 → d10 → d12 → d20.
- Adds new faces chosen from the ship's available system modules.
- Increases Structure and Command cost.
- Unlocks advanced and capital faces unavailable to smaller ships.
- Preserves all previously forged faces.

This is the game's **vertical upgrade**. It raises ceiling, durability, and system tier, but also concentrates more of the fleet's Command and Energy in one roll.

### Forge — specialization

- Rewrites one existing face without changing die size.
- Keeps that face within its current power budget.
- Can change a face's job: Laser to Shield, Rocket to Speed, Credits to Energy, and similar side-system exchanges.
- An ordinary rewritten face gains +1 output. A repaired Void becomes value 1 instead. This small output gain is what lets Forge compete with the extra faces, Structure, and installed system gained by Size Up.
- A ship's first Forge reinforces its frame for +1 Structure. This one-time hull benefit persists through later Size Ups and gives a sidegraded d4 the same basic durability as a d6 without adding two new faces.
- That first Forge also installs an auxiliary system producing 1 of the chosen symbol for 1 Energy each battle. Unlike the flexible, more Energy-efficient systems on larger ships, its symbol is permanently fixed, so sidegrading rewards commitment while Size Up retains the higher ceiling.
- Can repair a Void into a basic value-1 face at a premium.
- Cannot create a capital-tier number or effect on a chassis-tier face.

This is the game's **sidegrade**. It improves control and identity without adding sides, Structure, or Command cost.

The player chooses the target face. The game should not silently forge whichever face its heuristic considers weakest.

## Fleet capacity

Retain a six-bay maximum and prototype a second limit of **12 Command**. The first simulation showed that charging one Command for every size tier still overvalued extra d4 rolls, so adjacent sizes share Command bands:

| Ship size | Command | Structure |
| --- | ---: | ---: |
| d4 | 2 | 1 |
| d6 | 2 | 2 |
| d8 | 3 | 4 |
| d10 | 3 | 6 |
| d12 | 4 | 8 |
| d20 | 6 | 12 |

These values are provisional. They intentionally allow examples such as:

- Six d4 ships: all 12 Command used, with many reliable rolls but low durability and no capital faces.
- Four d8 ships: all 12 Command used, four strong and durable rolls.
- A d20, a d12, and a d4: all 12 Command used, extreme ceiling with only three results.

The d4 → d6 and d8 → d10 steps are Command-neutral but still cost workshop resources. The d6 → d8, d10 → d12, and d12 → d20 steps consume more Command. Unused Command is not a penalty. Bay count and Command together prevent both an unlimited d4 swarm and a bay full of d20s.

The first four active ships deploy freely. Deploying a fifth or sixth ship costs one Energy each for that round; an unpaid ship remains safely in reserve. This is the swarm's recurring control cost. Large fleets spend Energy coordinating more independent rolls, while expanded fleets spend Energy powering installed systems.

## Face tiers and power

| Band | Sizes | Typical faces | Energy requirement |
| --- | --- | --- | --- |
| Chassis | d4–d6 | value 1–2, single symbol | none |
| Advanced | d8–d10 | value 2–3 or a modest tactical effect | occasional Charge 1 |
| Capital | d12–d20 | value 3–5, dual output, or a strong effect | Charge 1–2 |

A charged face shows both its powered and unpowered result. Example:

> **Siege Salvo:** Rocket 4, Charge 1. If unpowered, resolve Rocket 1.

This creates a meaningful large-ship risk. The result has an exceptional ceiling, but only an Energy engine can use it consistently. A small ship remains efficient because its ordinary faces resolve at full strength for free.

Every d8 or larger ship also carries a signature installed system separate from its rolled face. The prototype uses the following deliberately conspicuous values:

| Size | Installed output | Charge |
| --- | ---: | ---: |
| d4–d6 | none | — |
| d8–d10 | 2 | 1 Energy |
| d12 | 4 | 1 Energy |
| d20 | 8 | 2 Energy |

The output follows the ship family: Laser for Interceptors, Rocket for Siege Ships, Shield for Bulwarks, and player-assigned for Core/Engineering Ships. This is the exclusive benefit that another d4 cannot reproduce. It can still be countered, and firing it competes directly with rerolls, repair, upgrades, and swarm deployment.

Target un-forged average face output, before tactical effects:

| Size | Target average |
| --- | ---: |
| d4 | 0.9–1.1 |
| d6 | 1.2–1.4 |
| d8 | 1.45–1.70 |
| d10 | 1.75–2.05 |
| d12 | 2.05–2.40 |
| d20 | 2.60–3.10 powered; materially lower when starved of Energy |

Size Up does not need to equal the raw output of another d4. Its additional Structure, bay efficiency, and exclusive effects supply the rest of its value.

## Core symbol set

Keep the rollable vocabulary to eight symbols:

| Symbol | Job |
| --- | --- |
| Laser | Fast offense; counters Speed |
| Rocket | Heavy offense; counters Shield |
| Shield | Defense; counters Laser |
| Speed | Evasion and initiative; counters Rocket |
| Energy | Pays for rerolls and charged systems |
| Credits | Buys ships, Size Ups, Forges, repairs, and track improvements |
| Wild | Assigned before lock to any non-Void symbol allowed by that face |
| Void | No immediate output; a high-value Forge target |

Size and Forge become workshop verbs instead of common rolled currencies. This prevents the game from growing to ten frequently used face symbols. The current Size Ship can become an **Engineering Ship** specializing in Credits, Energy, Wilds, and workshop discounts.

Prototype costs:

- Buy d4: 4 Credits.
- Trade one d4 family for another: 2 Credits.
- Size Up to d6/d8/d10/d12/d20: 2/3/4/5/6 Credits respectively.
- Size Up also costs 1 Energy, except d20 costs 2 Energy.
- Forge ordinary face: 2 Credits.
- Repair Void into value 1: 3 Credits.
- Forge advanced/capital face: additional Credits or Foundry level requirement, but its printed power budget cannot increase.

## Combat counter loop

The complete relationship is:

```text
Shield counters Laser
Laser counters Speed
Speed counters Rocket
Rocket counters Shield
```

This can be remembered as:

```text
Shield → Laser → Speed → Rocket → Shield
```

### Simultaneous resolution

Let `L`, `R`, `S`, and `V` be a fleet's Laser, Rocket, Shield, and Speed totals. Using both sides' original locked totals:

```text
remaining Laser  = max(0, Laser  - enemy Shield)
remaining Rocket = max(0, Rocket - enemy Speed)
remaining Shield = max(0, Shield - enemy Rocket)
remaining Speed  = max(0, Speed  - enemy Laser)
```

All four cancellations happen simultaneously; one cancellation never cascades into another during the same volley.

- Remaining Laser + Rocket becomes Hits.
- Remaining Shield earns Integrity/tactical value; it does not block a second time.
- Remaining Speed grants initiative benefits and contributes maneuver objectives.

Example: a player locks `Laser 4, Rocket 1, Shield 2, Speed 0`; the enemy locks `Laser 1, Rocket 3, Shield 2, Speed 2`.

- The player finishes with Laser 2, Rocket 0, Shield 0, Speed 0 and deals 2 Hits.
- The enemy finishes with Laser 0, Rocket 3, Shield 1, Speed 0 and deals 3 Hits.
- The enemy's remaining Shield may satisfy an objective, but it does not retroactively erase another Laser.

The first prototype should not add armor, range, accuracy, critical hits, or weapon speeds. Those systems can exist later only if playtesting demonstrates a missing decision.

## Resonances become fleet tactics

Current resonances are worth preserving, but all four combat paths need comparable rewards:

| Tactic | Trigger | Prototype reward |
| --- | --- | --- |
| Target Lock | 3+ Laser output | +1 Laser and suppress 1 additional enemy Speed |
| Salvo | 3+ Rocket output | +2 Rocket, but one Rocket is lost if the volley is completely evaded |
| Bulwark | 3+ Shield output | +2 Shield and protect one assigned ship from its first Stress |
| Flanking | 3+ Speed output | +2 Speed and gain one free shaping reroll next round |
| Combined Arms | Laser + Rocket + Shield + Speed | +1 to the player's weakest combat total and objective points |
| Clean Bay | No Void results | +1 Credits or a small score bonus |

Exact rewards require simulation. The invariant is that defensive and maneuver fleets receive effects as exciting as direct-damage fleets.

## Strategy tracks

Retain the pleasure of developing long-term tracks, but give non-weapon fleets equivalent progression:

| Track | Strategy supported | Prototype progression |
| --- | --- | --- |
| Gunnery | Steady Laser/Rocket scoring | Levels 1, 3, and 5 add one preassigned Laser or Rocket; levels 2 and 4 improve weapon tactics |
| Operations | Shield/Speed control | Levels 1, 3, and 5 add one preassigned Shield or Speed; levels 2 and 4 improve intel, initiative, or damage priority |
| Reactor | Rerolls and capital ships | Adds round Energy, shaping actions, and charged-system efficiency |
| Foundry | Forge and Size Up | Reduces Forge costs, unlocks advanced modules, and makes late Size Ups attainable |

Preassigned output is chosen during Orders and is visible as part of a fleet's general build, not its final locked totals. A track level should create a new decision or reliable identity; avoid stacking numerous conditional modifiers that the player must remember during resolution.

## Damage and recovery

Every unblocked Hit assigns one Stress to a ship. Assignment follows a priority order chosen before lock, so the result does not require another asynchronous decision.

- Stress is recorded at the end of battle rather than disabling a ship immediately.
- During the next workshop, one Energy can repair two Stress.
- After that repair opportunity, a ship whose Stress still reaches its Structure is disabled for the coming round.
- After sitting out that round, it returns with zero Stress.
- No ship is permanently destroyed during a ten-round solo run.
- If every ship would be disabled, the fleet enters **Distress**: lose score, restore one basic ship, and continue. A run is never ended early solely by combat damage.

The priority order can be as simple as `protect`, `normal`, and `expendable` labels on ships.

## Ten-round solo structure

### Round sequence

1. **Threat:** Reveal the enemy fleet, its archetype, and a broad intent such as missile-heavy or defensive. Do not reveal exact results.
2. **Workshop:** Buy, Size Up, Forge, repair, or advance a track.
3. **Orders:** Choose a doctrine and ship damage-priority order.
4. **Roll:** Roll the fleet, spend Energy on selected rerolls, and assign Wilds.
5. **Lock:** Confirm the final roll. No changes are allowed after this point.
6. **Enemy roll:** Generate enemy results from its visible dice and hidden intent modifier.
7. **Battle:** Resolve the four counters, Hits, Stress, tactics, and objective.
8. **Score and salvage:** Add battle score, award Credits, and advance to the next Threat.

The enemy's exact roll must occur after player lock. Revealing it earlier turns the game into a solvable response puzzle and removes the desired feeling of committing plans across space.

### Enemy archetypes

| Enemy | Bias | Lesson |
| --- | --- | --- |
| Raider Wing | Speed + Rocket | Lasers can pin evasive attackers |
| Bulwark | Shield + Rocket | Pure Lasers need Rocket support |
| Hunter | Laser + Speed | Shields and accurate counterfire matter |
| Swarm | Numerous d4s | Reliable volume can overwhelm a narrow build |
| Siege Fleet | Rocket + Energy | Speed is a real defensive strategy |
| Dreadnought | One large charged die | Pressure its Energy or survive its high ceiling |
| Mirror Fleet | Copies one player specialty | Rewards a balanced fallback plan |
| Parasite Seed | Changes or corrupts one face | Previews the later Parasite rules without team switching |

Rounds 1–3 teach readable counters, rounds 4–7 combine archetypes, rounds 8–9 pressure specialized fleets, and round 10 is the Apogee Flagship.

### High-score model

Prototype round scoring:

- 2 points per Hit dealt.
- 2 points per remaining Shield or Speed after counters.
- 1 point per enemy offensive output canceled, capped at 4.
- Objective points for the round's declared goal.
- Integrity bonus for avoiding Stress.
- Credits salvage for defeating or surpassing the Threat.
- A modest recovery award when fighting from Distress so a comeback remains engaging.

The Apogee round is a flagship battle rather than only repeating the final Attack number. It repeats the final Hit total and discharges up to 12 remaining Energy as score. Credits and developed tracks may contribute a smaller preparation bonus later. The final round must still reward both steady scoring and a late engine without making hoarding automatically correct.

Target total-score range can remain near the current 55–120+ ladder after recalibration. A score-version increment is required when battle scoring replaces generic Attack scoring, so old and new leaderboard entries are never ranked as if they used identical rules.

## Doctrines

Before rolling, choose one doctrine. It communicates intent without guaranteeing a result:

- **Intercept:** The first Laser reroll each round costs no Energy.
- **Bombard:** One Rocket face may be charged for one less Energy.
- **Screen:** Convert one value-1 result to Shield 1 after rolling.
- **Maneuver:** One Speed result may be rerolled without losing its original result until the replacement is seen.
- **Overcharge:** Gain temporary Energy, but take Stress if it is not spent on a charged system.

Only one doctrine is active. These need equal expected value and should modify decisions rather than grant large automatic totals.

## Asynchronous multiplayer contract

The multiplayer resolver receives locked fleet packets. It does not need a separate combat system.

Each packet contains:

- Match, round, player, and team identifiers.
- Fleet and face-map version.
- Deterministic roll seed or server-verified roll proof.
- Final symbol totals, charged-face payments, tactics, doctrine, and damage priority.
- Lock timestamp and an immutable status.

### Match flow

1. All players receive the same round deadline and public enemy-fleet information.
2. Each player performs workshop and roll decisions privately on their own schedule.
3. A player locks orders. Opponents see only that the player is ready.
4. Teammates may coordinate socially; the game can optionally share broad role labels, but exact totals need not be exposed automatically.
5. When every participant locks—or the deadline applies a saved fallback—the server combines totals by team.
6. The server resolves one simultaneous battle and returns an animation plus an auditable numerical breakdown.

For 2v2 and 3v3, no special math is required initially. Add all allied Laser, Rocket, Shield, and Speed totals, then run the same counter formulas. Per-player contribution summaries appear after reveal.

Competitive matches must give each side the same starting fleet, number of workshop rounds, and economic opportunities. A persistent collection may unlock cosmetic ship frames or alternate equal-budget face maps, but cannot quietly confer raw power in ranked play.

## Parasite mode

The battle engine must store `ownerId` separately from `teamId`. Normal matches keep them aligned. Parasite effects can change `teamId` at reveal without changing who built and locked the fleet.

Two later variants are possible:

- **Possession:** After everyone locks, the game publicly transfers one fleet to the opposing side for that round.
- **Hidden host:** One player receives a secret allegiance or scoring objective before locking.

Possession is the safer first variant because it prevents a secretly selected player from intentionally making nonsensical decisions. Parasite mode is not part of the first solo implementation.

## Prototype simulation checkpoint

The first free-build simulation confirmed the original concern: the swarm averaged 103.6 while the capital route averaged 69.4 and Shield/Siege averaged 59.9. The prototype was then changed in response to that evidence:

- Command uses size bands rather than charging one point for every tier.
- d8+ ships gain powered installed systems and nonlinear Structure.
- Combat tactics trigger from output rather than number of dice.
- The fifth and sixth deployed ships require Energy upkeep.
- All strategies begin with the same three-ship fleet and pay the same workshop economy.
- Defensive cancellation and surviving Shield/Speed contribute directly to solo score.
- Forge, trade-in, Reactor investment, repairs, and final Energy discharge are included.

Final headless checkpoint, 20,000 deterministic seeds per strategy:

| Strategy | Average | Median | 75th percentile | Maximum | Disabled rounds | Distress |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Balanced Command | 97.7 | 97 | 111 | 171 | 2.03 | 0.12 |
| Six-Ship Swarm | 97.2 | 97 | 109 | 184 | 3.79 | 0.64 |
| Capital Breakthrough | 99.4 | 98 | 113 | 200 | 3.65 | 0.47 |
| Laser Interceptors | 105.2 | 105 | 118 | 184 | 2.29 | 0.16 |
| Shield and Siege | 94.9 | 94 | 107 | 173 | 3.22 | 0.43 |
| Forged Specialists | 102.5 | 102 | 115 | 167 | 1.25 | 0.84 |
| Reactor Control | 97.9 | 97 | 110 | 167 | 0.10 | 0.25 |

The lowest average is 9.8% below the highest, so the first automated strategy-spread gate passes. This is not final balance proof: bots follow fixed priorities, doctrines and the full four-track progression are not yet modeled, and human players may find stronger lines.

### Production-engine balance audit

The visible `fleet-game-engine.js` is now simulated directly rather than inferred from the earlier free-build prototype. The following checkpoint used 2,000 deterministic ten-battle runs per policy after the first-Forge reinforcement and charged auxiliary-system pass:

| Production policy | Average | P10 | Median | P90 | Maximum |
| --- | ---: | ---: | ---: | ---: | ---: |
| Balanced | 130.7 | 93 | 128 | 173 | 230 |
| Five-ship swarm | 137.2 | 108 | 138 | 164 | 208 |
| Capital growth | 145.4 | 101 | 147 | 186 | 258 |
| Four-d4 sidegrade fleet | 127.0 | 94 | 127 | 160 | 209 |
| Reactor control | 140.7 | 107 | 142 | 172 | 205 |
| Interceptor specialization | 119.0 | 91 | 119 | 148 | 192 |
| Shield/Siege specialization | 111.8 | 84 | 111 | 141 | 191 |

The five main economy paths are all within 13% of the highest mean. The four-d4 sidegrade route has a lower average and wider downside than capital growth but reaches 209 at the top end, matching the intended “smaller upgraded fleet with greater roll risk” profile. Interceptor and Siege policies trade score efficiency for substantially higher direct-hit totals and remain relevant to future competitive battle modes.

Battle score tiers are calibrated to this production distribution: S at 180, A at 150, B at 125, C at 95, and D below 95.

## Balance gates before replacing the current game

The following must be measured with deterministic simulations and human playtests:

1. When both options are legal, the expected remaining-run value per workshop investment of a new d4 and an adjacent Size Up should be within roughly 15% after bay use, Command bands, Structure, tactics, and Energy demand are included.
2. Swarm, capital, Forge-specialist, and Energy-control bots should finish within 10% average solo score before difficulty bonuses.
3. Laser-, Rocket-, Shield-, and Speed-led fleets must each have at least one common enemy matchup they prefer and one they fear.
4. Defensive or maneuver results must improve score or future position; they cannot feel like failed Attack rolls.
5. At least 70% of charged capital faces should be affordable in a dedicated Energy build, but fewer than 50% in a fleet that ignores Energy.
6. No ordinary round should require more than the counter loop, one doctrine, and one resonance lookup.
7. A first-time player should be able to predict all four counter relationships after one tutorial battle.
8. Median solo runs should remain competitive until at least round 8; early Distress should hurt without making the rest of the run meaningless.

## Implementation sequence after design approval

1. [x] Add a pure, deterministic battle resolver and exhaustive counter-loop tests without changing the visible game.
2. [x] Add prototype enemy profiles and run headless ten-round simulations against the workshop economy.
3. [x] Migrate visible face maps from generic Attack to the eight-symbol vocabulary and replace Size/Forge commodities with workshop actions.
4. [x] Connect Structure, Stress, charged faces, installed systems, and battle tactics to the playable state.
5. [x] Build the solo Threat/Lock/Reveal interface and tutorial.
6. [x] Rebalance score tiers, increment score version, and keep old leaderboard data visibly separate.
7. [ ] Only after the solo resolver is stable, add server-authoritative asynchronous matches and team aggregation.
8. [ ] Add Parasite as a rules module after ordinary team battles are understandable and fair.

## Defaults to use unless playtesting disproves them

- Six ship bays and 12 Command.
- The first four deployed ships are free; the fifth and sixth cost one Energy each per round.
- Shield → Laser → Speed → Rocket → Shield.
- Exact enemy results hidden until player lock.
- Size Up is vertical growth; Forge is face specialization with +1 ordinary output, one persistent Structure, and one fixed output-1/charge-1 auxiliary system on the ship's first Forge, but no extra faces, Command capacity, or flexible capital system.
- Energy powers rerolls and capital faces.
- d8+ ships have Energy-powered installed systems in addition to their rolled face.
- Credits are the single common workshop currency.
- Stress disables temporarily; it never permanently destroys a solo-run ship.
- Solo remains ten rounds and ends with an Apogee Flagship battle.
