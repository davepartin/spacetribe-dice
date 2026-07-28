"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brand } from "./Brand";
import { LiveBattlesBoard } from "./LiveBattlesBoard";
import { commanderName, rememberCommanderName } from "@/lib/firebase";
import {
  clearActiveMatch,
  enterLiveMatch,
  joinLiveMatchByCode,
  loadRememberedMatchCards,
  type RememberedMatchCard,
} from "@/lib/firebase-match";
import { withBasePath } from "@/lib/paths";

const KEY_ART = withBasePath("/fleet-dice-key-art.png");

export function HomeScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState("");
  const [savedMatches, setSavedMatches] = useState<RememberedMatchCard[]>([]);

  useEffect(() => {
    setName(commanderName() === "Commander" ? "" : commanderName());
    let cancelled = false;
    async function loadSavedMatches() {
      setLoadingMatches(true);
      try {
        const cards = await loadRememberedMatchCards();
        if (!cancelled) setSavedMatches(cards);
      } catch {
        if (!cancelled) setSavedMatches([]);
      } finally {
        if (!cancelled) setLoadingMatches(false);
      }
    }
    void loadSavedMatches();
    return () => {
      cancelled = true;
    };
  }, []);

  async function openMatch(matchId: string) {
    setOpeningId(matchId);
    setError("");
    try {
      const match = await enterLiveMatch(matchId);
      if (match.state.status === "finished") {
        clearActiveMatch(matchId);
        setSavedMatches((current) => current.filter((card) => card.id !== matchId));
        setError("That match is already over. Start a new one when you’re ready.");
        setOpeningId(null);
        return;
      }
      router.push(`/match/?id=${encodeURIComponent(match.id)}`);
    } catch (reason) {
      clearActiveMatch(matchId);
      setSavedMatches((current) => current.filter((card) => card.id !== matchId));
      setError(reason instanceof Error ? reason.message : "That saved room did not open.");
      setOpeningId(null);
    }
  }

  function removeMatch(matchId: string) {
    clearActiveMatch(matchId);
    setSavedMatches((current) => current.filter((card) => card.id !== matchId));
  }

  async function joinByCode(event: React.FormEvent) {
    event.preventDefault();
    if (code.replace(/\D/g, "").length !== 4) {
      setError("Enter the four numbers from your friend.");
      return;
    }
    setJoining(true);
    setError("");
    try {
      const chosenName = name.trim() || commanderName();
      rememberCommanderName(chosenName);
      const match = await joinLiveMatchByCode(code, chosenName);
      router.push(`/match/?id=${encodeURIComponent(match.id)}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "That room did not open.");
      setJoining(false);
    }
  }

  return (
    <main className="home-shell">
      <nav className="home-nav">
        <Brand />
        <a className="nav-link" href={withBasePath("/fleet-dice-v84.html#ref")}>
          How to play
        </a>
      </nav>

      <section className="hero-billboard" aria-label="Fleet Dice">
        <img
          alt="Fleet Dice — Build the fleet. Break the flagship."
          className="hero-key-art"
          height={640}
          src={KEY_ART}
          width={1024}
        />
        <p className="hero-support">
          Upgrade your ships. Hunt the straight. Decide what to risk.
        </p>
        <div className="hero-cta-row">
          <Link className="action-button light-action" href="/solo/">
            Start solo
            <span aria-hidden="true">→</span>
          </Link>
          <Link className="action-button red-action" href="/versus/">
            Create match
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {!loadingMatches && savedMatches.length ? (
        <section className="your-matches" aria-label="Your matches">
          <div className="your-matches-head">
            <p className="card-kicker">YOUR MATCHES</p>
            <h2>
              {savedMatches.length === 1
                ? "1 game in progress"
                : `${savedMatches.length} games in progress`}
            </h2>
            <p className="your-matches-hint">
              Jump between live rooms on this phone. Remove only forgets the
              shortcut — use Cancel game inside a match to end it for both players.
            </p>
          </div>
          <ul className="your-matches-list">
            {savedMatches.map((card) => (
              <li className="your-match-row" key={card.id}>
                <div className="your-match-copy">
                  <strong>
                    {card.enemyName
                      ? `${card.youName} vs ${card.enemyName}`
                      : `${card.youName} · waiting`}
                  </strong>
                  <span>
                    Game {card.code}
                    {card.status === "waiting" ? " · waiting for opponent" : ` · Round ${card.round}`}
                  </span>
                </div>
                <div className="your-match-actions">
                  <button
                    className="action-button light-action"
                    disabled={openingId === card.id}
                    onClick={() => removeMatch(card.id)}
                    type="button"
                  >
                    Remove
                  </button>
                  <button
                    className="action-button gold-action"
                    disabled={Boolean(openingId)}
                    onClick={() => openMatch(card.id)}
                    type="button"
                  >
                    {openingId === card.id ? "Opening…" : "Open"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mode-grid compact-modes" aria-label="Choose a match">
        <article className="mode-card solo-card compact-mode">
          <p className="card-kicker">SOLO COMMAND</p>
          <h2>Play the computer</h2>
          <p>The complete v84 game against AI on your phone.</p>
          <Link className="action-button light-action" href="/solo/">
            Start solo
          </Link>
        </article>

        <article className="mode-card versus-card compact-mode">
          <p className="card-kicker">VERSUS COMMAND</p>
          <h2>Challenge a friend</h2>
          <p>Private room, four-digit code, live rounds from any phone.</p>
          <Link className="action-button red-action" href="/versus/">
            Create match
          </Link>
        </article>
      </section>

      <section className="join-strip">
        <div>
          <p className="card-kicker">HAVE A GAME CODE?</p>
          <h2>Join your enemy</h2>
          <p className="join-hint">
            Like Jackbox: enter the four numbers your friend shows you. If you
            created the room, stay on your game tab instead.
          </p>
        </div>
        <form onSubmit={joinByCode}>
          <input
            aria-label="Commander name"
            autoComplete="nickname"
            maxLength={24}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            value={name}
          />
          <input
            aria-label="Four digit game code"
            className="code-input"
            inputMode="numeric"
            maxLength={4}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            placeholder="0000"
            value={code}
          />
          <button className="action-button blue-action" disabled={joining} type="submit">
            {joining ? "Opening…" : "Join match"}
          </button>
        </form>
        {error ? <p className="form-error">{error}</p> : null}
      </section>

      <LiveBattlesBoard />

      <footer className="home-footer">
        <p>No account to create. No app download. Your browser remembers you.</p>
        <span>2 commanders · private room · live rounds</span>
      </footer>
    </main>
  );
}
