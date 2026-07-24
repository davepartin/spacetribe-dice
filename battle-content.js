import { COMBAT_KEYS } from "./battle-engine.js";

export const BATTLE_SHIP_SIZES = Object.freeze([4, 6, 8, 10, 12, 20]);

export const COMMAND_BY_SIZE = Object.freeze({
  4: 2,
  6: 2,
  8: 3,
  10: 3,
  12: 4,
  20: 6
});

export const STRUCTURE_BY_SIZE = Object.freeze({
  4: 1,
  6: 2,
  8: 4,
  10: 6,
  12: 8,
  20: 12
});

export const INSTALLED_SYSTEM_BY_SIZE = Object.freeze({
  4: Object.freeze({ value: 0, charge: 0 }),
  6: Object.freeze({ value: 0, charge: 0 }),
  8: Object.freeze({ value: 2, charge: 1 }),
  10: Object.freeze({ value: 2, charge: 1 }),
  12: Object.freeze({ value: 4, charge: 1 }),
  20: Object.freeze({ value: 8, charge: 2 })
});

export const BATTLE_SYMBOLS = Object.freeze([
  ...COMBAT_KEYS,
  "energy",
  "credits",
  "wild",
  "void"
]);

function face(symbol, value, charge = 0, fallback = value) {
  return Object.freeze({ symbol, value, charge, fallback });
}

export const BATTLE_SHIP_BLUEPRINTS = Object.freeze({
  core: Object.freeze({
    name: "Core Ship",
    callSign: "CORE",
    color: "#e7eef9",
    signature: "wild",
    faces: Object.freeze([
      face("laser", 1),
      face("shield", 1),
      face("energy", 1),
      face("credits", 1),
      face("rocket", 2),
      face("speed", 2),
      face("wild", 2),
      face("laser", 2),
      face("shield", 3, 1, 1),
      face("rocket", 3, 1, 1),
      face("energy", 3),
      face("credits", 3),
      face("laser", 4, 1, 1),
      face("shield", 4, 1, 1),
      face("rocket", 4, 1, 1),
      face("speed", 4, 1, 1),
      face("wild", 3),
      face("energy", 4),
      face("credits", 5),
      face("void", 0)
    ])
  }),
  interceptor: Object.freeze({
    name: "Interceptor",
    callSign: "INTERCEPT",
    color: "#57d7b7",
    signature: "laser",
    faces: Object.freeze([
      face("laser", 1),
      face("speed", 1),
      face("laser", 2),
      face("void", 0),
      face("speed", 2),
      face("energy", 2),
      face("laser", 3),
      face("wild", 2),
      face("speed", 3),
      face("laser", 3),
      face("energy", 3),
      face("shield", 2),
      face("laser", 4, 1, 1),
      face("speed", 4, 1, 1),
      face("laser", 5, 1, 1),
      face("speed", 4, 1, 1),
      face("wild", 3),
      face("energy", 4),
      face("shield", 4, 1, 1),
      face("laser", 5, 2, 1)
    ])
  }),
  siege: Object.freeze({
    name: "Siege Ship",
    callSign: "SIEGE",
    color: "#f25955",
    signature: "rocket",
    faces: Object.freeze([
      face("rocket", 1),
      face("rocket", 2),
      face("energy", 1),
      face("void", 0),
      face("rocket", 2),
      face("credits", 2),
      face("rocket", 3),
      face("wild", 2),
      face("rocket", 4, 1, 1),
      face("shield", 2),
      face("energy", 3),
      face("rocket", 2),
      face("rocket", 4, 1, 1),
      face("shield", 4, 1, 1),
      face("rocket", 5, 1, 1),
      face("energy", 4),
      face("wild", 3),
      face("credits", 4),
      face("shield", 4, 1, 1),
      face("rocket", 5, 2, 1)
    ])
  }),
  bulwark: Object.freeze({
    name: "Bulwark",
    callSign: "BULWARK",
    color: "#43bde4",
    signature: "shield",
    faces: Object.freeze([
      face("shield", 1),
      face("shield", 2),
      face("rocket", 1),
      face("void", 0),
      face("shield", 2),
      face("rocket", 2),
      face("shield", 3),
      face("wild", 2),
      face("shield", 4, 1, 1),
      face("energy", 2),
      face("rocket", 3),
      face("credits", 2),
      face("shield", 4, 1, 1),
      face("shield", 5, 1, 1),
      face("rocket", 4, 1, 1),
      face("energy", 4),
      face("wild", 3),
      face("credits", 4),
      face("speed", 3),
      face("shield", 5, 2, 1)
    ])
  }),
  engineer: Object.freeze({
    name: "Engineering Ship",
    callSign: "ENGINEER",
    color: "#a86be8",
    signature: "wild",
    faces: Object.freeze([
      face("credits", 1),
      face("energy", 1),
      face("wild", 2),
      face("void", 0),
      face("credits", 2),
      face("energy", 2),
      face("shield", 2),
      face("wild", 3),
      face("speed", 3),
      face("credits", 3),
      face("energy", 3),
      face("laser", 2),
      face("credits", 4),
      face("energy", 4),
      face("wild", 4),
      face("shield", 4, 1, 1),
      face("rocket", 3),
      face("speed", 4, 1, 1),
      face("laser", 4, 1, 1),
      face("credits", 5)
    ])
  })
});

export const SOLO_THREAT_SCHEDULE = Object.freeze([
  Object.freeze({
    round: 1,
    id: "raider-scout",
    name: "Raider Scout",
    intent: "Evasive approach",
    objective: "laser",
    energy: 0,
    wildPriority: Object.freeze(["speed", "rocket", "laser", "shield"]),
    fleet: Object.freeze([{ family: "interceptor", sides: 4 }])
  }),
  Object.freeze({
    round: 2,
    id: "shield-probe",
    name: "Shield Probe",
    intent: "Defensive scan",
    objective: "rocket",
    energy: 0,
    wildPriority: Object.freeze(["shield", "rocket", "speed", "laser"]),
    fleet: Object.freeze([{ family: "bulwark", sides: 4 }])
  }),
  Object.freeze({
    round: 3,
    id: "missile-cutter",
    name: "Missile Cutter",
    intent: "Heavy launch signature",
    objective: "speed",
    energy: 1,
    wildPriority: Object.freeze(["rocket", "shield", "speed", "laser"]),
    fleet: Object.freeze([{ family: "siege", sides: 6 }])
  }),
  Object.freeze({
    round: 4,
    id: "hunter-pair",
    name: "Hunter Pair",
    intent: "Targeting sweep",
    objective: "shield",
    energy: 1,
    wildPriority: Object.freeze(["laser", "speed", "rocket", "shield"]),
    fleet: Object.freeze([
      { family: "interceptor", sides: 6 },
      { family: "core", sides: 4 }
    ])
  }),
  Object.freeze({
    round: 5,
    id: "bastion-escort",
    name: "Bastion Escort",
    intent: "Protected missile advance",
    objective: "rocket",
    energy: 1,
    wildPriority: Object.freeze(["shield", "rocket", "laser", "speed"]),
    fleet: Object.freeze([
      { family: "bulwark", sides: 6 },
      { family: "siege", sides: 4 }
    ])
  }),
  Object.freeze({
    round: 6,
    id: "hunter-phalanx",
    name: "Hunter Phalanx",
    intent: "Laser screen formation",
    objective: "shield",
    energy: 2,
    wildPriority: Object.freeze(["laser", "shield", "rocket", "speed"]),
    fleet: Object.freeze([
      { family: "core", sides: 6 },
      { family: "core", sides: 4 },
      { family: "bulwark", sides: 4 }
    ])
  }),
  Object.freeze({
    round: 7,
    id: "siege-line",
    name: "Siege Line",
    intent: "Shield-breaking barrage",
    objective: "speed",
    energy: 2,
    wildPriority: Object.freeze(["rocket", "shield", "laser", "speed"]),
    fleet: Object.freeze([
      { family: "siege", sides: 8 },
      { family: "bulwark", sides: 6 }
    ])
  }),
  Object.freeze({
    round: 8,
    id: "mixed-swarm",
    name: "Mixed Swarm",
    intent: "Unpredictable formation",
    objective: "combined",
    energy: 2,
    wildPriority: Object.freeze(["laser", "rocket", "speed", "shield"]),
    fleet: Object.freeze([
      { family: "interceptor", sides: 4 },
      { family: "siege", sides: 4 },
      { family: "bulwark", sides: 4 },
      { family: "core", sides: 4 }
    ])
  }),
  Object.freeze({
    round: 9,
    id: "dreadnought",
    name: "Dreadnought",
    intent: "Capital systems charging",
    objective: "survive",
    energy: 3,
    wildPriority: Object.freeze(["rocket", "shield", "laser", "speed"]),
    fleet: Object.freeze([
      { family: "core", sides: 12 },
      { family: "bulwark", sides: 6 }
    ])
  }),
  Object.freeze({
    round: 10,
    id: "apogee-flagship",
    name: "Apogee Flagship",
    intent: "Full-spectrum final strike",
    objective: "damage",
    energy: 5,
    wildPriority: Object.freeze(["shield", "rocket", "laser", "speed"]),
    fleet: Object.freeze([
      { family: "core", sides: 12 },
      { family: "siege", sides: 10 },
      { family: "bulwark", sides: 6 }
    ])
  })
]);

export function createPrototypeShip(family, sides = 4, id = `${family}-${sides}`) {
  const blueprint = BATTLE_SHIP_BLUEPRINTS[family];
  if (!blueprint) throw new TypeError(`Unknown battle ship family: ${family}`);
  if (!BATTLE_SHIP_SIZES.includes(sides)) throw new TypeError(`Unsupported battle ship size: ${sides}`);
  if (typeof id !== "string" || id.trim().length === 0) throw new TypeError("Ship id is required");

  return {
    id,
    family,
    name: blueprint.name,
    callSign: blueprint.callSign,
    color: blueprint.color,
    signature: blueprint.signature,
    sides,
    command: COMMAND_BY_SIZE[sides],
    structure: STRUCTURE_BY_SIZE[sides],
    installedSystem: { ...INSTALLED_SYSTEM_BY_SIZE[sides] },
    faces: blueprint.faces.slice(0, sides).map((entry) => ({ ...entry }))
  };
}

export function createThreatFleet(threat) {
  if (!threat || !Array.isArray(threat.fleet)) throw new TypeError("Threat requires a fleet");
  return threat.fleet.map((ship, index) => (
    createPrototypeShip(ship.family, ship.sides, `enemy-${threat.round}-${index + 1}`)
  ));
}
