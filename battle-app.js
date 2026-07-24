import {
  GAME_VERSION,
  MARKET,
  MAX_COMMAND,
  MAX_ROUNDS,
  ORDERS,
  SYMBOLS,
  TRACKS,
  advanceAfterReveal,
  buyShip,
  buyTrack,
  cloneState,
  commandUsed,
  costLabel,
  createInitialState,
  currentThreat,
  deploymentPreview,
  forgeCost,
  forgeFace,
  hydrateFleetState,
  launchOrders,
  lockOrders,
  overclock,
  previewOrders,
  repairShip,
  rerollSelected,
  scoreRank,
  selectedPowerCost,
  setOrder,
  setProtectedShip,
  shapingActionsLeft,
  shipLabel,
  toggleDeployment,
  togglePower,
  toggleSelection,
  trackCost,
  tradeShip,
  upsizeCost,
  upsizeShip,
  cycleWild
} from "./fleet-game-engine.js";

const ACTIVE_RUN_KEY = "apogee-forge-active-v2";
const PILOT_KEY = "apogee-forge-pilot";
const LOCAL_SCORES_KEY = "apogee-forge-scores-v2";
const RULES_SEEN_KEY = "apogee-forge-rules-v2";
const SOUND_KEY = "apogee-forge-sound";

const COMBAT_KEYS = ["laser", "rocket", "shield", "speed"];
const COUNTERS = { laser: "Speed", rocket: "Shield", shield: "Laser", speed: "Rocket" };

const dom = {
  launch: document.querySelector("#launch-screen"),
  game: document.querySelector("#game-screen"),
  form: document.querySelector("#launch-form"),
  pilotInput: document.querySelector("#pilot-name"),
  resume: document.querySelector("#resume-button"),
  brand: document.querySelector("#brand-button"),
  rulesButton: document.querySelector("#how-button"),
  scoresButton: document.querySelector("#scores-button"),
  soundButton: document.querySelector("#sound-button"),
  toastStack: document.querySelector("#toast-stack"),
  rulesModal: document.querySelector("#rules-modal"),
  scoreboardModal: document.querySelector("#scoreboard-modal"),
  forgeModal: document.querySelector("#forge-modal"),
  resultsModal: document.querySelector("#results-modal")
};

let state = null;
let forgeTarget = null;
let tradeTarget = null;
let soundEnabled = localStorage.getItem(SOUND_KEY) !== "off";
let audioContext = null;

function escapeHtml(value) {
  const node = document.createElement("span");
  node.textContent = String(value ?? "");
  return node.innerHTML;
}

function symbolBadge(symbol, value = "", extra = "") {
  const item = SYMBOLS[symbol] || SYMBOLS.void;
  return `<span class="symbol-badge symbol-badge--${symbol} ${extra}" style="--symbol:${item.color}"><b>${item.short}</b>${value !== "" ? `<strong>${value}</strong>` : ""}</span>`;
}

function formatScore(value) {
  return String(Math.max(0, Math.round(value))).padStart(3, "0");
}

function playSound(type = "tap") {
  if (!soundEnabled) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    const osc = audioContext.createOscillator();
    const settings = {
      tap: [180, 260, 0.05],
      roll: [90, 440, 0.16],
      buy: [240, 680, 0.16],
      fire: [78, 190, 0.28],
      error: [145, 96, 0.14],
      apogee: [105, 820, 0.58]
    }[type] || [180, 260, 0.05];
    osc.type = ["fire", "apogee"].includes(type) ? "sawtooth" : "triangle";
    osc.frequency.setValueAtTime(settings[0], now);
    osc.frequency.exponentialRampToValueAtTime(settings[1], now + settings[2]);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(type === "apogee" ? 0.1 : 0.045, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + settings[2]);
    osc.connect(gain).connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + settings[2] + 0.02);
  } catch {
    soundEnabled = false;
  }
}

function toast(message, type = "energy") {
  const symbol = SYMBOLS[type] ? type : type === "error" ? "void" : "energy";
  const item = document.createElement("div");
  item.className = "toast battle-toast";
  item.style.setProperty("--toast-color", SYMBOLS[symbol].color);
  item.innerHTML = `${symbolBadge(symbol)}<span>${escapeHtml(message)}</span>`;
  dom.toastStack.append(item);
  window.setTimeout(() => item.classList.add("is-leaving"), 2500);
  window.setTimeout(() => item.remove(), 2850);
}

function saveState() {
  if (!state || state.phase === "complete") localStorage.removeItem(ACTIVE_RUN_KEY);
  else localStorage.setItem(ACTIVE_RUN_KEY, JSON.stringify(state));
  updateResume();
}

function readSavedState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACTIVE_RUN_KEY));
    if (parsed?.version === GAME_VERSION && parsed?.scoreVersion === GAME_VERSION && parsed.phase !== "complete") return hydrateFleetState(parsed);
  } catch {
    // A broken save should never stop a new game.
  }
  localStorage.removeItem(ACTIVE_RUN_KEY);
  return null;
}

function updateResume() {
  const saved = readSavedState();
  dom.resume.hidden = !saved;
  if (saved) dom.resume.querySelector("strong").textContent = `Resume ${saved.playerName} · Battle ${saved.round}`;
}

function showLaunch() {
  dom.game.hidden = true;
  dom.launch.hidden = false;
  dom.pilotInput.value = localStorage.getItem(PILOT_KEY) || state?.playerName || "";
  updateResume();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showGame() {
  if (!state) return;
  dom.launch.hidden = true;
  dom.game.hidden = false;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function roundTrack() {
  return Array.from({ length: MAX_ROUNDS }, (_, index) => {
    const round = index + 1;
    const status = round < state.round || state.phase === "complete"
      ? "is-done"
      : round === state.round ? "is-current" : "";
    return `<span class="battle-round ${status}"><i></i><b>${String(round).padStart(2, "0")}</b></span>`;
  }).join("");
}

function threatCard(threat, revealed = false) {
  const enemyRoll = revealed ? state.lastRound?.enemyRoll : null;
  const objective = threat.objective === "combined"
    ? "Field all four systems"
    : threat.objective === "survive" ? "Hold formation"
      : threat.objective === "damage" ? "Land decisive hits"
        : `Keep ${SYMBOLS[threat.objective].label} after counters`;
  return `
    <section class="threat-card ${revealed ? "is-revealed" : ""}">
      <div class="threat-signal"><span>ENEMY SIGNAL</span><i></i><small>${revealed ? "ROLL REVEALED" : "DICE ENCRYPTED"}</small></div>
      <div class="threat-main">
        <div>
          <p class="section-number">${revealed ? "CONTACT RESOLVED" : `BATTLE ${String(state.round).padStart(2, "0")} // INCOMING`}</p>
          <h2>${escapeHtml(threat.name)}</h2>
          <p>${escapeHtml(threat.intent)}. <strong>Mission:</strong> ${escapeHtml(objective)}.</p>
        </div>
        <div class="enemy-fleet">${threat.fleet.map((ship) => `<span><b>${ship.family.slice(0, 3).toUpperCase()}</b><strong>d${ship.sides}</strong></span>`).join("")}</div>
      </div>
      ${enemyRoll ? `<div class="enemy-roll-strip">${enemyRoll.rolls.map((roll) => symbolBadge(roll.resolvedSymbol, roll.resolvedValue)).join("")}</div>` : `
        <div class="intent-strip">
          <span>LIKELY PRIORITY</span>
          ${threat.wildPriority.map((symbol, index) => `${symbolBadge(symbol)}<small>${index + 1}</small>`).join("")}
          <em>Intent tells you the plan—not the roll.</em>
        </div>`}
    </section>`;
}

function resourceRail() {
  return `
    <section class="battle-resources" aria-label="Run resources">
      <div class="battle-stat battle-stat--score"><small>FLEET SCORE</small><strong>${formatScore(state.score)}</strong></div>
      <div class="battle-stat"><small>ENERGY</small>${symbolBadge("energy", state.resources.energy)}</div>
      <div class="battle-stat"><small>CREDITS</small>${symbolBadge("credits", state.resources.credits)}</div>
      <div class="battle-stat"><small>COMMAND</small><strong>${commandUsed(state)}<i>/ ${MAX_COMMAND}</i></strong></div>
      <div class="battle-stat"><small>SHIPS</small><strong>${state.ships.length}<i>/ 6</i></strong></div>
    </section>`;
}

function faceStrip(ship, interactive = false) {
  return `<div class="fleet-face-strip" aria-label="${escapeHtml(ship.name)} faces">${ship.faces.map((face, index) => {
    const action = interactive && !face.forged ? `data-action="open-forge" data-ship="${ship.id}" data-face="${index}"` : "";
    const charged = face.charge > 0 ? `<i>+${face.charge}N</i>` : "";
    return `<button class="mini-face ${face.forged ? "is-forged" : ""} ${face.symbol === "void" ? "is-void" : ""}" style="--face:${SYMBOLS[face.symbol].color}" ${action} ${interactive && !face.forged ? "" : "disabled"} title="${SYMBOLS[face.symbol].label} ${face.value}">${SYMBOLS[face.symbol].short}<b>${face.value}</b>${charged}</button>`;
  }).join("")}</div>`;
}

function orderControls() {
  return `
    <section class="command-panel panel-block">
      <div class="block-heading"><span>01 // SECRET ORDERS</span><small>Free to change before launch</small></div>
      <div class="order-grid">${Object.entries(ORDERS).map(([key, order]) => `
        <button class="order-card ${state.order === key ? "is-active" : ""}" data-action="order" data-order="${key}">
          ${symbolBadge(order.symbol)}
          <span><strong>${order.name}</strong><small>${order.detail}</small></span>
          <i>beats ${COUNTERS[order.symbol]}</i>
        </button>`).join("")}</div>
    </section>`;
}

function trackControls() {
  return `
    <section class="panel-block">
      <div class="block-heading"><span>02 // FLEET DOCTRINE</span><small>One major action per battle</small></div>
      <div class="track-grid">${Object.entries(TRACKS).map(([key, track]) => {
        const level = state.tracks[key];
        const cost = trackCost(state, key);
        return `<article class="battle-track">
          <div>${symbolBadge(track.color)}<span><strong>${track.name}</strong><small>${track.description}</small></span></div>
          <div class="level-pips">${Array.from({ length: 5 }, (_, index) => `<i class="${index < level ? "is-on" : ""}"></i>`).join("")}</div>
          <button data-action="track" data-track="${key}" ${state.workshopActionTaken || level >= 5 ? "disabled" : ""}>${level >= 5 ? "MASTERED" : `ADVANCE · ${costLabel(cost)}`}</button>
        </article>`;
      }).join("")}</div>
    </section>`;
}

function shipCard(ship) {
  const cost = upsizeCost(state, ship);
  const operational = ship.stress < ship.structure;
  const isProtected = state.protectedShipId === ship.id;
  const interactive = !state.workshopActionTaken;
  const modules = [
    ...(ship.forgeSystem ? [`AUX ${SYMBOLS[ship.forgeSystem.symbol].short} +${ship.forgeSystem.value} · ${ship.forgeSystem.charge} NRG`] : []),
    ...(ship.installedSystem.value > 0 ? [`CAPITAL ${SYMBOLS[ship.signature === "wild" ? ORDERS[state.order].symbol : ship.signature].short} +${ship.installedSystem.value} · ${ship.installedSystem.charge} NRG`] : [])
  ];
  return `<article class="fleet-ship ${!ship.deployed ? "is-reserve" : ""} ${!operational ? "is-disabled" : ""}" style="--ship:${ship.color}">
    <header>
      <span class="ship-die"><b>d${ship.sides}</b><small>${ship.callSign}</small></span>
      <div><strong>${escapeHtml(ship.name)}</strong><small>${shipLabel(ship.sides)} · ${ship.command} Command · ${ship.structure} Structure</small></div>
      <button class="protect-toggle ${isProtected ? "is-on" : ""}" data-action="protect" data-ship="${ship.id}" title="Take damage last">${isProtected ? "PROTECTED" : "PROTECT"}</button>
    </header>
    <div class="stress-line"><span>STRESS</span><div>${Array.from({ length: ship.structure }, (_, index) => `<i class="${index < ship.stress ? "is-hit" : ""}"></i>`).join("")}</div><b>${ship.stress}/${ship.structure}</b></div>
    ${modules.length ? `<div class="ship-modules">${modules.map((module) => `<span>${module}</span>`).join("")}</div>` : ""}
    ${faceStrip(ship, interactive)}
    <footer>
      <button data-action="deploy" data-ship="${ship.id}">${ship.deployed ? "MOVE TO RESERVE" : "DEPLOY"}</button>
      <button data-action="repair" data-ship="${ship.id}" ${ship.stress <= 0 ? "disabled" : ""}>REPAIR 2 · 1 NRG</button>
      <button data-action="upsize" data-ship="${ship.id}" ${state.workshopActionTaken || !cost ? "disabled" : ""}>${cost ? `SIZE UP · ${costLabel(cost)}` : "MAX SIZE"}</button>
      ${ship.family === "core" || ship.sides !== 4 ? "" : `<button data-action="open-trade" data-ship="${ship.id}" ${state.workshopActionTaken ? "disabled" : ""}>TRADE · 2 CR</button>`}
    </footer>
  </article>`;
}

function workshopView() {
  const threat = currentThreat(state);
  const deployment = deploymentPreview(state);
  const actionText = state.workshopActionTaken ? "MAJOR ACTION SPENT" : "1 MAJOR ACTION READY";
  return `
    ${threatCard(threat)}
    <section class="phase-panel battle-phase workshop-v2">
      <div class="phase-intro">
        <div><p class="eyebrow">ORBITAL WORKSHOP</p><h1>Read intent. Build a response.</h1><p>Choose an order, then spend at most one major action to buy, Size Up, Forge a face, trade a hull, or advance doctrine. Repairs are minor actions.</p></div>
        <div class="action-token ${state.workshopActionTaken ? "is-spent" : ""}"><i></i><span>${actionText}</span></div>
      </div>
      ${orderControls()}
      ${trackControls()}
      <section class="panel-block">
        <div class="block-heading"><span>03 // SHIP BAY</span><small>${commandUsed(state)} / ${MAX_COMMAND} Command</small></div>
        <div class="fleet-list">${state.ships.map(shipCard).join("")}</div>
      </section>
      <section class="panel-block">
        <div class="block-heading"><span>04 // HULL MARKET</span><small>New d4 · 4 Credits · 2 Command</small></div>
        <div class="market-grid">${MARKET.map((item) => `<button class="market-hull" style="--ship:${item.color}" data-action="buy" data-family="${item.family}" ${state.workshopActionTaken ? "disabled" : ""}><b>${item.title}</b><small>${item.detail}</small><span>COMMISSION · 4 CR</span></button>`).join("")}</div>
      </section>
      <div class="launch-bar">
        <div><span>${deployment.active.length} ships active · ${deployment.disabled.length} disabled</span><strong>${deployment.upkeep ? `${deployment.upkeep} Energy formation upkeep` : "No formation upkeep"}</strong></div>
        <button class="primary-button" data-action="launch" ${!deployment.canLaunch ? "disabled" : ""}><span>Roll ${ORDERS[state.order].name} orders</span><b>→</b></button>
      </div>
    </section>`;
}

function totalsGrid(totals, rawTotals = null) {
  return `<div class="combat-totals">${COMBAT_KEYS.map((symbol) => `<div style="--symbol:${SYMBOLS[symbol].color}"><small>${SYMBOLS[symbol].label}</small><strong>${totals[symbol]}</strong>${rawTotals && rawTotals[symbol] !== totals[symbol] ? `<i>${rawTotals[symbol]} + tactic</i>` : `<i>beats ${COUNTERS[symbol]}</i>`}</div>`).join("")}</div>`;
}

function rollingShip(ship, preview) {
  const roll = state.rolls[ship.id];
  if (!roll) return "";
  const resolved = preview.resolvedRolls.find((item) => item.shipId === ship.id);
  const symbol = resolved?.symbol || roll.symbol;
  const selected = state.selected.includes(ship.id);
  const isWild = roll.symbol === "wild";
  return `<article class="roll-ship ${selected ? "is-selected" : ""}" style="--ship:${ship.color}">
    <button class="rolled-face" data-action="${isWild ? "wild" : "select"}" data-ship="${ship.id}" style="--face:${SYMBOLS[symbol].color}">
      <small>${escapeHtml(ship.name)} · d${ship.sides}</small>
      <span>${SYMBOLS[symbol].short}</span>
      <strong>${resolved?.value ?? roll.value}</strong>
      <em>${isWild ? "TAP TO CHANGE" : selected ? "SELECTED" : "TAP TO REROLL"}</em>
    </button>
    <div class="roll-face-note">${roll.forged ? "FORGED FACE · " : ""}${roll.charge ? `${roll.fallback} unpowered / ${roll.value} powered` : `${SYMBOLS[symbol].label} output`}</div>
  </article>`;
}

function powerControls(preview) {
  const choices = [];
  for (const ship of state.ships.filter((item) => state.rolls[item.id])) {
    const roll = state.rolls[ship.id];
    if (roll.charge > 0) choices.push({
      key: `face:${ship.id}`,
      title: `${ship.name} face`,
      detail: `${roll.fallback} → ${roll.value}`,
      cost: roll.charge
    });
    if (ship.installedSystem.value > 0) choices.push({
      key: `system:${ship.id}`,
      title: `${ship.name} system`,
      detail: `+${ship.installedSystem.value} ${SYMBOLS[ship.signature === "wild" ? ORDERS[state.order].symbol : ship.signature].short}`,
      cost: ship.installedSystem.charge
    });
    if (ship.forgeSystem?.value > 0) choices.push({
      key: `forge:${ship.id}`,
      title: `${ship.name} auxiliary`,
      detail: `+${ship.forgeSystem.value} ${SYMBOLS[ship.forgeSystem.symbol].short}`,
      cost: ship.forgeSystem.charge
    });
  }
  if (!choices.length) return `<p class="quiet-copy">No charged systems in this formation yet. A first Forge installs an auxiliary; Ship-8 and larger hulls install a capital system.</p>`;
  return `<div class="power-grid">${choices.map((choice) => {
    const on = state.powerSelections.includes(choice.key);
    return `<button class="power-choice ${on ? "is-on" : ""}" data-action="power" data-key="${choice.key}"><i></i><span><strong>${escapeHtml(choice.title)}</strong><small>${choice.detail}</small></span><b>${choice.cost} NRG</b></button>`;
  }).join("")}</div><p class="power-budget">Power plan: <strong>${preview.powerCost}</strong> of <strong>${state.resources.energy}</strong> Energy</p>`;
}

function rollingView() {
  const threat = currentThreat(state);
  const preview = previewOrders(state);
  const active = state.ships.filter((ship) => state.rolls[ship.id]);
  const rerolls = shapingActionsLeft(state);
  return `
    ${threatCard(threat)}
    <section class="phase-panel battle-phase rolling-v2">
      <div class="phase-intro">
        <div><p class="eyebrow">SHAPING PHASE // ${ORDERS[state.order].name.toUpperCase()}</p><h1>Build your locked packet.</h1><p>The enemy sees nothing until you lock. Reroll whole ships, choose Wild output, and decide which charged systems deserve Energy.</p></div>
        <div class="order-lock-chip">${symbolBadge(ORDERS[state.order].symbol)}<span><small>FLEET ORDER</small><strong>${ORDERS[state.order].name}</strong></span></div>
      </div>
      <div class="roll-grid-v2">${active.map((ship) => rollingShip(ship, preview)).join("")}</div>
      <div class="shaping-actions">
        <button class="secondary-button" data-action="reroll" ${!state.selected.length || rerolls <= 0 ? "disabled" : ""}><span>Reroll selected</span><small>${state.freeRerolls > 0 ? "FREE SHAPING" : `${state.selected.length} ENERGY`} · ${rerolls} LEFT</small></button>
        <button class="secondary-button" data-action="overclock" ${state.overclockUsed ? "disabled" : ""}><span>Reroll all</span><small>${state.overclockUsed ? "USED" : "FREE · ONCE PER RUN"}</small></button>
      </div>
      <section class="roll-console">
        <div><div class="block-heading"><span>POWER ROUTING</span><small>Explicit Energy choices</small></div>${powerControls(preview)}</div>
        <aside><div class="block-heading"><span>LOCKED TOTAL PREVIEW</span><small>Before enemy counters</small></div>${totalsGrid(preview.totals, preview.rawTotals)}
          <div class="preview-gains"><span>On lock</span>${symbolBadge("energy", `+${preview.gains.energy}`)}${symbolBadge("credits", `+${preview.gains.credits}`)}</div>
          <div class="tactic-list">${preview.tactics.length ? preview.tactics.map((tactic) => `<span>${escapeHtml(tactic.replace(":", " → ").replaceAll("-", " "))}</span>`).join("") : "<em>No fleet tactic online yet.</em>"}</div>
        </aside>
      </section>
      <div class="launch-bar lock-bar">
        <div><span>LOCK IS FINAL</span><strong>Both fleets resolve simultaneously</strong></div>
        <button class="primary-button" data-action="lock"><span>Lock orders & reveal</span><b>⚡</b></button>
      </div>
    </section>`;
}

function revealView() {
  const result = state.lastRound;
  const player = result.battle.teams.player;
  const enemy = result.battle.teams.enemy;
  const win = result.battle.winnerTeamId === "player";
  const draw = result.battle.winnerTeamId === null;
  const scoreParts = [
    ["Hits", result.scoring.hitScore],
    ["Tactical edge", result.scoring.tacticalScore],
    ["Defense", result.scoring.defenseScore],
    ["Mission", result.scoring.missionScore],
    ["Integrity", result.scoring.integrityBonus],
    ["Combined arms", result.scoring.tacticScore],
    ...(result.apogeeHitBonus ? [["Apogee hits", result.apogeeHitBonus]] : []),
    ...(result.apogeeEnergyBonus ? [["Stored Energy", result.apogeeEnergyBonus]] : []),
    ...(result.distressPenalty ? [["Distress", -result.distressPenalty]] : [])
  ];
  return `
    ${threatCard(result.threat, true)}
    <section class="phase-panel battle-phase reveal-v2">
      <div class="battle-verdict ${win ? "is-win" : draw ? "is-draw" : "is-loss"}">
        <p class="eyebrow">SIMULTANEOUS RESOLUTION</p>
        <h1>${win ? "You controlled the engagement." : draw ? "The fleets crossed in a dead heat." : "The enemy punched through."}</h1>
        <p>Lasers cancel Speed. Speed cancels Rockets. Rockets cancel Shields. Shields cancel Lasers.</p>
      </div>
      <div class="versus-board">
        <article><header><span>YOUR LOCKED FLEET</span><strong>${player.hits} HITS</strong></header>${totalsGrid(player.totals)}<footer><span>Remaining</span>${COMBAT_KEYS.map((key) => symbolBadge(key, player.remaining[key])).join("")}</footer></article>
        <div class="versus-mark"><b>VS</b><span>${win ? "WIN" : draw ? "DRAW" : "BREACH"}</span></div>
        <article><header><span>${escapeHtml(result.threat.name).toUpperCase()}</span><strong>${enemy.hits} HITS</strong></header>${totalsGrid(enemy.totals)}<footer><span>Remaining</span>${COMBAT_KEYS.map((key) => symbolBadge(key, enemy.remaining[key])).join("")}</footer></article>
      </div>
      <div class="resolution-grid">
        <section><div class="block-heading"><span>SCORE TRANSMISSION</span><small>Battle ${result.round}</small></div><dl>${scoreParts.map(([label, value]) => `<div><dt>${label}</dt><dd>${value >= 0 ? "+" : ""}${value}</dd></div>`).join("")}<div class="score-total"><dt>Battle score</dt><dd>+${result.scored}</dd></div></dl></section>
        <section><div class="block-heading"><span>FLEET CONDITION</span><small>${player.stressToAssign} incoming Stress</small></div><div class="condition-list">${state.ships.map((ship) => `<div><span><strong>${escapeHtml(ship.name)}</strong><small>d${ship.sides}</small></span><div>${Array.from({ length: ship.structure }, (_, index) => `<i class="${index < ship.stress ? "is-hit" : ""}"></i>`).join("")}</div><b>${ship.stress}/${ship.structure}</b></div>`).join("")}</div>${state.distress ? `<p class="distress-note">Distress events: ${state.distress}. Repair stressed ships before redeploying.</p>` : ""}</section>
      </div>
      <div class="launch-bar">
        <div><span>TOTAL FLEET SCORE</span><strong>${formatScore(state.score)}</strong></div>
        <button class="primary-button" data-action="advance"><span>${state.round === MAX_ROUNDS ? "Complete Apogee run" : `Return to workshop ${String(state.round + 1).padStart(2, "0")}`}</span><b>→</b></button>
      </div>
    </section>`;
}

function render() {
  if (!state) return;
  const phaseLabel = state.phase === "workshop" ? "WORKSHOP" : state.phase === "rolling" ? "SHAPING" : "BATTLE REVEAL";
  dom.game.innerHTML = `
    <div class="run-header battle-run-header">
      <div><p class="eyebrow">${phaseLabel} // SOLO CAMPAIGN</p><h1>Battle <span>${String(state.round).padStart(2, "0")}</span> / ${MAX_ROUNDS}</h1></div>
      <div class="run-identity"><small>ADMIRAL</small><strong>${escapeHtml(state.playerName)}</strong></div>
    </div>
    <div class="battle-round-track">${roundTrack()}</div>
    ${resourceRail()}
    <main class="battle-shell">${state.phase === "workshop" ? workshopView() : state.phase === "rolling" ? rollingView() : revealView()}</main>`;
  saveState();
}

function handleResult(result, successSound = "buy") {
  if (!result?.ok) {
    toast(result?.message || "That action is not available.", "error");
    playSound("error");
    return false;
  }
  if (result.message) toast(result.message, "credits");
  playSound(successSound);
  render();
  return true;
}

function openForge(shipId, faceIndex) {
  const ship = state.ships.find((item) => item.id === shipId);
  const face = ship?.faces?.[faceIndex];
  if (!ship || !face || state.workshopActionTaken) return;
  forgeTarget = { shipId, faceIndex };
  tradeTarget = null;
  const cost = forgeCost(state, ship, faceIndex);
  dom.forgeModal.querySelector(".eyebrow").textContent = "FACE FORGE // SIDE-UPGRADE";
  dom.forgeModal.querySelector("h2").textContent = `Rewrite ${ship.name} face ${faceIndex + 1}`;
  const reinforcement = ship.faces.some((candidate) => candidate.forged) ? "" : " The ship also gains +1 Structure and an output-1 auxiliary system matching the symbol you choose; activating it costs 1 Energy each battle.";
  dom.forgeModal.querySelector(".modal-lead").textContent = `${SYMBOLS[face.symbol].label} ${face.value} becomes a stronger side-system permanently. This rewrite survives every future Size Up.${reinforcement}`;
  dom.forgeModal.querySelector("#forge-options").innerHTML = COMBAT_KEYS.concat(["energy", "credits"]).map((symbol) => `<button class="forge-choice" style="--symbol-color:${SYMBOLS[symbol].color}" data-action="forge" data-symbol="${symbol}">${symbolBadge(symbol)}<strong>${SYMBOLS[symbol].label} ${face.symbol === "void" ? 1 : face.value + 1}</strong><small>${costLabel(cost)}</small></button>`).join("");
  dom.forgeModal.showModal();
}

function openTrade(shipId) {
  const ship = state.ships.find((item) => item.id === shipId);
  if (!ship || state.workshopActionTaken) return;
  tradeTarget = shipId;
  forgeTarget = null;
  dom.forgeModal.querySelector(".eyebrow").textContent = "HULL EXCHANGE // SIDEGRADE";
  dom.forgeModal.querySelector("h2").textContent = `Trade ${ship.name}`;
  dom.forgeModal.querySelector(".modal-lead").textContent = "Exchange this unexpanded d4 for a different d4 family. The hull trade costs 2 Credits and uses this battle's major action.";
  dom.forgeModal.querySelector("#forge-options").innerHTML = MARKET.filter((item) => item.family !== ship.family).map((item) => `<button class="forge-choice" style="--symbol-color:${item.color}" data-action="trade" data-family="${item.family}"><span class="trade-die">d4</span><strong>${item.title}</strong><small>2 CR</small></button>`).join("");
  dom.forgeModal.showModal();
}

function rulesMarkup() {
  return `
    <button class="modal-close" data-close-modal type="button" aria-label="Close">×</button>
    <p class="eyebrow">FLEET MANUAL // VERSION 2</p>
    <h2>Plan in secret. Resolve at once.</h2>
    <div class="counter-loop">
      ${[["shield", "laser"], ["laser", "speed"], ["speed", "rocket"], ["rocket", "shield"]].map(([winner, loser]) => `<div>${symbolBadge(winner)}<span><strong>${SYMBOLS[winner].label}</strong><small>cancels ${SYMBOLS[loser].label}</small></span></div>`).join("")}
    </div>
    <div class="rules-columns battle-rules">
      <section><h3>Every battle</h3><p><strong>1. Read intent.</strong> You see the enemy fleet and likely priority, but never its exact roll.</p><p><strong>2. Build and order.</strong> Spend one major workshop action, choose one fleet order, set reserves, and choose which ship takes damage last.</p><p><strong>3. Shape.</strong> Roll your deployed fleet. Reroll ships, aim Wild faces, and spend Energy on charged faces and installed systems.</p><p><strong>4. Lock.</strong> Both fleets reveal and their four totals cancel simultaneously.</p></section>
      <section><h3>Size-up or side-upgrade?</h3><p><strong>Size Up</strong> adds new faces, Structure, and—at d8+—a charged installed system. Larger ships consume scarce Command, so four capital ships cannot simply replace a flexible fleet.</p><p><strong>Forge</strong> rewrites one existing face and raises ordinary output by 1. A ship's first Forge also grants +1 Structure and a fixed output-1 auxiliary system that costs 1 Energy to activate. It improves strength and consistency without adding a die or changing the odds. Void repairs become value 1, and every benefit persists when the ship grows.</p><p><strong>Tactics:</strong> reaching 3 in a combat system triggers a bonus. Covering all four systems creates Combined Arms. A Void-free formation salvages +1 Credit.</p></section>
    </div>
    <button class="primary-button modal-action" data-close-modal type="button"><span>Enter the battle line</span><b>→</b></button>`;
}

function localScores() {
  try {
    const scores = JSON.parse(localStorage.getItem(LOCAL_SCORES_KEY));
    return Array.isArray(scores) ? scores.filter((entry) => (entry.scoreVersion ?? 1) === GAME_VERSION) : [];
  } catch {
    return [];
  }
}

function saveLocalScore(entry) {
  const scores = localScores().filter((score) => score.runId !== entry.runId);
  scores.push(entry);
  scores.sort((left, right) => right.score - left.score || left.createdAt.localeCompare(right.createdAt));
  localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(scores.slice(0, 10)));
}

async function getScores() {
  try {
    const response = await fetch("/api/scores", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Score relay unavailable");
    const body = await response.json();
    return { scores: (body.scores || []).filter((entry) => (entry.scoreVersion ?? 1) === GAME_VERSION).slice(0, 10), mode: "shared" };
  } catch {
    return { scores: localScores(), mode: "local" };
  }
}

function scoreEntry(run) {
  const final = run.roundHistory.at(-1);
  const hits = run.roundHistory.reduce((total, round) => total + round.battle.teams.player.hits, 0);
  return {
    name: run.playerName,
    score: run.score,
    scoreVersion: GAME_VERSION,
    runId: run.runId,
    createdAt: new Date().toISOString(),
    breakdown: {
      apogee: final?.scored || 0,
      ships: run.ships.length,
      bestTrack: Math.max(...Object.values(run.tracks)),
      hits,
      distress: run.distress
    }
  };
}

async function submitScore(run) {
  const entry = scoreEntry(run);
  try {
    const response = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });
    if (!response.ok) throw new Error("Score relay unavailable");
  } catch {
    saveLocalScore(entry);
  }
}

async function openScores() {
  const modal = dom.scoreboardModal;
  if (!modal.open) modal.showModal();
  modal.innerHTML = `<button class="modal-close" data-close-modal type="button" aria-label="Close">×</button><p class="eyebrow">BATTLE RELAY // VERSION 2</p><h2>Apogee Admirals</h2><div class="scoreboard-list" id="scoreboard-list"><p class="loading-copy">Contacting relay…</p></div><p class="scoreboard-note" id="scoreboard-note"></p>`;
  const result = await getScores();
  const list = modal.querySelector("#scoreboard-list");
  list.innerHTML = result.scores.length ? result.scores.map((entry, index) => {
    const when = new Date(entry.createdAt);
    const date = Number.isNaN(when.valueOf()) ? "RECENT" : when.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `<div class="score-row"><b>${String(index + 1).padStart(2, "0")}</b><span class="score-pilot"><strong>${escapeHtml(entry.name)}</strong><small>${date}</small></span><span>${scoreRank(entry.score).title}</span><strong>${formatScore(entry.score)}</strong></div>`;
  }).join("") : `<div class="empty-scores">No version-2 battle runs yet. The first signal can be yours.</div>`;
  modal.querySelector("#scoreboard-note").textContent = result.mode === "shared"
    ? "Shared battle relay online. Classic score-attack runs remain on their own board."
    : "Local relay mode: battle scores are saved on this device.";
}

function showResults() {
  const rank = scoreRank(state.score);
  const hits = state.roundHistory.reduce((total, round) => total + round.battle.teams.player.hits, 0);
  dom.resultsModal.innerHTML = `
    <div class="result-burst" aria-hidden="true"></div>
    <p class="eyebrow">APOGEE CAMPAIGN COMPLETE</p>
    <div class="rank-badge"><span>${rank.tier}</span></div>
    <h2>${rank.title}</h2>
    <p class="result-score"><strong>${formatScore(state.score)}</strong><span>FLEET SCORE</span></p>
    <div class="result-stats"><div><small>TOTAL HITS</small><strong>${hits}</strong></div><div><small>FINAL FLEET</small><strong>${state.ships.length}</strong></div><div><small>DISTRESS</small><strong>${state.distress}</strong></div><div><small>BEST TRACK</small><strong>${Math.max(...Object.values(state.tracks))}</strong></div></div>
    <div class="result-actions"><button class="secondary-button" data-action="result-scores"><span>View battle board</span></button><button class="primary-button" data-action="new-run"><span>Forge another fleet</span><b>→</b></button></div>`;
  dom.resultsModal.showModal();
  playSound("apogee");
  submitScore(cloneState(state));
}

function startRun(name) {
  localStorage.setItem(PILOT_KEY, name);
  state = createInitialState(name);
  playSound("roll");
  showGame();
  if (!localStorage.getItem(RULES_SEEN_KEY)) {
    localStorage.setItem(RULES_SEEN_KEY, "yes");
    dom.rulesModal.showModal();
  }
}

dom.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = dom.pilotInput.value.trim();
  if (!name) return;
  const saved = readSavedState();
  if (saved && !window.confirm("Start a new battle run and replace the active one?")) return;
  startRun(name);
});

dom.resume.addEventListener("click", () => {
  state = readSavedState();
  if (state) showGame();
});

dom.brand.addEventListener("click", showLaunch);
dom.rulesButton.addEventListener("click", () => dom.rulesModal.showModal());
dom.scoresButton.addEventListener("click", openScores);
dom.soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, soundEnabled ? "on" : "off");
  dom.soundButton.classList.toggle("is-muted", !soundEnabled);
  toast(soundEnabled ? "Audio link online." : "Audio link muted.", "energy");
});

document.addEventListener("click", (event) => {
  const close = event.target.closest("[data-close-modal]");
  if (close) {
    close.closest("dialog")?.close();
    return;
  }
  const button = event.target.closest("[data-action]");
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === "order") handleResult(setOrder(state, button.dataset.order), "tap");
  else if (action === "track") handleResult(buyTrack(state, button.dataset.track));
  else if (action === "buy") handleResult(buyShip(state, button.dataset.family));
  else if (action === "upsize") handleResult(upsizeShip(state, button.dataset.ship));
  else if (action === "repair") handleResult(repairShip(state, button.dataset.ship), "tap");
  else if (action === "deploy") handleResult(toggleDeployment(state, button.dataset.ship), "tap");
  else if (action === "protect") handleResult(setProtectedShip(state, button.dataset.ship), "tap");
  else if (action === "open-forge") openForge(button.dataset.ship, Number(button.dataset.face));
  else if (action === "open-trade") openTrade(button.dataset.ship);
  else if (action === "forge" && forgeTarget) {
    const result = forgeFace(state, forgeTarget.shipId, forgeTarget.faceIndex, button.dataset.symbol);
    if (result.ok) dom.forgeModal.close();
    handleResult(result);
  } else if (action === "trade" && tradeTarget) {
    const result = tradeShip(state, tradeTarget, button.dataset.family);
    if (result.ok) dom.forgeModal.close();
    handleResult(result);
  } else if (action === "launch") {
    const result = launchOrders(state);
    if (handleResult(result, "roll")) window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (action === "select") {
    toggleSelection(state, button.dataset.ship);
    playSound("tap");
    render();
  } else if (action === "wild") {
    cycleWild(state, button.dataset.ship);
    playSound("tap");
    render();
  } else if (action === "power") handleResult(togglePower(state, button.dataset.key), "tap");
  else if (action === "reroll") handleResult(rerollSelected(state), "roll");
  else if (action === "overclock") handleResult(overclock(state), "roll");
  else if (action === "lock") {
    const result = lockOrders(state);
    if (handleResult(result, "fire")) window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (action === "advance") {
    const result = advanceAfterReveal(state);
    if (!result.ok) handleResult(result);
    else if (result.complete) {
      saveState();
      showResults();
    } else {
      playSound("tap");
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  } else if (action === "result-scores") {
    dom.resultsModal.close();
    openScores();
  } else if (action === "new-run") {
    dom.resultsModal.close();
    state = null;
    showLaunch();
  }
});

for (const modal of [dom.rulesModal, dom.scoreboardModal, dom.forgeModal]) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
}

dom.rulesModal.innerHTML = rulesMarkup();
dom.soundButton.classList.toggle("is-muted", !soundEnabled);
dom.pilotInput.value = localStorage.getItem(PILOT_KEY) || "";
updateResume();
