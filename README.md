> **Note — this README describes an older, different project (Apogee Forge) that
> shares this folder. It is not Fleet Dice.**
>
> **For Fleet Dice, read [HANDOFF.md](HANDOFF.md).** That file has the current
> rules, the numbers, the file map and the working process, and it contains the
> prompt to give a new assistant.

---

# Apogee Forge

A mobile-first, ten-battle solo fleet game about hidden orders, simultaneous counters, and dice that grow from Ship-4 to Ship-20. Read the enemy signal, Forge individual faces, route Energy into charged systems, then lock your plan before the enemy dice are revealed.

## Run it

Apogee Forge has no third-party frontend dependencies. For a quick local game, serve the folder with Python (already included with macOS):

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`. This mode uses the device-local version-2 leaderboard.

For the shared leaderboard, use Node.js 20 or newer:

```bash
npm start
```

To allow shared scoreboard resets, start it with a private administrator token:

```bash
SCOREBOARD_ADMIN_TOKEN="choose-a-private-token" npm start
```

The shared top 10 is stored in `.data/scores.json`. Classic score-attack entries and the new battle-mode entries are versioned into separate top tens.
Set `SCOREBOARD_DATA_DIR` when a host provides a persistent data volume somewhere other than the repository's `.data` directory.

## Game loop

1. Read the visible enemy fleet, intent, mission, and likely system priority. Its exact dice remain hidden.
2. Choose Intercept, Bombard, Screen, or Maneuver orders. In the workshop, take one major action: commission a d4, Size Up a ship, Forge a face, trade a d4 hull, or advance doctrine. Repairs are minor actions.
3. Roll deployed ships. Spend Energy to reroll selected ships, aim Wild faces, and power charged faces or installed capital systems.
4. Lock the fleet packet. Both sides reveal and resolve simultaneously: Shields cancel Lasers, Lasers cancel Speed, Speed cancels Rockets, and Rockets cancel Shields.
5. Score hits, tactical edge, defense, integrity, and the battle mission. Assign incoming Stress, then return to the workshop for the next of ten threats.

The central build choice is **Size Up versus side-upgrade**. Larger hulls add faces, Structure, and charged capital systems, but consume scarce Command and Energy. Forge rewrites one existing face and raises ordinary output by 1; a ship's first Forge also grants +1 Structure and a fixed output-1 auxiliary system that costs 1 Energy to activate. This improves strength and consistency without changing the die's odds. Void repairs become value 1. Forged faces, reinforcement, and the auxiliary system persist through future Size Ups.

## Checks

```bash
npm run check
```

The test suite covers deterministic player and enemy rolls, simultaneous counters, 2v2 team aggregation, Command and deployment upkeep, explicit power routing, Stress, Forge persistence, versioned scores, and complete ten-battle campaigns.

See [BATTLE-DESIGN.md](BATTLE-DESIGN.md) for the current solo and asynchronous multiplayer design, economy rationale, counter system, threat schedule, and 20,000-seed balance results. [DESIGN.md](DESIGN.md) preserves the original score-attack design.

## Lightweight deployment

For a small trusted group, deploy the repository to any Node host with a persistent disk and set `SCOREBOARD_ADMIN_TOKEN`. The app also works as a static site, but the scoreboard will be local to each browser unless `/api/scores` is hosted.
