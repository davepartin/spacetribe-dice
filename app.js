import {
  DIE_SIZES,
  MARKET,
  SYMBOLS,
  TRACKS,
  baseAttack,
  buyDie,
  buyTrack,
  commitRoll,
  costLabel,
  createInitialState,
  cycleWild,
  forgeCost,
  forgeFace,
  listResonances,
  maxDice,
  nextRound,
  overclock,
  previewRoll,
  rerollSelected,
  rerollsAvailable,
  scoreRank,
  scrapDie,
  shapingActionsLeft,
  shipLabel,
  toggleSelection,
  trackCost,
  upgradeCost,
  upgradeDie
} from "./game-engine.js?v=1.0.14";

const ACTIVE_RUN_KEY = "apogee-forge-active-run-v1";
const LOCAL_SCORES_KEY = "apogee-forge-local-scores-v1";
const PILOT_KEY = "apogee-forge-pilot";
const RULES_SEEN_KEY = "apogee-forge-rules-seen";
const SOUND_KEY = "apogee-forge-sound";

const dom = {
  launch: document.querySelector("#launch-screen"),
  game: document.querySelector("#game-screen"),
  form: document.querySelector("#launch-form"),
  pilotInput: document.querySelector("#pilot-name"),
  resume: document.querySelector("#resume-button"),
  brand: document.querySelector("#brand-button"),
  how: document.querySelector("#how-button"),
  scores: document.querySelector("#scores-button"),
  sound: document.querySelector("#sound-button"),
  rulesModal: document.querySelector("#rules-modal"),
  scoreboardModal: document.querySelector("#scoreboard-modal"),
  forgeModal: document.querySelector("#forge-modal"),
  resultsModal: document.querySelector("#results-modal"),
  scoreList: document.querySelector("#scoreboard-list"),
  scoreNote: document.querySelector("#scoreboard-note"),
  resetScores: document.querySelector("#reset-scores-button"),
  resetForm: document.querySelector("#reset-form"),
  resetToken: document.querySelector("#reset-token"),
  cancelReset: document.querySelector("#cancel-reset-button"),
  symbolLegend: document.querySelector("#symbol-legend"),
  phaseKicker: document.querySelector("#phase-kicker"),
  phaseTitle: document.querySelector("#phase-title"),
  pilotLabel: document.querySelector("#pilot-label"),
  roundTrack: document.querySelector("#round-track"),
  scoreValue: document.querySelector("#score-value"),
  baseValue: document.querySelector("#base-value"),
  energyValue: document.querySelector("#energy-value"),
  techValue: document.querySelector("#tech-value"),
  forgeValue: document.querySelector("#forge-value"),
  fluxValue: document.querySelector("#flux-value"),
  rollPhase: document.querySelector("#roll-phase"),
  workshopPhase: document.querySelector("#workshop-phase"),
  diceGrid: document.querySelector("#dice-grid"),
  messageRibbon: document.querySelector("#message-ribbon"),
  rerollGauge: document.querySelector("#reroll-gauge"),
  volleyTotal: document.querySelector("#volley-total"),
  volleyBreakdown: document.querySelector("#volley-breakdown"),
  gainPreview: document.querySelector("#gain-preview"),
  rerollButton: document.querySelector("#reroll-button"),
  rerollCost: document.querySelector("#reroll-cost"),
  overclockButton: document.querySelector("#overclock-button"),
  commitButton: document.querySelector("#commit-button"),
  lastVolley: document.querySelector("#last-volley"),
  trackList: document.querySelector("#track-list"),
  bayList: document.querySelector("#bay-list"),
  bayCapacity: document.querySelector("#bay-capacity"),
  marketList: document.querySelector("#market-list"),
  workshopTip: document.querySelector("#workshop-tip"),
  nextRound: document.querySelector("#next-round-button"),
  nextRoundLabel: document.querySelector("#next-round-label"),
  toastStack: document.querySelector("#toast-stack"),
  forgeTitle: document.querySelector("#forge-title"),
  forgeOptions: document.querySelector("#forge-options"),
  rankBadge: document.querySelector("#rank-badge"),
  resultTitle: document.querySelector("#result-title"),
  resultScore: document.querySelector("#result-score"),
  resultStats: document.querySelector("#result-stats"),
  resultScores: document.querySelector("#result-scores-button"),
  newRun: document.querySelector("#new-run-button")
};

let state = null;
let forgeTargetId = null;
let audioContext = null;
let soundEnabled = localStorage.getItem(SOUND_KEY) !== "off";

function faceMapHtml(die, currentIndex = -1) {
  return `
    <div class="die-faces" aria-label="All ${shipLabel(die.sides)} faces">
      ${die.faces.map((face, index) => {
        const live = index === currentIndex;
        const title = `${SYMBOLS[face.symbol].label}${face.value > 0 ? ` ${face.value}` : ""}${face.forged ? " · rewritten" : ""}${live ? " · current" : ""}`;
        return `
          <span class="face-chip ${live ? "is-live" : ""} ${face.forged ? "is-forged" : ""} ${face.symbol === "void" ? "is-void" : ""}" style="--face-color:${SYMBOLS[face.symbol].color}" title="${escapeHtml(title)}">
            ${icon(face.symbol)}
            ${face.value > 0 ? `<b>${face.value}</b>` : `<b class="face-zero">0</b>`}
          </span>`;
      }).join("")}
    </div>`;
}

function icon(symbol, className = "") {
  return `<svg class="${className}" aria-hidden="true"><use href="#icon-${symbol}"></use></svg>`;
}

function escapeHtml(value) {
  const node = document.createElement("span");
  node.textContent = String(value);
  return node.innerHTML;
}

function formatScore(value) {
  return String(Math.max(0, Math.round(value))).padStart(3, "0");
}

function canPay(cost) {
  return Object.entries(cost).every(([key, value]) => state.resources[key] >= value);
}

function saveState() {
  if (!state || state.phase === "complete") {
    localStorage.removeItem(ACTIVE_RUN_KEY);
    updateResume();
    return;
  }
  localStorage.setItem(ACTIVE_RUN_KEY, JSON.stringify(state));
  updateResume();
}

function readSavedState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACTIVE_RUN_KEY));
    if (parsed?.version === 1 && parsed?.phase !== "complete" && Array.isArray(parsed?.dice)) {
      parsed.freeRerolls ||= 0;
      parsed.shapeBonusGranted ||= false;
      return parsed;
    }
  } catch {
    localStorage.removeItem(ACTIVE_RUN_KEY);
  }
  return null;
}

function updateResume() {
  const saved = readSavedState();
  dom.resume.hidden = !saved;
  if (saved) {
    dom.resume.querySelector("strong").textContent = `Resume ${saved.playerName} · Round ${saved.round}`;
  }
}

function playSound(type = "tap") {
  if (!soundEnabled) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    const osc = audioContext.createOscillator();
    const settings = {
      tap: [190, 250, .045],
      roll: [110, 420, .13],
      buy: [260, 610, .16],
      attack: [95, 180, .25],
      error: [140, 105, .13],
      apogee: [120, 760, .55]
    }[type] || [190, 250, .05];
    osc.type = type === "attack" || type === "apogee" ? "sawtooth" : "triangle";
    osc.frequency.setValueAtTime(settings[0], now);
    osc.frequency.exponentialRampToValueAtTime(settings[1], now + settings[2]);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(type === "apogee" ? .12 : .055, now + .015);
    gain.gain.exponentialRampToValueAtTime(.0001, now + settings[2]);
    osc.connect(gain).connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + settings[2] + .02);
  } catch {
    soundEnabled = false;
  }
}

function toast(message, type = "tech") {
  const symbol = SYMBOLS[type] ? type : type === "error" ? "void" : "tech";
  const item = document.createElement("div");
  item.className = "toast";
  item.style.setProperty("--toast-color", SYMBOLS[symbol].color);
  item.innerHTML = `${icon(symbol)}<span>${escapeHtml(message)}</span>`;
  dom.toastStack.append(item);
  window.setTimeout(() => item.classList.add("is-leaving"), 2500);
  window.setTimeout(() => item.remove(), 2800);
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

function render() {
  if (!state) return;
  dom.phaseKicker.textContent = state.phase === "rolling" ? "ROLL PHASE" : state.phase === "workshop" ? "WORKSHOP PHASE" : "APOGEE COMPLETE";
  dom.phaseTitle.innerHTML = `Round <span>${String(state.round).padStart(2, "0")}</span> / 10`;
  dom.pilotLabel.textContent = state.playerName;
  dom.scoreValue.textContent = formatScore(state.score);
  dom.baseValue.textContent = baseAttack(state);
  dom.energyValue.textContent = state.resources.energy;
  dom.techValue.textContent = state.resources.tech;
  dom.forgeValue.textContent = state.resources.forge;
  dom.fluxValue.textContent = state.resources.flux;
  renderRoundTrack();
  dom.rollPhase.hidden = state.phase !== "rolling";
  dom.workshopPhase.hidden = state.phase !== "workshop";
  if (state.phase === "rolling") renderRoll();
  if (state.phase === "workshop") renderWorkshop();
  saveState();
}

function renderRoundTrack() {
  dom.roundTrack.innerHTML = Array.from({ length: 10 }, (_, index) => {
    const round = index + 1;
    const className = round < state.round || state.phase === "complete"
      ? "is-complete"
      : round === state.round ? "is-current" : "";
    return `<i class="round-pip ${className}" title="Round ${round}"></i>`;
  }).join("");
}

function renderRoll() {
  const preview = previewRoll(state);
  dom.diceGrid.innerHTML = state.dice.map((die) => {
    const roll = state.rolls[die.id];
    const resultSymbol = roll.symbol === "wild" ? roll.wildChoice : roll.symbol;
    const displaySymbol = roll.symbol === "wild" ? "wild" : roll.symbol;
    const selected = state.selected.includes(die.id);
    const label = roll.symbol === "wild"
      ? `Wild → ${SYMBOLS[resultSymbol].short}`
      : `${SYMBOLS[resultSymbol].label} ${roll.value}`;
    return `
      <article class="die-card ${selected ? "is-selected" : ""} ${roll.symbol === "wild" ? "is-wild" : ""}" data-die-id="${die.id}" style="--die-color:${die.color};--die-accent:${die.accent};--result-color:${SYMBOLS[resultSymbol].color}" role="button" tabindex="0" aria-label="${escapeHtml(die.name)} ${shipLabel(die.sides)}, rolled ${escapeHtml(label)}${selected ? ", selected to reroll" : ""}">
        <div class="die-meta"><strong>${escapeHtml(die.name)}</strong><span>${shipLabel(die.sides)}</span></div>
        <div class="die-shape" data-sides="${die.sides}">
          ${icon(displaySymbol)}
          ${roll.value > 0 ? `<b>${roll.value}</b>` : ""}
        </div>
        <div class="die-result">
          <strong>${escapeHtml(label)}</strong>
          ${roll.symbol === "wild" ? `<em data-wild-cycle="${die.id}">TAP TO CHANGE</em>` : ""}
        </div>
        ${faceMapHtml(die, roll.index)}
        ${roll.forged ? `<span class="forged-mark">REWRITTEN</span>` : ""}
      </article>`;
  }).join("");

  dom.messageRibbon.innerHTML = state.messages.map((message) => {
    const type = SYMBOLS[message.type] ? message.type : "tech";
    return `<span style="--message-color:${SYMBOLS[type].color}">${icon(type)}${escapeHtml(message.text)}</span>`;
  }).join("");

  const rerolls = rerollsAvailable(state);
  const freeRerolls = state.freeRerolls || 0;
  const normalLeft = Math.max(0, rerolls - (state.rerollsUsed || 0));
  const totalLeft = normalLeft + freeRerolls;
  const energyHave = state.resources.energy;
  dom.rerollGauge.innerHTML = `
    <div class="reroll-status">
      <small>REROLLS LEFT</small>
      <strong class="${totalLeft > 0 ? "is-live" : "is-empty"}">${totalLeft}</strong>
      ${freeRerolls ? `<em class="free-shape-label">incl. ${freeRerolls} free</em>` : ""}
    </div>
    <div class="reroll-energy-hint">
      ${icon("energy")}
      <span>${totalLeft <= 0
        ? "No rerolls left this round"
        : freeRerolls > 0
          ? "Next reroll is free (no Energy)"
          : `Costs 1 Energy per selected die · you have ${energyHave}`}</span>
    </div>`;

  dom.volleyTotal.textContent = preview.totalAttack;
  const rows = [
    ["Base array", preview.base, false],
    ["Attack faces", preview.attack, false],
    ["Formation", preview.formation, preview.formation > 0],
    ["Wing", preview.wing, preview.wing > 0],
    ["Broadside", preview.broadside, preview.broadside > 0],
    ["Battalion", preview.battalion, preview.battalion > 0],
    ["Spectrum", preview.spectrum, preview.spectrum > 0],
    ["Clean Bay", preview.cleanBay, preview.cleanBay > 0]
  ].filter(([, value, bonus]) => value > 0 || !bonus);
  dom.volleyBreakdown.innerHTML = rows.map(([label, value, bonus]) =>
    `<div class="${bonus ? "bonus-row" : ""}"><dt>${label}</dt><dd>+${value}</dd></div>`
  ).join("");

  const resonances = listResonances(preview);
  const chipHtml = resonances.length
    ? `<div class="resonance-chips">${resonances.map((item) =>
      `<span class="resonance-chip" style="--chip-color:${SYMBOLS[item.type].color}"><b>${escapeHtml(item.label)}</b><small>${escapeHtml(item.detail)}</small></span>`
    ).join("")}</div>`
    : `<div class="resonance-chips is-empty"><span class="resonance-chip is-idle"><b>No resonance</b><small>Line up matches</small></span></div>`;
  let chipsHost = dom.volleyBreakdown.parentElement.querySelector(".resonance-chips");
  if (chipsHost) chipsHost.outerHTML = chipHtml;
  else dom.volleyBreakdown.insertAdjacentHTML("afterend", chipHtml);

  const bankGains = { ...preview.gains };
  Object.entries(preview.resonanceGains || {}).forEach(([key, value]) => {
    bankGains[key] = (bankGains[key] || 0) + value;
  });
  dom.gainPreview.innerHTML = Object.entries(bankGains).map(([symbol, value]) => `
    <span class="gain-chip" style="--gain-color:${SYMBOLS[symbol].color}">${icon(symbol)}<b>+${value}</b><small>${SYMBOLS[symbol].short}</small></span>
  `).join("");

  const selectedCost = state.selected.length;
  const actionsLeft = shapingActionsLeft(state);
  const usingFree = freeRerolls > 0;
  const canAffordEnergy = usingFree || selectedCost <= energyHave;
  if (!selectedCost) {
    dom.rerollCost.textContent = totalLeft <= 0 ? "NO REROLLS LEFT" : "SELECT DICE · 1 ENERGY EACH";
  } else if (usingFree) {
    dom.rerollCost.textContent = `${selectedCost} DICE · FREE`;
  } else if (!canAffordEnergy) {
    dom.rerollCost.textContent = `NEED ${selectedCost} ENERGY · HAVE ${energyHave}`;
  } else {
    dom.rerollCost.textContent = `${selectedCost} DICE · ${selectedCost} ENERGY`;
  }
  dom.rerollButton.disabled = !selectedCost || actionsLeft <= 0 || !canAffordEnergy;
  dom.overclockButton.disabled = state.overclockUsed;
  dom.overclockButton.querySelector("small").textContent = state.overclockUsed ? "SPENT THIS RUN" : "FREE · ONCE";
  dom.commitButton.querySelector("span").textContent = state.round === 10 ? "Fire Apogee strike" : "Bank this volley";
}

function renderWorkshop() {
  const last = state.lastRound;
  dom.lastVolley.innerHTML = `<small>ROUND ${String(last.round).padStart(2, "0")} BANKED</small><strong>+${last.totalAttack} POWER</strong>`;
  dom.trackList.innerHTML = Object.entries(TRACKS).map(([key, track]) => {
    const level = state.tracks[key];
    const cost = level < 5 ? trackCost(state, key) : null;
    return `
      <article class="track-card" style="--track-color:${SYMBOLS[track.color].color}">
        <div class="track-top">
          <div class="track-name">${icon(track.color)}<strong>${track.name}</strong></div>
          <span class="track-level">LV ${level}</span>
        </div>
        <div class="level-pips">${Array.from({ length: 5 }, (_, i) => `<i class="${i < level ? "is-filled" : ""}"></i>`).join("")}</div>
        <p>${track.description}</p>
        <button class="buy-button" data-buy-track="${key}" ${!cost || !canPay(cost) ? "disabled" : ""}>
          <span>${level >= 5 ? "Mastered" : "Advance"}</span><small>${cost ? costLabel(cost) : "MAX"}</small>
        </button>
      </article>`;
  }).join("");

  dom.bayCapacity.textContent = `${state.dice.length} / ${maxDice(state)}`;
  dom.bayList.innerHTML = state.dice.map((die) => {
    const upgrade = upgradeCost(die);
    const forge = forgeCost(state);
    const allForged = die.faces.every((face) => face.forged);
    const nextSize = DIE_SIZES[DIE_SIZES.indexOf(die.sides) + 1];
    return `
      <article class="bay-die" style="--die-color:${die.color};--die-accent:${die.accent}">
        <div class="mini-die" data-sides="${die.sides}"><strong>${die.sides}</strong></div>
        <div class="bay-info">
          <div class="bay-title"><strong>${escapeHtml(die.name)}</strong><span>${shipLabel(die.sides)}</span></div>
          <div class="face-strip" title="Face distribution">${die.faces.map((face) => `<i class="${face.forged ? "is-forged" : ""}" style="--face-color:${SYMBOLS[face.symbol].color}" title="${SYMBOLS[face.symbol].label} ${face.value}"></i>`).join("")}</div>
          <div class="bay-actions">
            <button data-upgrade-die="${die.id}" ${!upgrade || !canPay(upgrade) ? "disabled" : ""}>${upgrade ? `Upsize to ${shipLabel(nextSize)} · ${costLabel(upgrade)}` : "Ship-20 MAX"}</button>
            <button data-forge-die="${die.id}" ${allForged || !canPay(forge) ? "disabled" : ""}>Rewrite face · ${costLabel(forge)}</button>
            <button class="scrap-button" data-scrap-die="${die.id}" ${die.family === "core" ? "disabled" : ""} title="Scrap this ship">×</button>
          </div>
        </div>
      </article>`;
  }).join("");

  dom.marketList.innerHTML = MARKET.map((item) => {
    const sample = state.dice.find((die) => die.family === item.family);
    const familyColor = sample?.color || { assault: "#f25955", reactor: "#43bde4", research: "#92cf56", modifier: "#a86be8" }[item.family];
    const full = state.dice.length >= maxDice(state);
    return `
      <article class="market-card" style="--die-color:${familyColor}">
        <h3>${item.title}</h3>
        <p>${item.detail}</p>
        <button class="buy-button" data-buy-die="${item.family}" ${full || !canPay(item.cost) ? "disabled" : ""}>
          <span>Buy ${shipLabel(4)}</span><small>${costLabel(item.cost)}</small>
        </button>
      </article>`;
  }).join("");

  const tips = {
    1: "Every bank grants +1 Credits salvage. Size upsizes ships; Forge rewrites faces.",
    4: "A larger ship keeps every face you rewrote and adds stronger new faces.",
    7: "Only three rounds remain. Start converting the fleet into attack.",
    9: "Next round is Apogee: leftover resources convert into bonus fleet power."
  };
  dom.workshopTip.textContent = tips[state.round] || "Unspent resources carry forward and discharge at Apogee.";
  dom.nextRoundLabel.textContent = `Launch round ${String(state.round + 1).padStart(2, "0")}`;
}

function applyAction(result, sound = "buy", type = "tech") {
  if (!result?.ok) {
    playSound("error");
    toast(result?.message || "That action is unavailable.", "error");
    return false;
  }
  playSound(sound);
  if (result.message) toast(result.message, type);
  render();
  return true;
}

function showResults() {
  const rank = scoreRank(state.score);
  const final = state.roundHistory.at(-1);
  dom.rankBadge.querySelector("span").textContent = rank.tier;
  dom.resultTitle.textContent = rank.title;
  dom.resultScore.textContent = formatScore(state.score);
  dom.resultStats.innerHTML = [
    ["APOGEE STRIKE", final?.scored || 0],
    ["DICE IN BAY", state.dice.length],
    ["BEST TRACK", Math.max(...Object.values(state.tracks))]
  ].map(([label, value]) => `<div class="result-stat"><small>${label}</small><strong>${value}</strong></div>`).join("");
  dom.resultsModal.showModal();
  playSound("apogee");
  submitScore(state).catch(() => {});
}

function renderForgeOptions() {
  const die = state.dice.find((item) => item.id === forgeTargetId);
  if (!die) return;
  const cost = forgeCost(state);
  const value = 2 + Math.floor(state.tracks.foundry / 2);
  dom.forgeTitle.textContent = `Rewrite ${die.name} ${shipLabel(die.sides)}`;
  dom.forgeOptions.innerHTML = ["attack", "energy", "tech", "forge", "flux"].map((symbol) => `
    <button class="forge-choice" data-forge-symbol="${symbol}" style="--symbol-color:${SYMBOLS[symbol].color}" ${!canPay(cost) ? "disabled" : ""}>
      ${icon(symbol)}<strong>${SYMBOLS[symbol].label} ${value}</strong><small>${costLabel(cost)}</small>
    </button>`).join("");
}

function localScores() {
  try { return JSON.parse(localStorage.getItem(LOCAL_SCORES_KEY)) || []; } catch { return []; }
}

function saveLocalScore(entry) {
  const scores = localScores().filter((score) => score.runId !== entry.runId);
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt));
  localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(scores.slice(0, 10)));
  return scores.slice(0, 10);
}

async function getScores() {
  try {
    const response = await fetch("/api/scores", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Score relay unavailable");
    const body = await response.json();
    return { scores: body.scores || [], mode: "shared" };
  } catch {
    return { scores: localScores(), mode: "local" };
  }
}

async function submitScore(run) {
  const entry = {
    name: run.playerName,
    score: run.score,
    runId: run.runId,
    createdAt: new Date().toISOString(),
    breakdown: {
      apogee: run.roundHistory.at(-1)?.scored || 0,
      dice: run.dice.length,
      bestTrack: Math.max(...Object.values(run.tracks))
    }
  };
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
  if (!dom.scoreboardModal.open) dom.scoreboardModal.showModal();
  dom.resetForm.hidden = true;
  dom.resetToken.value = "";
  dom.scoreList.innerHTML = `<p class="loading-copy">Contacting relay…</p>`;
  const result = await getScores();
  if (!result.scores.length) {
    dom.scoreList.innerHTML = `<div class="empty-scores">No completed runs yet. The first signal can be yours.</div>`;
  } else {
    dom.scoreList.innerHTML = result.scores.map((entry, index) => {
      const date = new Date(entry.createdAt);
      const when = Number.isNaN(date.valueOf()) ? "RECENT SIGNAL" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      return `
        <div class="score-row">
          <b>${String(index + 1).padStart(2, "0")}</b>
          <span class="score-pilot"><strong>${escapeHtml(entry.name)}</strong><small>${when}</small></span>
          <span>${escapeHtml(scoreRank(entry.score).title)}</span>
          <strong>${formatScore(entry.score)}</strong>
        </div>`;
    }).join("");
  }
  dom.scoreNote.textContent = result.mode === "shared"
    ? "Shared relay online. Scores persist until an administrator resets the board."
    : "Local relay mode: scores are saved on this device. Start the included server for a shared board.";
  dom.resetScores.dataset.mode = result.mode;
}

dom.symbolLegend.innerHTML = Object.entries(SYMBOLS).filter(([key]) => key !== "void").map(([key, symbol]) => `
  <div class="legend-row" style="--symbol-color:${symbol.color}">${icon(key)}<span><strong>${symbol.label}</strong> · ${key === "attack" ? "bank power" : key === "energy" ? "fuel rerolls" : key === "tech" ? "buy ships and upgrades" : key === "forge" ? "rewrite faces" : key === "flux" ? "upsize ships" : "choose any"}</span></div>
`).join("");

dom.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = dom.pilotInput.value.trim();
  if (!name) return;
  const saved = readSavedState();
  if (saved && (saved.round > 1 || saved.score > 0) && !window.confirm("Start a new run and replace the active one?")) return;
  localStorage.setItem(PILOT_KEY, name);
  state = createInitialState(name);
  playSound("roll");
  showGame();
  if (!localStorage.getItem(RULES_SEEN_KEY)) {
    localStorage.setItem(RULES_SEEN_KEY, "yes");
    window.setTimeout(() => dom.rulesModal.showModal(), 350);
  }
});

dom.resume.addEventListener("click", () => {
  state = readSavedState();
  playSound("tap");
  showGame();
});

dom.brand.addEventListener("click", () => {
  playSound("tap");
  showLaunch();
});

dom.how.addEventListener("click", () => {
  playSound("tap");
  dom.rulesModal.showModal();
});

dom.scores.addEventListener("click", () => {
  playSound("tap");
  openScores();
});

dom.sound.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, soundEnabled ? "on" : "off");
  dom.sound.style.opacity = soundEnabled ? "1" : ".38";
  if (soundEnabled) playSound("tap");
  toast(`Sound ${soundEnabled ? "online" : "muted"}.`, "energy");
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

[dom.rulesModal, dom.scoreboardModal, dom.forgeModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
});

dom.diceGrid.addEventListener("click", (event) => {
  const wildControl = event.target.closest("[data-wild-cycle]");
  const card = event.target.closest("[data-die-id]");
  if (!card) return;
  if (wildControl) {
    cycleWild(state, card.dataset.dieId);
    playSound("tap");
  } else {
    toggleSelection(state, card.dataset.dieId);
    playSound("tap");
  }
  render();
});

dom.diceGrid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-die-id]");
  if (!card) return;
  event.preventDefault();
  toggleSelection(state, card.dataset.dieId);
  playSound("tap");
  render();
});

dom.rerollButton.addEventListener("click", () => {
  const result = rerollSelected(state);
  if (result.ok) {
    playSound("roll");
    render();
    dom.diceGrid.querySelectorAll(".die-card").forEach((card) => card.classList.add("is-rolling"));
  } else applyAction(result, "error");
});

dom.overclockButton.addEventListener("click", () => {
  const result = overclock(state);
  if (result.ok) {
    playSound("roll");
    render();
    dom.diceGrid.querySelectorAll(".die-card").forEach((card) => card.classList.add("is-rolling"));
  } else applyAction(result, "error");
});

dom.commitButton.addEventListener("click", () => {
  const result = commitRoll(state);
  if (!result.ok) return applyAction(result, "error");
  playSound(state.phase === "complete" ? "apogee" : "attack");
  render();
  if (state.phase === "complete") window.setTimeout(showResults, 480);
  else dom.workshopPhase.scrollIntoView({ behavior: "smooth", block: "start" });
});

dom.trackList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-buy-track]");
  if (!button) return;
  applyAction(buyTrack(state, button.dataset.buyTrack), "buy", TRACKS[button.dataset.buyTrack].color);
});

dom.marketList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-buy-die]");
  if (!button) return;
  applyAction(buyDie(state, button.dataset.buyDie), "buy", button.dataset.buyDie === "assault" ? "attack" : button.dataset.buyDie === "reactor" ? "energy" : button.dataset.buyDie === "research" ? "tech" : "flux");
});

dom.bayList.addEventListener("click", (event) => {
  const upgradeButton = event.target.closest("[data-upgrade-die]");
  const forgeButton = event.target.closest("[data-forge-die]");
  const scrapButton = event.target.closest("[data-scrap-die]");
  if (upgradeButton) applyAction(upgradeDie(state, upgradeButton.dataset.upgradeDie), "buy", "flux");
  if (forgeButton) {
    forgeTargetId = forgeButton.dataset.forgeDie;
    renderForgeOptions();
    playSound("tap");
    dom.forgeModal.showModal();
  }
  if (scrapButton) {
    const die = state.dice.find((item) => item.id === scrapButton.dataset.scrapDie);
    if (die && window.confirm(`Scrap ${die.name} for +1 tech? This cannot be undone.`)) {
      applyAction(scrapDie(state, die.id), "buy", "tech");
    }
  }
});

dom.forgeOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-forge-symbol]");
  if (!button) return;
  const result = forgeFace(state, forgeTargetId, button.dataset.forgeSymbol);
  if (result.ok) dom.forgeModal.close();
  applyAction(result, "buy", button.dataset.forgeSymbol);
});

dom.nextRound.addEventListener("click", () => {
  const result = nextRound(state);
  if (!result.ok) return applyAction(result, "error");
  playSound("roll");
  render();
  dom.rollPhase.scrollIntoView({ behavior: "smooth", block: "start" });
  dom.diceGrid.querySelectorAll(".die-card").forEach((card) => card.classList.add("is-rolling"));
});

dom.resultScores.addEventListener("click", () => {
  dom.resultsModal.close();
  openScores();
});

dom.newRun.addEventListener("click", () => {
  dom.resultsModal.close();
  state = null;
  showLaunch();
  dom.pilotInput.focus();
});

dom.resetScores.addEventListener("click", () => {
  const mode = dom.resetScores.dataset.mode;
  if (mode === "local") {
    if (!window.confirm("Reset all scores saved on this device?")) return;
    localStorage.removeItem(LOCAL_SCORES_KEY);
    toast("Local scoreboard reset.", "forge");
    openScores();
    return;
  }
  dom.resetForm.hidden = false;
  dom.resetToken.focus();
});

dom.cancelReset.addEventListener("click", () => {
  dom.resetForm.hidden = true;
  dom.resetToken.value = "";
});

dom.resetForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = dom.resetToken.value;
  if (!token) return;
  try {
    const response = await fetch("/api/scores", { method: "DELETE", headers: { "x-admin-token": token } });
    if (response.status === 403) throw new Error("That administrator token was not accepted.");
    if (!response.ok) throw new Error("The score relay could not be reset.");
    toast("Shared scoreboard reset.", "forge");
    openScores();
  } catch (error) {
    playSound("error");
    toast(error.message, "error");
  }
});

dom.sound.style.opacity = soundEnabled ? "1" : ".38";
dom.pilotInput.value = localStorage.getItem(PILOT_KEY) || "";
updateResume();
