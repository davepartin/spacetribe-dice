"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { SiteHeader } from "./Brand";
import { InvitePanel } from "./InvitePanel";
import {
  activeShips,
  flagshipUpgradeCost,
  opponentOf,
  previewTally,
  priceOf,
  slotPrice,
  straightOptions,
  type DieSize,
  type DieValue,
  type MatchAction,
  type PlayerState,
  type RoundReport,
} from "@/lib/game";
import {
  cancelLiveMatch,
  playLiveAction,
  watchLiveMatch,
  type LiveMatch,
} from "@/lib/firebase-match";
import { FlagHull, ShipHull, flagFaceLabel } from "./DieArt";

function friendlyFirebaseError(reason: unknown): string {
  const message = reason instanceof Error ? reason.message : String(reason || "The match did not load.");
  if (/Missing or insufficient permissions|permission-denied/i.test(message)) {
    return "Firebase blocked that match action. If you were joining, the room rules needed an update — try again after rules deploy.";
  }
  if (/Open the invite link/i.test(message)) {
    return message;
  }
  return message;
}

export function MatchGame() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const matchId = searchParams.get("id")?.trim() || "";
  const [match, setMatch] = useState<LiveMatch | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    let stopped = false;
    let unsubscribe: (() => void) | undefined;

    if (!matchId) {
      setError("This match link is missing its room id.");
      return;
    }

    const stuckTimer = window.setTimeout(() => {
      if (!stopped) {
        setError((current) =>
          current ||
            "Still opening the battlefield. Check your connection, then return home and create or join the room again.",
        );
      }
    }, 15000);

    watchLiveMatch(
      matchId,
      (next) => {
        if (!stopped) {
          window.clearTimeout(stuckTimer);
          setMatch(next);
          setError("");
        }
      },
      (reason) => {
        if (!stopped) {
          window.clearTimeout(stuckTimer);
          setError(friendlyFirebaseError(reason));
        }
      },
    ).then((stop) => {
      if (stopped) stop();
      else unsubscribe = stop;
    }).catch((reason) => {
      if (!stopped) {
        window.clearTimeout(stuckTimer);
        setError(friendlyFirebaseError(reason));
      }
    });
    return () => {
      stopped = true;
      window.clearTimeout(stuckTimer);
      unsubscribe?.();
    };
  }, [matchId]);

  async function play(action: MatchAction) {
    if (!match || busy) return;
    setBusy(true);
    setError("");
    try {
      const next = await playLiveAction(match.id, action);
      setMatch(next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "That order did not go through.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmAndCancel() {
    if (!match || busy) return;
    setBusy(true);
    setError("");
    try {
      await cancelLiveMatch(match.id);
      setConfirmCancel(false);
      router.push("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The match could not be cancelled.");
      setBusy(false);
      setConfirmCancel(false);
    }
  }

  if (!match) {
    return (
      <main className="page-shell">
        <SiteHeader />
        <section className="loading-card">
          <div className="loader" />
          <h1>Opening battlefield…</h1>
          {error ? <p className="form-error">{error}</p> : <p>Contacting your fleet.</p>}
          {error ? <Link className="action-button outline-action" href="/">Return home</Link> : null}
        </section>
      </main>
    );
  }

  const you = match.state.players[match.side]!;
  const enemy = match.state.players[opponentOf(match.side)];
  const cancelled = match.state.status === "finished" && Boolean(match.state.cancelledBy);

  return (
    <main className="match-shell">
      <SiteHeader code={match.state.code} round={match.state.round} />
      {cancelled ? (
        <section className="waiting-card">
          <p className="eyebrow">MATCH CANCELLED</p>
          <h1>{match.state.cancelledBy} ended this game.</h1>
          <p>The room is closed. Start a new match whenever you’re ready.</p>
          <div className="end-actions">
            <Link className="action-button light-action" href="/">Return home</Link>
            <Link className="action-button red-action" href="/versus">New match</Link>
          </div>
        </section>
      ) : match.state.status === "waiting" ? (
        <InvitePanel
          busy={busy}
          code={match.state.code}
          matchId={match.id}
          onCancel={() => setConfirmCancel(true)}
        />
      ) : enemy ? (
        <>
          <HealthBoard enemy={enemy} you={you} />
          <TurnBanner enemy={enemy} you={you} />
          {error ? <p className="match-error">{error}</p> : null}
          <MatchStage
            busy={busy}
            enemy={enemy}
            match={match}
            play={play}
            you={you}
          />
          {match.state.status === "active" ? (
            <div className="cancel-row">
              <button
                className="action-button outline-action"
                disabled={busy}
                onClick={() => setConfirmCancel(true)}
                type="button"
              >
                Cancel game
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {confirmCancel ? (
        <div
          className="confirm-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-title"
        >
          <div className="confirm-card">
            <p className="eyebrow">LEAVE THE FIELD</p>
            <h2 id="cancel-title">Cancel this game?</h2>
            <p>This ends the match for both commanders and removes it from the live board.</p>
            {error ? <p className="form-error">{error}</p> : null}
            <div className="confirm-actions">
              <button
                className="action-button red-action"
                disabled={busy}
                onClick={confirmAndCancel}
                type="button"
              >
                {busy ? "Cancelling…" : "Yes, cancel game"}
              </button>
              <button
                className="action-button outline-action"
                disabled={busy}
                onClick={() => setConfirmCancel(false)}
                type="button"
              >
                Keep playing
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function HealthBoard({ you, enemy }: { you: PlayerState; enemy: PlayerState }) {
  return (
    <section className="health-board">
      <div className="health-side your-health">
        <span>YOU · {you.name}</span>
        <strong>{you.hp}</strong>
      </div>
      <div className="health-title">FLAGSHIP<br />HEALTH</div>
      <div className="health-side enemy-health">
        <span>ENEMY · {enemy.name}</span>
        <strong>{enemy.hp}</strong>
      </div>
    </section>
  );
}

function TurnBanner({ you, enemy }: { you: PlayerState; enemy: PlayerState }) {
  const own = phaseText(you);
  const their = phaseText(enemy);
  return (
    <section className="turn-banner">
      <div>
        <span>YOUR ORDER</span>
        <strong>{own}</strong>
      </div>
      <div className="enemy-order">
        <span>ENEMY STATUS</span>
        <strong>{their}</strong>
      </div>
    </section>
  );
}

function MatchStage({
  match,
  you,
  enemy,
  play,
  busy,
}: {
  match: LiveMatch;
  you: PlayerState;
  enemy: PlayerState;
  play: (action: MatchAction) => Promise<void>;
  busy: boolean;
}) {
  if (you.phase === "shop") {
    return <Shipyard busy={busy} play={play} round={match.state.round} you={you} />;
  }
  if (you.phase === "ready" || you.phase === "rolling") {
    return <RollFleet busy={busy} play={play} round={match.state.round} you={you} />;
  }
  if (you.phase === "brace") {
    return <BraceFleet busy={busy} play={play} round={match.state.round} you={you} />;
  }
  if (you.phase === "report" || you.phase === "over") {
    return (
      <RoundResult
        busy={busy}
        enemy={enemy}
        match={match}
        play={play}
        you={you}
      />
    );
  }
  return (
    <section className="waiting-card">
      <div className="loader" />
      <p className="eyebrow">ORDER LOCKED</p>
      <h1>Waiting for {enemy.name}.</h1>
      <p>Your dice stay hidden until both fleets submit.</p>
    </section>
  );
}

function Shipyard({
  you,
  round,
  play,
  busy,
}: {
  you: PlayerState;
  round: number;
  play: (action: MatchAction) => Promise<void>;
  busy: boolean;
}) {
  const nextSlot = you.slots + 1;
  const flagCost = flagshipUpgradeCost(you.flag.level);
  return (
    <section className="stage">
      <div className="stage-heading">
        <div>
          <p className="eyebrow">BETWEEN ROUNDS</p>
          <h1>Upgrade your fleet.</h1>
        </div>
        <EnergyBank value={you.energy} />
      </div>
      <nav className="jump-nav" aria-label="Upgrade sections">
        <a href="#fleet-upgrades">Fleet</a>
        <a href="#buy-ships">Buy ships</a>
        <a href="#open-slots">Slots</a>
        <a href="#flagship-upgrade">Flagship</a>
      </nav>

      <section className="upgrade-section" id="fleet-upgrades">
        <div className="section-heading">
          <h2>Upgrade or scrap ships</h2>
          <span>{you.ships.length} / {you.slots} slots</span>
        </div>
        <div className="ship-grid">
          {you.ships.map((ship, index) => {
            const next = ship.sides === 4 ? 6 : ship.sides === 6 ? 8 : ship.sides === 8 ? 10 : null;
            const cost = next ? priceOf(next as DieSize) - priceOf(ship.sides) : null;
            const damaged = ship.disabledRound === round;
            return (
              <article className={`ship-card die-size-${ship.sides} ${damaged ? "damaged" : ""}`} key={ship.id}>
                <span className="slot-label">SLOT {index + 1}</span>
                <ShipHull ready sides={ship.sides} value={0} />
                <strong>d{ship.sides}</strong>
                {damaged ? <small>DAMAGED THIS ROUND</small> : null}
                <button
                  className="ship-upgrade"
                  disabled={busy || damaged || !next || (cost ?? 0) > you.energy}
                  onClick={() => play({ type: "shop", operation: "upgrade", shipId: ship.id })}
                >
                  {next ? `Upgrade to d${next} · ${cost}⚡` : "Max d10"}
                </button>
                <button
                  className="ship-scrap"
                  disabled={busy || damaged}
                  onClick={() => play({ type: "shop", operation: "scrap", shipId: ship.id })}
                >
                  Scrap · +{Math.floor(priceOf(ship.sides) / 2)}⚡
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="upgrade-section" id="buy-ships">
        <div className="section-heading">
          <h2>Buy a ship</h2>
          <span>{you.ships.length < you.slots ? "OPEN SLOT READY" : "OPEN A SLOT FIRST"}</span>
        </div>
        <div className="buy-row">
          {([4, 6, 8, 10] as DieSize[]).map((sides) => (
            <button
              className={`buy-die die-size-${sides}`}
              disabled={busy || you.ships.length >= you.slots || priceOf(sides) > you.energy}
              key={sides}
              onClick={() => play({ type: "shop", operation: "buy", sides })}
            >
              <ShipHull ready sides={sides} value={0} />
              <strong>d{sides}</strong>
              <span>{priceOf(sides)}⚡</span>
            </button>
          ))}
        </div>
      </section>

      <section className="upgrade-section option-row" id="open-slots">
        <div>
          <h2>Open a fleet slot</h2>
          <p>More ships create more rolls and longer straights.</p>
        </div>
        <button
          className="action-button outline-action"
          disabled={busy || you.slots >= 8 || slotPrice(nextSlot) > you.energy}
          onClick={() => play({ type: "shop", operation: "slot" })}
        >
          {you.slots >= 8 ? "All slots open" : `Open slot ${nextSlot} · ${slotPrice(nextSlot)}⚡`}
        </button>
      </section>

      <section className="upgrade-section option-row flagship-row" id="flagship-upgrade">
        <div>
          <h2>Upgrade your flagship</h2>
          <p>Level {you.flag.level}: every face bonus is +{Math.min(4, you.flag.level + 1)}.</p>
        </div>
        <button
          className="action-button gold-action"
          disabled={busy || !flagCost || flagCost > you.energy}
          onClick={() => play({ type: "shop", operation: "flagship" })}
        >
          {flagCost ? `Upgrade to level ${you.flag.level + 1} · ${flagCost}⚡` : "Level 3 maximum"}
        </button>
      </section>

      <button
        className="action-button blue-action full-action launch-round"
        disabled={busy}
        onClick={() => play({ type: "ready" })}
      >
        Go to round {round}
      </button>
    </section>
  );
}

function RollFleet({
  you,
  round,
  play,
  busy,
}: {
  you: PlayerState;
  round: number;
  play: (action: MatchAction) => Promise<void>;
  busy: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const run = straightOptions(you);
  const [straightTake, setStraightTake] = useState<number | undefined>(run?.length);
  const chosenStraightTake = run
    ? Math.min(straightTake ?? run.length, run.length)
    : undefined;
  const preview = you.dice.length ? previewTally(you, chosenStraightTake) : null;

  function toggleDie(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  async function rollSelected() {
    await play({ type: "roll", dice: selected });
    setSelected([]);
  }

  const canSubmit = you.phase === "rolling";
  return (
    <section className="stage">
      <div className="stage-heading">
        <div>
          <p className="eyebrow">ROUND {round}</p>
          <h1>{you.phase === "ready" ? "Your fleet is ready." : "Choose what to risk."}</h1>
        </div>
        <EnergyBank value={you.energy} />
      </div>
      <p className="stage-copy">
        {you.phase === "ready"
          ? "Every available ship and your flagship will roll."
          : you.rolls < 3
            ? "Tap only the dice you want to roll again. Everything else stays."
            : "Your three free rolls are complete. Submit, use your Flagship Token, or spend Energy for an extra reroll."}
      </p>

      <FleetFormation
        ships={you.ships}
        renderFlag={() => {
          if (you.phase === "ready") return <ReadyDie flag />;
          const flag = you.dice.find((die) => die.flag);
          if (!flag) return null;
          return (
            <FleetDie
              die={flag}
              onClick={() => toggleDie(flag.id)}
              selected={selected.includes(flag.id)}
            />
          );
        }}
        renderShip={(index) => {
          const ship = you.ships[index];
          const damaged = ship.disabledRound === round;
          if (you.phase === "ready") {
            return (
              <ReadyDie damaged={damaged} sides={ship.sides} slot={index + 1} />
            );
          }
          const die = you.dice.find((entry) => entry.id === ship.id);
          if (!die) {
            return <ReadyDie damaged sides={ship.sides} slot={index + 1} />;
          }
          return (
            <FleetDie
              die={die}
              onClick={() => toggleDie(die.id)}
              selected={selected.includes(die.id)}
              slot={index + 1}
            />
          );
        }}
      />

      {preview ? <LiveTally tally={preview} /> : null}

      {run ? (
        <section className="straight-panel">
          <div>
            <p className="eyebrow">STRAIGHT FOUND · {run.start}–{run.top}</p>
            <h2>Choose how to cash it.</h2>
          </div>
          <div className="straight-options">
            {Array.from({ length: run.length - 4 }, (_, index) => index + 5).map((length) => {
              const option = previewTally(you, length).run!;
              return (
                <button
                  className={chosenStraightTake === length ? "active" : ""}
                  key={length}
                  onClick={() => setStraightTake(length)}
                >
                  <b>{length} straight</b>
                  <span>{option.reward.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : you.phase === "rolling" ? (
        <p className="straight-reminder">No straight yet · five numbers in a row earns a reward.</p>
      ) : null}

      {you.phase === "rolling" && you.rolls >= 3 ? (
        <section className={`flag-token ${you.flag.token ? "" : "spent"}`}>
          <div>
            <span>FLAGSHIP TOKEN · ONCE PER MATCH</span>
            <strong>{you.flag.token ? "Rotate the flagship one number." : "Token spent."}</strong>
          </div>
          {you.flag.token ? (
            <div>
              <button disabled={busy} onClick={() => play({ type: "flag-token", direction: -1 })}>−1</button>
              <button disabled={busy} onClick={() => play({ type: "flag-token", direction: 1 })}>+1</button>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="roll-actions">
        {you.phase === "ready" ? (
          <button
            className="action-button blue-action full-action"
            disabled={busy}
            onClick={() => play({ type: "roll", dice: [] })}
          >
            Roll 1 of 3
          </button>
        ) : (
          <>
            <button
              className="action-button outline-action"
              disabled={busy || selected.length === 0}
              onClick={rollSelected}
            >
              {you.rolls < 3
                ? `Roll ${you.rolls + 1} of 3`
                : `Extra reroll · ${selected.length}⚡`}
            </button>
            <button
              className="action-button red-action"
              disabled={busy || !canSubmit}
              onClick={() => play({ type: "submit", straightTake: chosenStraightTake })}
            >
              Lock orders
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function FleetFormation({
  ships,
  renderShip,
  renderFlag,
}: {
  ships: { id: string }[];
  renderShip: (index: number) => ReactNode;
  renderFlag: () => ReactNode;
}) {
  const cells = [];
  for (let i = 0; i < 9; i += 1) {
    if (i === 4) {
      cells.push(
        <div className="fleet-cell" key="flag">
          {renderFlag()}
        </div>,
      );
      continue;
    }
    const index = i < 4 ? i : i - 1;
    cells.push(
      <div className="fleet-cell" key={`slot-${index}`}>
        {index < ships.length ? (
          renderShip(index)
        ) : (
          <div className="empty-slot" aria-hidden="true">
            <span>{index + 1}</span>
          </div>
        )}
      </div>,
    );
  }
  return <div className="fleet-formation">{cells}</div>;
}

function BraceFleet({
  you,
  round,
  play,
  busy,
}: {
  you: PlayerState;
  round: number;
  play: (action: MatchAction) => Promise<void>;
  busy: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const pickable = new Set(activeShips(you, round).map((ship) => ship.id));
  const blocked = you.ships
    .filter((ship) => selected.includes(ship.id))
    .reduce((sum, ship) => sum + ship.sides, 0);
  const flagshipDamage = Math.max(0, you.incoming - blocked) + you.directIncoming;
  const volleyLeft = Math.max(0, you.incoming - blocked);

  function toggleShip(id: string) {
    if (!pickable.has(id)) return;
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  return (
    <section className="stage brace-stage">
      <p className="eyebrow">ENEMY VOLLEY INCOMING</p>
      <h1>How much of the hit will your fleet take?</h1>
      <p className="stage-copy">
        Tap as many ships as you want. Each chosen ship blocks its size, then
        misses the next round. <b className="direct-text">Direct</b> always reaches the flagship.
      </p>
      <div className="incoming-numbers">
        <div><span>VOLLEY LEFT</span><strong>{volleyLeft}</strong></div>
        <div><span>DIRECT</span><strong className="direct-text">{you.directIncoming}</strong></div>
        <div><span>TO FLAGSHIP</span><strong className="damage-text">{flagshipDamage}</strong></div>
      </div>

      <FleetFormation
        ships={you.ships}
        renderFlag={() => (
          <div className="fleet-die flag brace-flag static">
            <div className="brace-flag-label">Flagship</div>
            <strong className="brace-flag-hp">{Math.max(0, you.hp)}</strong>
          </div>
        )}
        renderShip={(index) => {
          const ship = you.ships[index];
          const damaged = ship.disabledRound === round;
          const picked = selected.includes(ship.id);
          const canPick = pickable.has(ship.id) && (picked || volleyLeft > 0);
          return (
            <button
              className={`fleet-die shield-die ${picked ? "selected" : ""} ${damaged ? "hurt" : ""} ${canPick ? "" : "no-pick"}`}
              disabled={!canPick || busy}
              key={ship.id}
              onClick={() => toggleShip(ship.id)}
              type="button"
            >
              <span className="slot-badge">{index + 1}</span>
              <ShipHull ready sides={ship.sides} value={0} />
              <span className="die-caption">
                {damaged
                  ? "Damaged"
                  : picked
                    ? `Blocks ${ship.sides}`
                    : canPick
                      ? `d${ship.sides} · tap`
                      : `d${ship.sides}`}
              </span>
            </button>
          );
        }}
      />

      <div className="brace-actions">
        {selected.length ? (
          <button
            className="action-button outline-action"
            disabled={busy}
            onClick={() => setSelected([])}
            type="button"
          >
            Reset choices
          </button>
        ) : null}
        <button
          className="action-button red-action full-action"
          disabled={busy}
          onClick={() => play({ type: "brace", ships: selected })}
          type="button"
        >
          {flagshipDamage > 0
            ? `Continue — flagship takes ${flagshipDamage}`
            : "Continue — nothing gets through"}
        </button>
      </div>
    </section>
  );
}

function RoundResult({
  match,
  you,
  enemy,
  play,
  busy,
}: {
  match: LiveMatch;
  you: PlayerState;
  enemy: PlayerState;
  play: (action: MatchAction) => Promise<void>;
  busy: boolean;
}) {
  const finished = match.state.status === "finished";
  const cancelled = Boolean(match.state.cancelledBy);
  const won = match.state.winner === match.side;
  const title = finished
    ? cancelled
      ? `${match.state.cancelledBy} ended this game.`
      : match.state.winner === "draw"
      ? "Both flagships fell."
      : won
        ? "Enemy flagship destroyed."
        : "Your flagship is destroyed."
    : `Round ${match.state.round} result`;
  return (
    <section className="stage report-stage">
      <div className="report-title">
        <p className="eyebrow">{finished ? (cancelled ? "MATCH CANCELLED" : "MATCH OVER") : "BOTH FLEETS REVEALED"}</p>
        <h1>{title}</h1>
      </div>
      <div className="report-grid">
        {you.report ? <ReportSide kind="you" label="YOUR FLAGSHIP" report={you.report} /> : null}
        {enemy.report ? <ReportSide kind="enemy" label="ENEMY FLAGSHIP" report={enemy.report} /> : null}
      </div>
      {finished ? (
        <div className="end-actions">
          <Link className="action-button light-action" href="/">Return home</Link>
          <Link className="action-button red-action" href="/versus">New match</Link>
        </div>
      ) : you.acknowledged ? (
        <section className="waiting-card compact-wait">
          <div className="loader" />
          <h2>Waiting for {enemy.name}.</h2>
        </section>
      ) : (
        <button
          className="action-button blue-action full-action"
          disabled={busy}
          onClick={() => play({ type: "continue" })}
        >
          Continue to upgrades
        </button>
      )}
    </section>
  );
}

function ReportSide({
  report,
  label,
  kind,
}: {
  report: RoundReport;
  label: string;
  kind: "you" | "enemy";
}) {
  const change = report.hpAfter - report.hpBefore;
  return (
    <article className={`report-side ${kind}`}>
      <h2>{label}</h2>
      <div className="health-movement">
        <div><strong>{report.hpBefore}</strong><span>START</span></div>
        <b>→</b>
        <div><strong>{report.hpAfter}</strong><span>NOW</span></div>
      </div>
      <div className="change-row">
        <span><b className="damage-text">−{report.damage}</b> damage</span>
        <span><b className="repair-text">+{report.repair}</b> repaired</span>
        <strong className={change < 0 ? "damage-text" : change > 0 ? "repair-text" : ""}>
          {change > 0 ? "+" : ""}{change}
          <small>TOTAL CHANGE</small>
        </strong>
      </div>
      <div className="report-dice">
        {report.dice.map((die) => <FleetDie die={die} key={die.id} staticDie />)}
      </div>
      <div className="result-lines">
        <p><span>ATTACK</span><b className="damage-text">{report.tally.attack}</b></p>
        <p><span>SHIELDS</span><b className="shield-text">{report.tally.defense}</b></p>
        <p><span>DIRECT</span><b className="direct-text">{report.tally.direct}</b></p>
        <p><span>REPAIR</span><b className="repair-text">{report.tally.heal}</b></p>
        <p><span>ENERGY BANKED</span><b className="energy-text">{report.energyEarned}</b></p>
        {report.soaked ? <p><span>BLOCKED BY SHIPS</span><b>{report.soaked}</b></p> : null}
      </div>
    </article>
  );
}

function FleetDie({
  die,
  selected = false,
  onClick,
  staticDie = false,
  slot,
}: {
  die: DieValue;
  selected?: boolean;
  onClick?: () => void;
  staticDie?: boolean;
  slot?: number;
}) {
  const effect = die.flag
    ? flagFaceLabel(die.value)
    : die.value % 2 === 0
      ? "Attack"
      : "Shields";
  return (
    <button
      className={`fleet-die ${die.flag ? "flag" : `die-size-${die.sides}`} ${selected ? "selected" : ""} ${staticDie ? "static" : ""} ${die.value % 2 === 0 && !die.flag ? "attack-die" : !die.flag ? "shield-die" : ""}`}
      disabled={staticDie}
      onClick={onClick}
      type="button"
    >
      {slot ? <span className="slot-badge">{slot}</span> : null}
      {selected ? <span className="reroll-mark">REROLL</span> : null}
      {die.flag ? (
        <FlagHull value={die.value} />
      ) : (
        <ShipHull sides={die.sides as DieSize} value={die.value} />
      )}
      <span className="die-caption">
        {die.flag ? `FLAGSHIP · ${effect}` : effect}
      </span>
    </button>
  );
}

function ReadyDie({
  sides,
  flag = false,
  damaged = false,
  slot,
}: {
  sides?: DieSize;
  flag?: boolean;
  damaged?: boolean;
  slot?: number;
}) {
  return (
    <div className={`fleet-die ready-die ${flag ? "flag" : `die-size-${sides}`} ${damaged ? "hurt" : ""}`}>
      {slot ? <span className="slot-badge">{slot}</span> : null}
      {flag ? <FlagHull value={1} ready /> : <ShipHull sides={sides || 4} value={0} ready />}
      <span className="die-caption">
        {flag ? "FLAGSHIP · READY" : damaged ? "Damaged" : "Ready"}
      </span>
    </div>
  );
}

function LiveTally({ tally }: { tally: ReturnType<typeof previewTally> }) {
  return (
    <section className="live-tally">
      <div><span>ATTACK</span><strong className="damage-text">{tally.attack}</strong></div>
      <div><span>SHIELDS</span><strong className="shield-text">{tally.defense}</strong></div>
      <div><span>DIRECT</span><strong className="direct-text">{tally.direct}</strong></div>
      <div><span>REPAIR</span><strong className="repair-text">{tally.heal}</strong></div>
      <div><span>ENERGY</span><strong className="energy-text">{tally.energy}</strong></div>
    </section>
  );
}

function EnergyBank({ value }: { value: number }) {
  return (
    <div className="energy-bank">
      <span>ENERGY</span>
      <strong>{value}⚡</strong>
    </div>
  );
}

function phaseText(player: PlayerState): string {
  if (player.phase === "shop") return "UPGRADING";
  if (player.phase === "ready") return "READY TO ROLL";
  if (player.phase === "rolling") return `ROLL ${Math.min(3, player.rolls)} OF 3`;
  if (player.phase === "submitted") return "ORDERS LOCKED";
  if (player.phase === "brace") return "TAKING THE HIT";
  if (player.phase === "report") return "ROUND REVEALED";
  if (player.phase === "over") return "MATCH COMPLETE";
  return "WAITING";
}
