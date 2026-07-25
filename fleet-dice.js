// Fleet Dice — playable 1v1 prototype (you vs. an admiral bot).
// The rules all live in fleet-engine.js; this file is presentation and flow.

import {
  ECONOMY, FAMILIES, PROTOCOLS, PROTOCOL_SLOTS, SYMBOLS,
  assignStress, buyCost, createLoadout, createShip, deployUpkeep,
  findFormations, makeRng, protocolsForSlot, resolveFleetIntent, resolveVolley,
  repairFromSurplus, rollFleet, rerollDice, roundIncome, scoreRound, shipFaces,
  sizeUpCost, structureOf
} from "./fleet-engine.js";

const ROUNDS = 8;
const $ = (sel) => document.querySelector(sel);
let S = null;
let uid = 0;

// ── setup ──────────────────────────────────────────────────────────────────

function newSide(isBot) {
  return {
    isBot,
    ships: [
      createShip(`${isBot ? "e" : "p"}${uid++}`, "interceptor", 4),
      createShip(`${isBot ? "e" : "p"}${uid++}`, "lancer", 4),
      createShip(`${isBot ? "e" : "p"}${uid++}`, "reactor", 4)
    ],
    bank: ECONOMY.startingBank,
    loadout: createLoadout(isBot ? "resonance" : "resonance", isBot ? "broadside" : "broadside", "focusedArray"),
    score: 0,
    dice: [],
    rerollsUsed: 0,
    bonusRerolls: 0
  };
}

function newGame() {
  uid = 0;
  S = {
    round: 1,
    phase: "yard",
    seed: (Date.now() ^ (Math.random() * 1e9)) >>> 0,
    you: newSide(false),
    foe: newSide(true),
    selected: new Set(),
    report: null,
    toast: null
  };
  S.rng = makeRng(S.seed);
  botYard(S.foe);
  render();
}

// ── flow ───────────────────────────────────────────────────────────────────

function beginRoll() {
  const y = S.you;
  y.dice = rollFleet(y.ships, S.rng);
  y.rerollsUsed = 0;
  S.selected.clear();
  S.phase = "roll";
  render();
}

function doReroll() {
  const y = S.you;
  const ids = [...S.selected];
  if (!ids.length) return toast("Tap ships to select them first");
  const free = ECONOMY.freeRerolls + y.bonusRerolls;
  const paid = y.rerollsUsed >= free;
  if (paid && y.bank < ECONOMY.rerollCost) return toast("Not enough Energy to reroll");
  if (paid) y.bank -= ECONOMY.rerollCost;
  y.rerollsUsed++;
  y.dice = rerollDice(y.ships, y.dice, ids, S.rng);
  S.selected.clear();
  render();
}

function submit() {
  const y = S.you, f = S.foe;

  f.dice = rollFleet(f.ships, S.rng);
  botShape(f);

  const yF = findFormations(y.dice);
  const fF = findFormations(f.dice);
  const yI = resolveFleetIntent(y.dice, yF, y.loadout, autoWilds(y.dice, yF));
  const fI = resolveFleetIntent(f.dice, fF, f.loadout, autoWilds(f.dice, fF));
  const v = resolveVolley(yI, fI);

  const foeHits = assignStress(f.ships, v.a.damage, f.ships.map((s) => s.id));
  const youHits = assignStress(y.ships, v.b.damage, y.ships.map((s) => s.id));

  applyStrike(v.a.strike, f, y);
  applyStrike(v.b.strike, y, f);

  const yHealed = repairFromSurplus(y.ships, v.a.surplus);
  repairFromSurplus(f.ships, v.b.surplus);

  const yScore = scoreRound({ damage: v.a.damage, prevented: v.a.prevented, formations: yF, strike: v.a.strike, surplus: v.a.surplus });
  const fScore = scoreRound({ damage: v.b.damage, prevented: v.b.prevented, formations: fF, strike: v.b.strike, surplus: v.b.surplus });
  y.score += yScore; f.score += fScore;

  y.bank += roundIncome(y.ships, yI.energy) + v.a.surplusEnergy;
  f.bank += roundIncome(f.ships, fI.energy) + v.b.surplusEnergy;
  y.bonusRerolls = yI.freeRerollsNext || 0;
  f.bonusRerolls = fI.freeRerollsNext || 0;

  S.report = {
    yI, fI, v, yF, fF, yScore, fScore,
    foeHits: foeHits.log, youHits: youHits.log, yHealed,
    notes: [...yI.notes]
  };
  S.phase = "report";
  render();
}

function applyStrike(strike, target, attacker) {
  if (!strike || strike.cancelled) return;
  const alive = target.ships.filter((s) => !s.disabled);
  if (!alive.length) return;
  const victim = alive.reduce((a, b) => (b.size > a.size ? b : a));
  if (strike.mode === "scar") {
    const keys = Object.keys(victim.overrides);
    if (keys.length) delete victim.overrides[keys[keys.length - 1]];
    else if (victim.ramped.length) victim.ramped.pop();
    strike.victimName = shipName(victim);
  } else if (strike.mode === "stun") {
    victim.disabled = true;
    victim.stunned = true;
    strike.victimName = shipName(victim);
  } else if (strike.mode === "breach") {
    strike.victimName = shipName(victim);
    target.ships = target.ships.filter((s) => s.id !== victim.id);
  }
}

function nextRound() {
  for (const side of [S.you, S.foe]) {
    for (const s of side.ships) {
      if (s.disabled) { s.disabled = false; s.stunned = false; s.stress = 0; }
    }
  }
  if (S.round >= ROUNDS) { S.phase = "over"; return render(); }
  S.round++;
  S.phase = "yard";
  botYard(S.foe);
  S.report = null;
  render();
}

// ── wilds ──────────────────────────────────────────────────────────────────
// Assign each Wild to whichever symbol its fleet already leans toward.

function autoWilds(dice, formations) {
  const inForm = new Map();
  for (const f of formations) {
    if (f.type === "battery") for (const m of f.members) inForm.set(m, f.symbol);
  }
  const tally = { laser: 0, missile: 0, shield: 0, flak: 0 };
  for (const d of dice) if (tally[d.symbol] !== undefined) tally[d.symbol] += d.n;
  const lean = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
  const out = {};
  dice.forEach((d, i) => { if (d.symbol === "wild") out[i] = inForm.get(i) || lean; });
  return out;
}

// ── bot ────────────────────────────────────────────────────────────────────

function botYard(side) {
  let guard = 0;
  while (guard++ < 12) {
    const biggest = side.ships.reduce((a, b) => (b.size > a.size ? b : a));
    const up = sizeUpCost(biggest);
    const blanks = side.ships.filter((s) => Object.keys(s.overrides).length < 2);
    if (side.ships.length < 6 && side.bank >= buyCost(side.ships.length)) {
      side.bank -= buyCost(side.ships.length);
      const fams = ["interceptor", "lancer", "bulwark", "reactor"];
      side.ships.push(createShip(`e${uid++}`, fams[side.ships.length % 4], 4));
      continue;
    }
    if (up && side.bank >= up.cost && S.round >= 3) { side.bank -= up.cost; biggest.size = up.next; continue; }
    if (blanks.length && side.bank >= ECONOMY.resymbolCost) {
      const t = blanks[0];
      const n = t.size >= 4 ? (Object.keys(t.overrides).length === 0 ? 2 : 4) : 2;
      t.overrides[n] = "laser";
      side.bank -= ECONOMY.resymbolCost;
      continue;
    }
    break;
  }
}

function botShape(side) {
  const free = ECONOMY.freeRerolls;
  for (let i = 0; i < free; i++) {
    const weak = side.dice
      .map((d, ix) => ({ d, ix }))
      .filter(({ d }) => d.n > 1 && d.n <= Math.ceil(d.size / 2))
      .map(({ d }) => d.shipId);
    if (!weak.length) break;
    side.dice = rerollDice(side.ships, side.dice, weak, S.rng);
  }
}

// ── rendering ──────────────────────────────────────────────────────────────

function shipName(s) {
  return `${FAMILIES[s.family].label} d${s.size}`;
}

function dieSvg(size, n, symbol, big = 1) {
  const w = 54 * big, h = 50 * big;
  const col = SYMBOLS[symbol]?.color || "#8b9bbd";
  const shapes = {
    4:  `<polygon points="27,4 50,44 4,44"/>`,
    6:  `<rect x="7" y="7" width="40" height="38" rx="7"/>`,
    8:  `<polygon points="27,3 49,25 27,47 5,25"/>`,
    10: `<polygon points="27,2 48,18 41,45 13,45 6,18"/>`
  };
  return `<svg class="die" width="${w}" height="${h}" viewBox="0 0 54 50" aria-hidden="true">
    <g fill="${col}22" stroke="${col}" stroke-width="1.6" stroke-linejoin="round">${shapes[size]}</g>
    <text x="27" y="30" text-anchor="middle" font-size="20" font-weight="700"
      fill="${col}" style="font-variant-numeric:tabular-nums">${n ?? ""}</text>
  </svg>`;
}

function stripHtml(ship, rolled) {
  return shipFaces(ship).map((f) => {
    const col = SYMBOLS[f.symbol].color;
    return `<span class="pip ${rolled === f.n ? "on" : ""} ${f.upgraded ? "up" : ""}"
      style="color:${col};border-color:${col}55">${f.n}${f.energy ? `<i class="e"></i>` : ""}</span>`;
  }).join("");
}

function shipCard(ship, rolled, interactive) {
  const sel = S.selected.has(ship.id) ? "sel" : "";
  const dead = ship.disabled ? "dead" : "";
  const pct = Math.min(100, (ship.stress / structureOf(ship)) * 100);
  return `<div class="ship ${sel} ${dead}" data-ship="${ship.id}" ${interactive ? "" : 'data-static="1"'}>
    <div class="top"><span>d${ship.size}</span><span style="color:${FAMILIES[ship.family].color}">${FAMILIES[ship.family].label.slice(0, 4)}</span></div>
    ${dieSvg(ship.size, ship.disabled ? "—" : (rolled?.n ?? "?"), rolled?.symbol || "wild")}
    <div class="strip">${stripHtml(ship, rolled?.n)}</div>
    <div class="stress-bar"><i style="width:${pct}%"></i></div>
  </div>`;
}

function formationHtml(f) {
  if (f.type === "triad") {
    return `<div class="form"><span class="tag">${f.size >= 4 ? "Quad" : "Triad"}</span>
      <span class="txt"><b>${f.size} × ${f.number}</b><small>fires your Set protocol — ${PROTOCOLS[S.you.loadout.set.id].name}</small></span></div>`;
  }
  if (f.type === "run") {
    return `<div class="form run"><span class="tag">Run ${f.size}</span>
      <span class="txt"><b>${f.start}–${f.top} · yield ${f.yield}</b><small>Tier ${"I".repeat(f.tier).replace("IIII", "IV")} — ${PROTOCOLS[S.you.loadout.run.id].name}</small></span></div>`;
  }
  return `<div class="form battery"><span class="tag">Battery</span>
    <span class="txt"><b>${f.size} × ${SYMBOLS[f.symbol].label}</b><small>${PROTOCOLS[S.you.loadout.battery.id].name}</small></span></div>`;
}

function totalsHtml(t) {
  return `<div class="totals">
    ${["laser", "missile", "shield", "flak"].map((k) =>
      `<div class="tot"><div class="n" style="color:${SYMBOLS[k].color}">${t[k]}</div><div class="l">${SYMBOLS[k].label}</div></div>`).join("")}
  </div>`;
}

// ── screens ────────────────────────────────────────────────────────────────

function yardScreen() {
  const y = S.you;
  const canBuy = y.ships.length < ECONOMY.maxShips && y.bank >= buyCost(y.ships.length);
  const upkeep = deployUpkeep(y.ships.length);

  const buys = Object.entries(FAMILIES).map(([id, f]) =>
    `<div class="opt"><div class="info"><b style="color:${f.color}">${f.label}</b>
      <small>attacks with ${SYMBOLS[f.attack].label}, holds with ${SYMBOLS[f.defense].label}${f.rampBonus ? ", extended Energy ramp" : ""}</small></div>
      <button data-buy="${id}" ${canBuy ? "" : "disabled"}>${buyCost(y.ships.length)}⚡</button></div>`).join("");

  const upgrades = y.ships.map((s) => {
    const up = sizeUpCost(s);
    return `<div class="opt"><div class="info"><b>${shipName(s)}</b>
      <small>${Object.keys(s.overrides).length} face${Object.keys(s.overrides).length === 1 ? "" : "s"} re-symboled · structure ${structureOf(s)}</small></div>
      <div class="row">
        <button data-sym="${s.id}" ${y.bank >= ECONOMY.resymbolCost ? "" : "disabled"}>Face ${ECONOMY.resymbolCost}⚡</button>
        ${up ? `<button data-up="${s.id}" ${y.bank >= up.cost ? "" : "disabled"}>d${up.next} ${up.cost}⚡</button>` : ""}
      </div></div>`;
  }).join("");

  const protos = PROTOCOL_SLOTS.map((slot) => {
    const cur = y.loadout[slot];
    const cost = ECONOMY.protocolLevelCost[cur.level + 1];
    const cards = protocolsForSlot(slot).map((id) => {
      const p = PROTOCOLS[id];
      const on = cur.id === id;
      return `<div class="proto ${on ? "on" : ""}" data-proto="${slot}:${id}">
        <div class="ph"><b>${p.name}</b><span>${on ? `Level ${cur.level}` : "select"}</span></div>
        <ol>${p.levels.map((t, i) =>
          `<li class="${on && i < cur.level ? "have" : (on && i === cur.level ? "next" : "")}">${t}</li>`).join("")}</ol>
      </div>`;
    }).join("");
    return `<div class="card"><h3>${slot} slot</h3>
      <p>Fires when you roll a ${slot === "set" ? "Triad" : slot === "run" ? "Run" : "Battery"}.</p>
      <div class="protos">${cards}</div>
      ${cur.level < 3 ? `<div class="row" style="margin-top:9px"><button class="gold" data-lvl="${slot}" ${y.bank >= cost ? "" : "disabled"}>Level ${cur.level + 1} — ${cost}⚡</button></div>` : ""}
    </div>`;
  }).join("");

  return `
    <div class="sec"><div class="sec-head">Your fleet <b>${y.ships.length}/${ECONOMY.maxShips} bays${upkeep ? ` · ${upkeep}⚡ upkeep` : ""}</b></div>
      <div class="fleet">${y.ships.map((s) => shipCard(s, null, false)).join("")}</div></div>
    <div class="card"><h3>Commission a hull</h3><p>Every ship starts as a d4. Numbers are geometry — only Size Up raises them.</p>${buys}</div>
    <div class="card"><h3>Refit</h3><p>Re-symboling turns any face into any weapon or defense. Upgrades survive Size Up.</p>${upgrades}</div>
    ${protos}
    <div class="hint">Enemy fleet: ${S.foe.ships.length} ships, largest d${Math.max(...S.foe.ships.map((s) => s.size))}.</div>`;
}

function rollScreen() {
  const y = S.you;
  const forms = findFormations(y.dice);
  const intent = resolveFleetIntent(y.dice, forms, y.loadout, autoWilds(y.dice, forms));
  const byShip = new Map(y.dice.map((d) => [d.shipId, d]));
  const free = ECONOMY.freeRerolls + y.bonusRerolls;
  const left = Math.max(0, free - y.rerollsUsed);

  return `
    <div class="sec"><div class="sec-head">Roll <b>${left ? `${left} free reroll${left === 1 ? "" : "s"} left` : `next reroll costs ${ECONOMY.rerollCost}⚡`}</b></div>
      <div class="fleet">${y.ships.map((s) => shipCard(s, byShip.get(s.id), true)).join("")}</div>
      <div class="hint">Tap ships to select, then Reroll. Gold corner = a face you upgraded. Purple dot = Energy.</div></div>
    <div class="sec"><div class="sec-head">Formations <b>${forms.length} of a possible ${Math.floor(y.dice.length / 3)}</b></div>
      <div class="forms">${forms.length ? forms.map(formationHtml).join("") : `<div class="empty">No Formation yet — you need three of a number, three in a row, or three of a symbol.</div>`}</div></div>
    <div class="sec"><div class="sec-head">Locked totals</div>${totalsHtml(intent.totals)}</div>
    ${intent.notes.length ? `<div class="card"><h3>Protocols firing</h3><div class="log">${intent.notes.map((n) => `<div>${n}</div>`).join("")}</div></div>` : ""}
    <div class="row"><button class="ghost" id="reroll">Reroll selected${left ? "" : ` (${ECONOMY.rerollCost}⚡)`}</button></div>`;
}

function reportScreen() {
  const r = S.report;
  const strikeLine = (s, who) => {
    if (!s) return "";
    if (s.cancelled) return `<div><b>${who}</b> armed a ${s.mode.toUpperCase()} — <b style="color:var(--flak)">cancelled by Kill Net</b></div>`;
    return `<div><b style="color:var(--laser)">${s.mode.toUpperCase()}</b> — ${who} hit ${s.victimName || "a ship"}</div>`;
  };
  return `
    <div class="vs">
      <div class="side you"><h4>You</h4><div class="big">${r.v.a.damage}</div><div class="lbl">damage dealt</div></div>
      <div class="mid">VS</div>
      <div class="side"><h4>Admiral</h4><div class="big">${r.v.b.damage}</div><div class="lbl">damage taken</div></div>
    </div>
    <div class="card"><h3>Your volley</h3>${totalsHtml(r.yI.totals)}</div>
    <div class="card"><h3>Enemy volley</h3>${totalsHtml(r.fI.totals)}</div>
    <div class="card"><h3>What happened</h3><div class="log">
      ${r.yF.length ? `<div>You formed <b>${r.yF.length}</b> Formation${r.yF.length === 1 ? "" : "s"}${r.yF.map((f) => f.type === "run" ? ` · Run ${f.size} (yield ${f.yield})` : f.type === "triad" ? ` · ${f.size}×${f.number}` : ` · ${SYMBOLS[f.symbol].label} battery`).join("")}</div>` : `<div>You formed nothing this round.</div>`}
      ${r.notes.map((n) => `<div>${n}</div>`).join("")}
      ${strikeLine(r.v.a.strike, "You")}
      ${strikeLine(r.v.b.strike, "The Admiral")}
      <div>Stress landed on <b>${r.foeHits.length}</b> enemy ship${r.foeHits.length === 1 ? "" : "s"}, <b>${r.youHits.length}</b> of yours.</div>
      <div>You blocked <b>${r.v.a.prevented}</b> incoming. Surplus defense refunded <b>${r.v.a.surplusEnergy}⚡</b>${r.yHealed.length ? ` and repaired <b>${r.yHealed.reduce((a, h) => a + h.healed, 0)}</b> Stress` : ""}.</div>
      <div>Round score — you <b>${r.yScore}</b>, admiral <b>${r.fScore}</b>.</div>
    </div></div>`;
}

function overScreen() {
  const y = S.you, f = S.foe;
  const won = y.score > f.score;
  return `<div class="card center">
    <h3>${won ? "Fleet victorious" : y.score === f.score ? "Stalemate" : "Fleet outfought"}</h3>
    <div style="font-size:44px;font-weight:700;margin:8px 0">${y.score} – ${f.score}</div>
    <p>${y.ships.length} ships standing, largest d${Math.max(...y.ships.map((s) => s.size), 0)}.</p>
    <button class="primary" id="again">New match</button></div>`;
}

// ── shell ──────────────────────────────────────────────────────────────────

function dock() {
  const y = S.you;
  const label = { yard: "Roll fleet", roll: "Submit orders", report: "Next round", over: "" }[S.phase];
  const free = Math.max(0, ECONOMY.freeRerolls + y.bonusRerolls - y.rerollsUsed);
  return `<div class="dock"><div class="dock-in">
    <div class="meter">
      <div><div class="n nrg">${y.bank}</div><div class="l">Energy</div></div>
      <div><div class="n">${y.ships.length}</div><div class="l">Ships</div></div>
      ${S.phase === "roll" ? `<div><div class="n">${free}</div><div class="l">Free rerolls</div></div>` : ""}
      <div><div class="n">${y.score}</div><div class="l">Score</div></div>
    </div>
    ${S.phase === "over" ? "" : `<button class="primary" id="advance">${label}</button>`}
  </div></div>`;
}

function render() {
  const body = { yard: yardScreen, roll: rollScreen, report: reportScreen, over: overScreen }[S.phase]();
  $("#app").innerHTML = `
    <div class="wrap">
      <header><h1>Fleet Dice</h1><span class="round-pill">${S.phase === "over" ? "Complete" : `Round ${S.round} / ${ROUNDS}`}</span></header>
      <div class="scoreline">
        <div><div class="who">You</div><div class="val">${S.you.score}</div></div>
        <div class="mid">SCORE</div>
        <div class="right"><div class="who">Admiral</div><div class="val">${S.foe.score}</div></div>
      </div>
      ${body}
    </div>
    ${dock()}`;
  wire();
}

function wire() {
  const adv = $("#advance");
  if (adv) adv.onclick = () => {
    if (S.phase === "yard") beginRoll();
    else if (S.phase === "roll") submit();
    else if (S.phase === "report") nextRound();
  };
  const rr = $("#reroll"); if (rr) rr.onclick = doReroll;
  const ag = $("#again"); if (ag) ag.onclick = newGame;

  document.querySelectorAll("[data-ship]").forEach((el) => {
    if (el.dataset.static) return;
    el.onclick = () => {
      const id = el.dataset.ship;
      S.selected.has(id) ? S.selected.delete(id) : S.selected.add(id);
      render();
    };
  });

  document.querySelectorAll("[data-buy]").forEach((el) => el.onclick = () => {
    const y = S.you, cost = buyCost(y.ships.length);
    if (y.bank < cost || y.ships.length >= ECONOMY.maxShips) return;
    y.bank -= cost;
    y.ships.push(createShip(`p${uid++}`, el.dataset.buy, 4));
    toast(`${FAMILIES[el.dataset.buy].label} commissioned`);
    render();
  });

  document.querySelectorAll("[data-up]").forEach((el) => el.onclick = () => {
    const y = S.you, s = y.ships.find((x) => x.id === el.dataset.up);
    const up = sizeUpCost(s);
    if (!up || y.bank < up.cost) return;
    y.bank -= up.cost; s.size = up.next;
    toast(`Expanded to d${up.next} — upgrades kept`);
    render();
  });

  document.querySelectorAll("[data-sym]").forEach((el) => el.onclick = () => {
    const y = S.you, s = y.ships.find((x) => x.id === el.dataset.sym);
    if (y.bank < ECONOMY.resymbolCost) return;
    openRefit(s);
  });

  document.querySelectorAll("[data-proto]").forEach((el) => el.onclick = () => {
    const [slot, id] = el.dataset.proto.split(":");
    if (S.you.loadout[slot].id === id) return;
    S.you.loadout[slot] = { id, level: 1 };
    toast(`${PROTOCOLS[id].name} installed`);
    render();
  });

  document.querySelectorAll("[data-lvl]").forEach((el) => el.onclick = () => {
    const slot = el.dataset.lvl, cur = S.you.loadout[slot];
    const cost = ECONOMY.protocolLevelCost[cur.level + 1];
    if (S.you.bank < cost || cur.level >= 3) return;
    S.you.bank -= cost; cur.level++;
    toast(`${PROTOCOLS[cur.id].name} → Level ${cur.level}`);
    render();
  });
}

function openRefit(ship) {
  const faces = shipFaces(ship);
  const pick = window.prompt(
    `Refit ${shipName(ship)} — ${ECONOMY.resymbolCost}⚡\n\n` +
    faces.map((f) => `  ${f.n}: ${SYMBOLS[f.symbol].label}${f.energy ? ` (+${f.energy}⚡)` : ""}`).join("\n") +
    `\n\nEnter "face symbol", e.g.  4 laser\nSymbols: laser, missile, shield, flak`);
  if (!pick) return;
  const [nRaw, symRaw] = pick.trim().split(/\s+/);
  const n = Number(nRaw), sym = (symRaw || "").toLowerCase();
  if (!(n >= 1 && n <= ship.size) || !["laser", "missile", "shield", "flak"].includes(sym)) {
    return toast("Didn't catch that — try  4 laser");
  }
  S.you.bank -= ECONOMY.resymbolCost;
  ship.overrides[n] = sym;
  toast(`Face ${n} is now ${SYMBOLS[sym].label}`);
  render();
}

function toast(msg) {
  const old = document.querySelector(".toast"); if (old) old.remove();
  const el = document.createElement("div");
  el.className = "toast"; el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

function stars() {
  const c = document.createElement("canvas");
  c.className = "stars";
  const fit = () => { c.width = innerWidth; c.height = innerHeight; draw(); };
  const pts = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + .2 }));
  const draw = () => {
    const g = c.getContext("2d");
    g.clearRect(0, 0, c.width, c.height);
    for (const p of pts) {
      g.globalAlpha = .25 + p.r * .4;
      g.fillStyle = "#cfe0ff";
      g.beginPath(); g.arc(p.x * c.width, p.y * c.height, p.r, 0, 7); g.fill();
    }
  };
  document.body.appendChild(c);
  addEventListener("resize", fit); fit();
}

stars();
newGame();
