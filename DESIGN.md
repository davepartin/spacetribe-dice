# Apogee Forge — design notes

## The central decision

Every roll asks one question: **How much power do I bank now, and how much do I turn into a better engine?** Attack scores immediately. Energy buys control over luck. Tech, Forge, and Flux do nothing to the current volley, but unlock stronger future rounds.

The tenth-round Apogee strike keeps both ends of that choice viable:

- Arsenal rewards steady investment because its base attack scores every round.
- Reactor and Foundry levels pair up to multiply the final strike.
- Leftover resources and all strategy-track levels discharge into the last score.

## What the reference games contributed

| Reference | Mechanic studied | Apogee Forge adaptation |
| --- | --- | --- |
| [Quarriors!](https://wizkids.com/quarriors/) / Dice Masters lineage | Pool growth and culling weak dice | A capped dice bay plus scrapping keeps acquisitions from becoming automatic. |
| [Cubitos](https://www.alderac.com/cubitos/) | Push-your-luck reroll tension | Energy-priced selective rerolls and a one-use whole-bay Overclock create risk without a punishing lost turn. |
| [Dice Forge](https://www.libellud.com/en/our-games/dice-forge/) | Permanently replacing die faces | Face Forge replaces the weakest un-forged face and preserves it through every die-size upgrade. |
| [Rattlebones](https://www.riograndegames.com/wp-content/uploads/2013/09/Rattlebones-Rules-1.pdf) | Die-face improvement tied to progression | Foundry levels increase the value of newly forged faces. |
| [King’s Forge](https://gamers-hq.de/media/pdf/2d/8c/c4/KingsForgeMasterworks-Rulebook.pdf) | Resource conversion and increasingly difficult builds | Tech is the common build currency, paired with a specialized resource for each upgrade type. |
| [Roll for the Galaxy](https://www.riograndegames.com/games/roll-for-the-galaxy/) | Colored dice as specialized workers | Red, cyan, green, and violet dice have visibly different face distributions and strategic jobs. |
| Favor of the Pharaoh | Roll manipulation and power acquisition | Wild assignment, targeted rerolls, and permanent manipulation upgrades reduce luck frustration. |
| [Star Wars: Destiny](https://www.fantasyflightgames.com/en/products/star-wars-destiny/) | Keeping die symbols readable while cards carry context | Dice use a six-symbol visual language; names, face maps, and upgrade rules live in the surrounding bay card. |
| [Too Many Bones](https://chiptheorygames.com/pages/support/too-many-bones) | Personalized skill-tree growth | Arsenal, Reactor, and Foundry form independent paths that can be focused or hybridized. |
| [Steampunk Rally](https://roxley.com/products/steampunk-rally) | Dice as fuel and exhaust; manipulation as a resource | Energy is both an engine output and the price of rerolling, so control has an opportunity cost. |

The combination is original to this game: custom-faced polyhedral dice grow from d4 to d20 while retaining forged faces, and the full engine is compressed into a ten-round solo score attack.

## Economy safeguards

- A run starts with 1 Tech, 1 Forge, and 1 Flux, so the first workshop offers real choices.
- Banking rounds 1–9 grants 1 guaranteed Tech salvage. This prevents a run from being locked out of progression by unlucky resource faces.
- Flux is the gate for die-size growth. The Prism Spindle is the strongest long-term Flux source.
- The bay starts at 3/6 dice. Reactor mastery can expand it to 8.
- A forged face starts at value 2 and reaches value 4 with Foundry investment.

## Balance targets

The current economy was tested with 15,000 deterministic bot runs across three intentionally different priorities:

| Strategy | Average | Median | 75th percentile | Maximum |
| --- | ---: | ---: | ---: | ---: |
| Steady Arsenal | 90.9 | 89 | 103 | 140 |
| Late Reactor/Foundry engine | 89.0 | 86 | 102 | 135 |
| Hybrid | 79.3 | 76 | 90 | 146 |

The steady and late-engine bots land within two average points, while a hybrid produced the highest exceptional run. The bots are intentionally simple rather than optimal; their purpose is to catch dominant economies and dead progression paths.

Score tiers are calibrated around those ranges:

- S — Mythic Forge: 120+
- A — Nova Architect: 95–119
- B — Starforged: 75–94
- C — Fleet Smith: 55–74
- D — Drift Cadet: below 55
