"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SiteHeader } from "./Brand";
import { InvitePanel } from "./InvitePanel";
import { ReferenceSheets, type ReferenceKind } from "./ReferenceSheets";
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
  clearActiveMatch,
  enterLiveMatch,
  playLiveAction,
  watchLiveMatch,
  type LiveMatch,
} from "@/lib/firebase-match";
import { withBasePath } from "@/lib/paths";
import { FlagHull, ShipHull, flagFaceDetail } from "./DieArt";

function friendlyFirebaseError(reason: unknown): string {
  const message = reason instanceof Error ? reason.message : String(reason || "The match did not load.");
  if (/Missing or insufficient permissions|permission-denied/i.test(message)) {
    return "That room already has two players. If you created the game, stay on your original game tab — you are already in.";
  }
  if (/Open the invite link|already has two players/i.test(message)) {
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
  const [reference, setReference] = useState<ReferenceKind | null>(null);

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
      <SiteHeader
        code={match.state.code}
        onCosts={() => setReference("costs")}
        round={you.round}
      />
      {reference ? (
        <ReferenceSheets
          baseEnergy={you.baseEnergy}
          energy={you.energy}
          flagLevel={you.flag.level}
          kind={reference}
          onClose={() => setReference(null)}
          shipCount={you.ships.length}
          slots={you.slots}
        />
      ) : null}
      {cancelled ? (
        <section className="waiting-card">
          <p className="eyebrow">MATCH CANCELLED</p>
          <h1>{match.state.cancelledBy} ended this game.</h1>
          <p>The room is closed. Start a new match whenever you’re ready.</p>
          <div className="end-actions">
            <Link
              className="action-button light-action"
              href="/"
              onClick={() => clearActiveMatch(match.id)}
            >
              Quit game
            </Link>
            <Link
              className="action-button red-action"
              href="/versus"
              onClick={() => clearActiveMatch(match.id)}
            >
              New match
            </Link>
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
          {error ? <p className="match-error">{error}</p> : null}
          <MatchStage
            busy={busy}
            enemy={enemy}
            match={match}
            onCancel={() => setConfirmCancel(true)}
            onHelp={() => setReference("help")}
            play={play}
            you={you}
          />
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
            <p>
              Are you sure? This ends the match for both commanders and removes it
              from the live board.
            </p>
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

function HealthBoard({
  you,
  enemy,
  mid,
  earning = 0,
}: {
  you: PlayerState;
  enemy: PlayerState;
  mid?: ReactNode;
  earning?: number;
}) {
  return (
    <section className="fleet-board">
      <div className="fleet-score you-score">
        <div className="who">You</div>
        <div className="val">{Math.max(0, you.hp)}</div>
      </div>
      <div className="fleet-score energy-score">
        <div className="who">Energy</div>
        <div className="val">
          {you.energy}
          {earning > 0 ? <span className="soon">→{you.energy + earning}</span> : null}
        </div>
      </div>
      <div className="fleet-score base-score">
        <div className="who">Base</div>
        <div className="val">{you.baseEnergy}</div>
      </div>
      {mid ?? (
        <div className="fleet-mid">
          FLAGSHIP
          <br />
          HEALTH
        </div>
      )}
      <div className="fleet-score enemy-score">
        <div className="who">Enemy</div>
        <div className="val">{Math.max(0, enemy.hp)}</div>
      </div>
    </section>
  );
}

function MatchDock({
  onHelp,
  primary,
  onCancel,
}: {
  onHelp: () => void;
  primary?: ReactNode;
  onCancel?: () => void;
}) {
  return (
    <div className="match-dock">
      <div className="match-dock-in">
        {primary}
      </div>
      <div className="match-dock-links">
        {onCancel ? (
          <button className="dock-btn dock-cancel" onClick={onCancel} type="button">
            Cancel game
          </button>
        ) : null}
        <button className="dock-btn howto-btn" onClick={onHelp} type="button">
          How to play
        </button>
      </div>
    </div>
  );
}

function MatchStage({
  match,
  you,
  enemy,
  play,
  busy,
  onHelp,
  onCancel,
}: {
  match: LiveMatch;
  you: PlayerState;
  enemy: PlayerState;
  play: (action: MatchAction) => Promise<void>;
  busy: boolean;
  onHelp: () => void;
  onCancel: () => void;
}) {
  if (match.state.status === "finished" || you.phase === "over") {
    return (
      <RoundResult
        busy={busy}
        enemy={enemy}
        match={match}
        onHelp={onHelp}
        play={play}
        you={you}
      />
    );
  }
  if (you.phase === "shop") {
    return (
      <Shipyard
        busy={busy}
        enemy={enemy}
        onCancel={onCancel}
        onHelp={onHelp}
        play={play}
        round={you.round}
        you={you}
      />
    );
  }
  if (you.phase === "ready" || you.phase === "rolling") {
    return (
      <RollFleet
        busy={busy}
        enemy={enemy}
        onCancel={onCancel}
        onHelp={onHelp}
        play={play}
        round={you.round}
        you={you}
      />
    );
  }
  if (you.phase === "brace") {
    return (
      <BraceFleet
        busy={busy}
        enemy={enemy}
        onCancel={onCancel}
        onHelp={onHelp}
        play={play}
        round={you.round}
        you={you}
      />
    );
  }
  if (you.phase === "report") {
    return (
      <RoundResult
        busy={busy}
        enemy={enemy}
        match={match}
        onCancel={onCancel}
        onHelp={onHelp}
        play={play}
        you={you}
      />
    );
  }
  return (
    <>
      <HealthBoard enemy={enemy} you={you} />
      <section className="waiting-card">
        <div className="loader" />
        <p className="eyebrow">ORDER LOCKED</p>
        <h1>Waiting for {enemy.name}.</h1>
        <p>Your dice stay hidden until both fleets submit.</p>
      </section>
      <MatchDock
        onCancel={onCancel}
        onHelp={onHelp}
      />
    </>
  );
}

function Shipyard({
  you,
  enemy,
  round,
  play,
  busy,
  onHelp,
  onCancel,
}: {
  you: PlayerState;
  enemy: PlayerState;
  round: number;
  play: (action: MatchAction) => Promise<void>;
  busy: boolean;
  onHelp: () => void;
  onCancel: () => void;
}) {
  const nextSlot = you.slots + 1;
  const nextSlotCost = you.slots >= 8 ? null : slotPrice(nextSlot);
  const flagCost = flagshipUpgradeCost(you.flag.level);
  return (
    <>
      <HealthBoard enemy={enemy} you={you} />
      <section className="stage stage-docked">
        <header className="brace-header">
          <p className="eyebrow">SHIPYARD</p>
          <h1 className="brace-title">Upgrade fleet</h1>
          <p className="brace-lead">
            Upgrade ships, unlock the next fleet slot, or raise the flagship — then roll.
          </p>
        </header>
        <nav className="jump-nav" aria-label="Upgrade sections">
          <a href="#fleet-upgrades">Fleet</a>
          <a href="#buy-ships">Buy ships</a>
        </nav>

        <section className="upgrade-section" id="fleet-upgrades">
          <div className="section-heading">
            <h2>Your ships</h2>
            <span>{you.ships.length} / {you.slots} slots</span>
          </div>
          <FleetFormation
            ships={you.ships}
            slots={you.slots}
            renderFlag={() => (
              <div className="fleet-die shop-flag shop-flagship static">
                <div className="brace-flag-label">Flagship</div>
                <strong className="brace-flag-hp">{Math.max(0, you.hp)}</strong>
                <span className="shop-flag-level">level {you.flag.level}</span>
                {flagCost ? (
                  <button
                    className="ship-act flagship-upgrade-act"
                    disabled={busy || flagCost > you.energy}
                    onClick={() => play({ type: "shop", operation: "flagship" })}
                    type="button"
                  >
                    Upgrade to level {you.flag.level + 1} {flagCost}⚡
                  </button>
                ) : (
                  <span className="ship-act ship-act-maxed">Level 3 maximum</span>
                )}
              </div>
            )}
            renderLocked={(index) => {
              const isNext = index === you.slots && nextSlotCost != null;
              if (!isNext) {
                return (
                  <div className="empty-slot locked-slot" aria-hidden="true">
                    <span>{index + 1}</span>
                    <small>locked</small>
                  </div>
                );
              }
              return (
                <button
                  className="empty-slot unlock-slot"
                  disabled={busy || nextSlotCost > you.energy}
                  onClick={() => play({ type: "shop", operation: "slot" })}
                  type="button"
                >
                  <span className="slot-badge">{index + 1}</span>
                  <span className="unlock-slot-label">Unlock fleet slot</span>
                  <strong className="unlock-slot-cost">{nextSlotCost}⚡</strong>
                </button>
              );
            }}
            renderShip={(index) => {
              const ship = you.ships[index];
              const next = ship.sides === 4 ? 6 : ship.sides === 6 ? 8 : ship.sides === 8 ? 10 : null;
              const cost = next ? priceOf(next as DieSize) - priceOf(ship.sides) : null;
              const damaged = ship.disabledRound === round;
              return (
                <div className={`fleet-die shop-ship ${damaged ? "hurt" : ""}`} key={ship.id}>
                  <span className="slot-badge">{index + 1}</span>
                  <ShipHull ready sides={ship.sides} value={0} />
                  <span className="die-caption">d{ship.sides}</span>
                  {next ? (
                    <button
                      className="ship-act ship-upgrade-act"
                      disabled={busy || damaged || (cost ?? 0) > you.energy}
                      onClick={() => play({ type: "shop", operation: "upgrade", shipId: ship.id })}
                      type="button"
                    >
                      {damaged ? "Damaged" : `Upgrade to d${next} ${cost}⚡`}
                    </button>
                  ) : (
                    <span className="ship-act ship-act-maxed">{damaged ? "Damaged" : "Max d10"}</span>
                  )}
                </div>
              );
            }}
          />
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
                type="button"
              >
                <ShipHull ready sides={sides} value={0} />
                <strong>d{sides}</strong>
                <span>{priceOf(sides)}⚡</span>
              </button>
            ))}
          </div>
        </section>
      </section>
      <MatchDock
        onCancel={onCancel}
        onHelp={onHelp}
        primary={
          <button
            className="go-btn"
            disabled={busy}
            onClick={() => play({ type: "ready" })}
            type="button"
          >
            Go to round {round}
          </button>
        }
      />
    </>
  );
}

function RollFleet({
  you,
  enemy,
  round,
  play,
  busy,
  onHelp,
  onCancel,
}: {
  you: PlayerState;
  enemy: PlayerState;
  round: number;
  play: (action: MatchAction) => Promise<void>;
  busy: boolean;
  onHelp: () => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [rolledIds, setRolledIds] = useState<Set<string>>(() => new Set());
  const [rollPulse, setRollPulse] = useState(0);
  const run = straightOptions(you);
  const [straightTake, setStraightTake] = useState<number | undefined>(
    run ? Math.min(run.length, 7) : undefined,
  );
  const chosenStraightTake = run
    ? Math.min(straightTake ?? run.length, run.length, 7)
    : undefined;
  const preview = you.dice.length ? previewTally(you, chosenStraightTake) : null;
  const earning = preview ? preview.energy + you.baseEnergy : 0;
  const inrunIds = straightDieIds(you.dice, preview?.run);

  useEffect(() => {
    if (!rolledIds.size) return;
    const timer = window.setTimeout(() => setRolledIds(new Set()), 360);
    return () => window.clearTimeout(timer);
  }, [rollPulse, rolledIds]);

  function markRolled(ids: string[]) {
    setRolledIds(new Set(ids));
    setRollPulse((pulse) => pulse + 1);
  }

  function toggleDie(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  async function rollOpening() {
    const ids = [...activeShips(you, round).map((ship) => ship.id), "flag"];
    await play({ type: "roll", dice: [] });
    markRolled(ids);
  }

  async function rollSelected() {
    const ids = [...selected];
    await play({ type: "roll", dice: ids });
    markRolled(ids);
    setSelected([]);
  }

  const canSubmit = you.phase === "rolling";
  const rollButton =
    you.phase === "ready" ? (
      <button
        className="roll-under go"
        disabled={busy}
        onClick={rollOpening}
        type="button"
      >
        Roll 1 of 3
        <small>Roll every ready die</small>
      </button>
    ) : you.rolls < 3 ? (
      <button
        className="roll-under go"
        disabled={busy || selected.length === 0}
        onClick={rollSelected}
        type="button"
      >
        {`Roll ${you.rolls + 1} of 3`}
        <small>{selected.length ? `${selected.length} selected` : "Select dice to reroll"}</small>
      </button>
    ) : (
      <button
        className="roll-under"
        disabled={busy || selected.length === 0 || you.energy < selected.length}
        onClick={rollSelected}
        type="button"
      >
        Energy reroll
        <small>{Math.max(1, selected.length)}⚡</small>
      </button>
    );
  const fireButton = canSubmit ? (
    <button
      className="fire-btn"
      disabled={busy}
      onClick={() => play({ type: "submit", straightTake: chosenStraightTake })}
      type="button"
    >
      Fire
      <small>Lock this roll</small>
    </button>
  ) : undefined;

  return (
    <>
      <HealthBoard
        enemy={enemy}
        earning={you.phase === "rolling" ? earning : 0}
        mid={fireButton}
        you={you}
      />
      <section className="stage stage-docked">
        <p className="say">
          {you.phase === "ready"
            ? "Every available ship and your flagship will roll. Use the button under the fleet."
            : you.rolls < 3
              ? "Tap only the dice you want to roll again. Press red Fire at the top when this roll is the one."
              : "Free rolls are done. Fire at the top, spend Energy to reroll below, or use your Flagship Token."}
        </p>

        {preview ? <LiveTally tally={preview} /> : null}

        {run ? (
          <section className="straight-panel">
            <div>
              <p className="eyebrow">STRAIGHT FOUND · {run.start}–{run.top}</p>
              <h2>Choose how to cash it.</h2>
            </div>
            <div className="straight-options">
              {Array.from({ length: Math.min(run.length, 7) - 4 }, (_, index) => index + 5).map((length) => {
                const option = previewTally(you, length).run!;
                return (
                  <button
                    className={chosenStraightTake === length ? "active" : ""}
                    key={length}
                    onClick={() => setStraightTake(length)}
                    type="button"
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

        {you.phase === "rolling" ? (
          <section className={`flag-token ${you.flag.token ? "" : "spent"}`}>
            <div>
              <span>FLAGSHIP TOKEN · ONCE PER MATCH</span>
              <strong>{you.flag.token ? "Rotate the flagship one number." : "Token spent."}</strong>
            </div>
            {you.flag.token ? (
              <div>
                <button disabled={busy} onClick={() => play({ type: "flag-token", direction: -1 })} type="button">−1</button>
                <button disabled={busy} onClick={() => play({ type: "flag-token", direction: 1 })} type="button">+1</button>
              </div>
            ) : null}
          </section>
        ) : null}

        <FleetFormation
          ships={you.ships}
          slots={you.slots}
          renderFlag={() => {
            if (you.phase === "ready") return <ReadyDie flag face={you.flag.face} />;
            const flag = you.dice.find((die) => die.flag);
            if (!flag) return null;
            return (
              <FleetDie
                die={flag}
                flagLevel={you.flag.level}
                inrun={inrunIds.has(flag.id)}
                onClick={() => toggleDie(flag.id)}
                rolled={rolledIds.has(flag.id)}
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
                inrun={inrunIds.has(die.id)}
                onClick={() => toggleDie(die.id)}
                rolled={rolledIds.has(die.id)}
                selected={selected.includes(die.id)}
                slot={index + 1}
              />
            );
          }}
        />

        <div className="roll-slot">{rollButton}</div>
      </section>
      <MatchDock onCancel={onCancel} onHelp={onHelp} />
    </>
  );
}

function FleetFormation({
  ships,
  slots,
  renderShip,
  renderFlag,
  renderLocked,
}: {
  ships: { id: string }[];
  slots?: number;
  renderShip: (index: number) => ReactNode;
  renderFlag: () => ReactNode;
  renderLocked?: (index: number) => ReactNode;
}) {
  const openSlots = slots ?? Math.max(ships.length, 8);
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
        ) : index < openSlots ? (
          <div className="empty-slot free-slot" aria-hidden="true">
            <span>{index + 1}</span>
            <small>slot free</small>
          </div>
        ) : renderLocked ? (
          renderLocked(index)
        ) : (
          <div className="empty-slot locked-slot" aria-hidden="true">
            <span>{index + 1}</span>
            <small>locked</small>
          </div>
        )}
      </div>,
    );
  }
  return <div className="fleet-formation">{cells}</div>;
}

function BraceFleet({
  you,
  enemy,
  round,
  play,
  busy,
  onHelp,
  onCancel,
}: {
  you: PlayerState;
  enemy: PlayerState;
  round: number;
  play: (action: MatchAction) => Promise<void>;
  busy: boolean;
  onHelp: () => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const autoBraceSent = useRef(false);
  const pickable = new Set(activeShips(you, round).map((ship) => ship.id));
  const blocked = you.ships
    .filter((ship) => selected.includes(ship.id))
    .reduce((sum, ship) => sum + ship.sides, 0);
  const flagshipDamage = Math.max(0, you.incoming - blocked) + you.directIncoming;
  const volleyLeft = Math.max(0, you.incoming - blocked);
  const heal = you.tally?.heal ?? 0;
  const maxSoak = [...pickable].reduce((sum, id) => {
    const ship = you.ships.find((entry) => entry.id === id);
    return sum + (ship?.sides ?? 0);
  }, 0);
  const bestHp =
    you.hp - Math.max(0, you.incoming - maxSoak) - you.directIncoming + heal;
  const doomed = bestHp <= 0;
  const projectedHp = you.hp - flagshipDamage + heal;
  const lethalChoice = projectedHp <= 0;
  const overHealth = flagshipDamage > you.hp;

  useEffect(() => {
    if (autoBraceSent.current || busy || pickable.size > 0) return;
    autoBraceSent.current = true;
    void play({ type: "brace", ships: [] });
  }, [busy, pickable.size, play]);

  function toggleShip(id: string) {
    if (!pickable.has(id)) return;
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  return (
    <>
      <HealthBoard enemy={enemy} you={you} />
      <section className="stage stage-docked brace-stage">
        <header className="brace-header">
          <p className="eyebrow">ENEMY VOLLEY</p>
          <h1 className="brace-title">
            {doomed
              ? "Flagship will fall"
              : lethalChoice
                ? "This choice destroys you"
                : "Taking damage"}
          </h1>
          <p className="brace-lead">
            {doomed ? (
              <>
                Even if every ready ship blocks, this volley drops your flagship to 0.
                The match ends for both commanders — you do not need to wait.
              </>
            ) : lethalChoice ? (
              <>
                With this block, the flagship takes <b className="damage-text">{flagshipDamage}</b>{" "}
                and you only have <b>{you.hp}</b> health
                {heal > 0 ? <> (plus <b className="repair-text">{heal}</b> repair)</> : null}.
                Tap more ships to block, or continue and lose the match.
              </>
            ) : (
              <>
                Choose ships to protect your flagship. Each ship you tap blocks its size,
                then is <b>damaged for one round</b>.{" "}
                <b className="direct-text">Direct</b> cannot be blocked.
                Damaged ships are already out this round.
                {overHealth ? (
                  <>
                    {" "}
                    <b className="damage-text">
                      Warning: {flagshipDamage} damage is more than your {you.hp} health
                      {heal > 0
                        ? ` — repair (${heal}) still keeps you alive if you continue.`
                        : " — block more before you continue."}
                    </b>
                  </>
                ) : null}
              </>
            )}
          </p>
        </header>
        <div className="tot three">
          <div className="a"><div className="n">{volleyLeft}</div><div className="l">Volley left</div></div>
          <div className="dir"><div className="n">{you.directIncoming}</div><div className="l">Direct</div></div>
          <div className={`h ${lethalChoice || overHealth ? "brace-tot-lethal" : ""}`}>
            <div className="n">{flagshipDamage}</div>
            <div className="l">
              {lethalChoice
                ? `To flagship (>${you.hp} HP)`
                : overHealth
                  ? `To flagship (>${you.hp} HP)`
                  : "To flagship"}
            </div>
          </div>
        </div>

        <FleetFormation
          ships={you.ships}
          slots={you.slots}
          renderFlag={() => (
            <div
              className={`fleet-die brace-flag brace-flagship static ${
                lethalChoice || overHealth ? "brace-flag-lethal" : ""
              }`}
            >
              <div className="brace-flag-label">Flagship Health</div>
              <strong className="brace-flag-hp">{Math.max(0, you.hp)}</strong>
              <span className="brace-flag-risk">
                {flagshipDamage <= 0
                  ? "Safe"
                  : lethalChoice
                    ? `Takes ${flagshipDamage} — falls`
                    : overHealth
                      ? `Takes ${flagshipDamage} (>${you.hp} HP)`
                      : `Takes ${flagshipDamage}`}
              </span>
            </div>
          )}
          renderShip={(index) => {
            const ship = you.ships[index];
            const alreadyHurt = ship.disabledRound === round;
            const picked = selected.includes(ship.id);
            const canPick = pickable.has(ship.id) && (picked || volleyLeft > 0);
            return (
              <button
                className={`fleet-die shield-die brace-ship-die ${picked ? "selected brace-sacrificed" : ""} ${alreadyHurt ? "hurt" : ""} ${canPick ? "" : "no-pick"}`}
                disabled={!canPick || busy}
                key={ship.id}
                onClick={() => toggleShip(ship.id)}
                type="button"
              >
                <span className="slot-badge">{index + 1}</span>
                <div className="brace-hull-wrap">
                  <ShipHull ready sides={ship.sides} value={0} />
                  {picked ? (
                    <span className="brace-damage-overlay">Damaged for one round</span>
                  ) : null}
                </div>
                <span className={`die-caption ${picked ? "brace-caption-picked" : ""}`}>
                  {alreadyHurt
                    ? "Already damaged"
                    : picked
                      ? `Blocking ${ship.sides}`
                      : canPick
                        ? `Tap — Block ${ship.sides}`
                        : `d${ship.sides}`}
                </span>
              </button>
            );
          }}
        />
      </section>
      <MatchDock
        onCancel={onCancel}
        onHelp={onHelp}
        primary={
          <div className="dock-primary-stack">
            {selected.length ? (
              <button
                className="outline-dock-btn"
                disabled={busy}
                onClick={() => setSelected([])}
                type="button"
              >
                Reset
              </button>
            ) : null}
            <button
              className={`go-btn ${lethalChoice || doomed ? "go-btn-danger" : ""}`}
              disabled={busy}
              onClick={() => play({ type: "brace", ships: selected })}
              type="button"
            >
              {doomed
                ? "Continue — flagship falls"
                : lethalChoice
                  ? `Continue — ${flagshipDamage} dmg ends you (${you.hp} HP)`
                  : overHealth
                    ? `Continue — Flagship takes ${flagshipDamage} Dmg (>${you.hp} HP)`
                    : flagshipDamage > 0
                      ? `Continue — Flagship takes ${flagshipDamage} Dmg`
                      : "Continue — Flagship is safe"}
            </button>
          </div>
        }
      />
    </>
  );
}

function RoundResult({
  match,
  you,
  enemy,
  play,
  busy,
  onHelp,
  onCancel,
}: {
  match: LiveMatch;
  you: PlayerState;
  enemy: PlayerState;
  play: (action: MatchAction) => Promise<void>;
  busy: boolean;
  onHelp: () => void;
  onCancel?: () => void;
}) {
  const finished = match.state.status === "finished";
  const cancelled = Boolean(match.state.cancelledBy);
  const won = match.state.winner === match.side;
  const draw = match.state.winner === "draw";
  const enemyStillBracing = !finished && enemy.phase === "brace";
  const title = finished
    ? cancelled
      ? `${match.state.cancelledBy} ended this game.`
      : draw
      ? "Both flagships fell."
      : won
        ? "Enemy flagship destroyed."
        : "Your flagship is destroyed."
    : `Round ${you.round} result`;
  const endArt = finished && !cancelled && !draw
    ? {
        src: withBasePath(won ? "/fleet-dice-victory.png" : "/fleet-dice-defeat.png"),
        alt: won ? "Victory — you win" : "Defeat — your fleet was destroyed",
      }
    : null;
  return (
    <>
      <HealthBoard enemy={enemy} you={you} />
      <section className="stage stage-docked report-stage">
        <div className="report-title">
          <p className="eyebrow">{finished ? (cancelled ? "MATCH CANCELLED" : "MATCH OVER") : "BOTH FLEETS REVEALED"}</p>
          <h1>{title}</h1>
          {enemyStillBracing ? (
            <p className="say">
              {enemy.name} is choosing whether to block with ships. If the hit is
              bigger than every ship they have left can stop, both of you jump
              straight to victory or defeat — no waiting.
            </p>
          ) : null}
        </div>
        {endArt ? (
          <img
            alt={endArt.alt}
            className={`end-banner ${won ? "end-banner-win" : "end-banner-loss"}`}
            src={endArt.src}
          />
        ) : null}
        <div className="report-grid">
          {you.report ? (
            <ReportSide
              flagLevel={you.flag.level}
              kind="you"
              label="YOUR FLAGSHIP"
              report={you.report}
            />
          ) : null}
          {enemy.report ? (
            <ReportSide
              flagLevel={enemy.flag.level}
              kind="enemy"
              label="ENEMY FLAGSHIP"
              note={
                enemy.phase === "shop" || enemy.phase === "ready" || enemy.phase === "rolling"
                  ? `${enemy.name} moved on to upgrades — their round summary stays here.`
                  : undefined
              }
              report={enemy.report}
            />
          ) : enemy.dice.length ? (
            <article className="report-side enemy">
              <h2>ENEMY FLAGSHIP</h2>
              <p className="pending-enemy">
                {enemy.phase === "brace"
                  ? `${enemy.name} is still assigning the hit.`
                  : `${enemy.name} is still resolving this round.`}
              </p>
              <div className="report-dice">
                {enemy.dice.map((die) => (
                  <FleetDie
                    die={die}
                    flagLevel={enemy.flag.level}
                    key={die.id}
                    staticDie
                  />
                ))}
              </div>
              {enemy.tally ? (
                <div className="result-lines">
                  <p><span>ATTACK</span><b className="damage-text">{enemy.tally.attack}</b></p>
                  <p><span>SHIELDS</span><b className="shield-text">{enemy.tally.defense}</b></p>
                  <p><span>DIRECT</span><b className="direct-text">{enemy.tally.direct}</b></p>
                </div>
              ) : null}
            </article>
          ) : (
            <article className="report-side enemy">
              <h2>ENEMY FLAGSHIP</h2>
              <p className="pending-enemy">
                {enemy.phase === "shop"
                  ? `${enemy.name} is already in the shipyard.`
                  : `${enemy.name} is still resolving this round.`}
              </p>
            </article>
          )}
        </div>
        {finished ? (
          <div className="end-actions">
            <Link
              className="action-button light-action"
              href="/"
              onClick={() => clearActiveMatch(match.id)}
            >
              Quit game
            </Link>
            <Link
              className="action-button red-action"
              href="/versus"
              onClick={() => clearActiveMatch(match.id)}
            >
              New match
            </Link>
          </div>
        ) : null}
      </section>
      {!finished ? (
        <MatchDock
          onCancel={onCancel}
          onHelp={onHelp}
          primary={
            <button
              className="go-btn"
              disabled={busy}
              onClick={() => play({ type: "continue" })}
              type="button"
            >
              {enemyStillBracing
                ? "Check for victory…"
                : you.hp <= 0
                  ? "Match ending…"
                  : "Continue to upgrades"}
            </button>
          }
        />
      ) : null}
    </>
  );
}

function ReportSide({
  report,
  label,
  kind,
  flagLevel = 1,
  note,
}: {
  report: RoundReport;
  label: string;
  kind: "you" | "enemy";
  flagLevel?: number;
  note?: string;
}) {
  const change = report.hpAfter - report.hpBefore;
  return (
    <article className={`report-side ${kind}`}>
      <h2>{label}</h2>
      {note ? <p className="report-note">{note}</p> : null}
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
        {report.dice.map((die) => (
          <FleetDie die={die} flagLevel={flagLevel} key={die.id} staticDie />
        ))}
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

function straightDieIds(
  dice: DieValue[],
  run: { start: number; top: number } | null | undefined,
) {
  if (!run) return new Set<string>();
  const ids = new Set<string>();
  for (let value = run.start; value <= run.top; value += 1) {
    const die = dice.find((entry) => entry.value === value);
    if (die) ids.add(die.id);
  }
  return ids;
}

function FleetDie({
  die,
  selected = false,
  onClick,
  staticDie = false,
  slot,
  flagLevel = 1,
  inrun = false,
  rolled = false,
}: {
  die: DieValue;
  selected?: boolean;
  onClick?: () => void;
  staticDie?: boolean;
  slot?: number;
  flagLevel?: number;
  inrun?: boolean;
  rolled?: boolean;
}) {
  const flag = die.flag ? flagFaceDetail(die.value, flagLevel) : null;
  const effect = flag
    ? flag.short
    : die.value % 2 === 0
      ? "Attack"
      : "Shield";
  return (
    <button
      className={`fleet-die ${die.flag ? "flag" : `die-size-${die.sides}`} ${selected ? "selected" : ""} ${staticDie ? "static" : ""} ${inrun ? "inrun" : ""} ${rolled ? "rolled" : ""} ${die.value % 2 === 0 && !die.flag ? "attack-die" : !die.flag ? "shield-die" : ""}`}
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
      <span
        className={`die-caption ${die.flag ? "flag-caption" : ""}`}
        style={flag ? { color: flag.fill } : undefined}
      >
        {effect}
      </span>
    </button>
  );
}

function ReadyDie({
  sides,
  flag = false,
  face = 1,
  damaged = false,
  slot,
}: {
  sides?: DieSize;
  flag?: boolean;
  face?: number;
  damaged?: boolean;
  slot?: number;
}) {
  return (
    <div className={`fleet-die ready-die ${flag ? "flag" : `die-size-${sides}`} ${damaged ? "hurt" : ""}`}>
      {slot ? <span className="slot-badge">{slot}</span> : null}
      {flag ? <FlagHull value={face} ready /> : <ShipHull sides={sides || 4} value={0} ready />}
      <span className={`die-caption ${flag ? "flag-caption" : ""}`}>
        {flag ? "Ready" : damaged ? "Damaged" : "Ready"}
      </span>
    </div>
  );
}

function LiveTally({ tally }: { tally: ReturnType<typeof previewTally> }) {
  return (
    <section className="tot" aria-label="Current roll totals">
      <div className="a"><div className="n">{tally.attack}</div><div className="l">Attack</div></div>
      <div className="d"><div className="n">{tally.defense}</div><div className="l">Shields</div></div>
      <div className="e"><div className="n">{tally.energy}</div><div className="l">Energy</div></div>
      <div className="h"><div className="n">{tally.heal}</div><div className="l">Repair</div></div>
      <div className="dir"><div className="n">{tally.direct}</div><div className="l">Direct</div></div>
    </section>
  );
}
