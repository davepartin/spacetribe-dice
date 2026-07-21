# Apogee Forge

A mobile-first, ten-round solo dice-building and face-forging score attack. Roll a growing fleet of color-specialized polyhedral dice, choose what to reroll, bank attack, and invest the rest into an engine that peaks on the final Apogee strike.

## Run it

Apogee Forge has no third-party runtime dependencies. It needs Node.js 20 or newer.

```bash
npm start
```

Open `http://localhost:4173`. To allow scoreboard resets, start it with a private administrator token:

```bash
SCOREBOARD_ADMIN_TOKEN="choose-a-private-token" npm start
```

The shared top 10 is stored in `.data/scores.json`. If the frontend is served without the included Node server, it automatically falls back to a device-local top 10 in `localStorage`.

## Game loop

1. Roll every die in the active bay.
2. Spend energy to reroll selected dice. The one-use Overclock rerolls the whole bay for free.
3. Assign wild faces, then bank the volley. Attack becomes score; other symbols become resources. Rounds 1–9 also grant +1 tech salvage so every run has workshop options.
4. In the workshop, advance Arsenal, Reactor, or Foundry; acquire specialized dice; grow dice from d4 through d20; or permanently forge a stronger face.
5. After round 10, the Apogee strike scores its attack a second time, Reactor and Foundry level pairs multiply it again, and leftover resources plus every track discharge into the score.

Three attack results trigger Formation. Attack from three different die families also triggers Spectrum. This keeps a focused red-die strategy and a diverse engine strategy competitive.

## Checks

```bash
npm run check
```

The test suite covers deterministic rolls, reroll costs, face persistence through upgrades, track progression, round scoring, and ten-round completion.

See [DESIGN.md](DESIGN.md) for the reference-game research, mechanic adaptations, economy rationale, and simulation results.

## Lightweight deployment

For a small trusted group, deploy the repository to any Node host with a persistent disk and set `SCOREBOARD_ADMIN_TOKEN`. The app also works as a static site, but the scoreboard will be local to each browser unless `/api/scores` is hosted.
