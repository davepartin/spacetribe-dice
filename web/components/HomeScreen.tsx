"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brand } from "./Brand";
import { LiveBattlesBoard } from "./LiveBattlesBoard";
import { RecentResultsBoard } from "./RecentResultsBoard";
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
  const [linkCopied, setLinkCopied] = useState(false);

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

  async function copyGameLink() {
    const url = "https://davepartin.github.io/spacetribe-dice/";
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setError("Could not copy the link. Select the address bar and copy it there.");
    }
  }

  return (
    <main className="home-shell home-shell-v2">
      <nav className="home-nav-v2" aria-label="Site">
        <Brand compact />
        <div className="home-nav-actions">
          <Link className="home-nav-button" href="/how-to-play/">
            How to play
          </Link>
          <button
            className="home-nav-button home-share-button"
            onClick={() => void copyGameLink()}
            type="button"
          >
            {linkCopied ? "Link copied" : "Share game"}
          </button>
        </div>
      </nav>

      <section className="home-hero-v2" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <p className="home-hero-kicker">FAST DICE-BUILDING COMBAT</p>
          <h1 id="home-title">
            Build the fleet.
            <span>Break the flagship.</span>
          </h1>
          <p className="home-hero-lead">
            Every die is a ship. Roll for attack, shields, and energy, then
            upgrade your fleet and hunt the perfect straight.
          </p>

          <div className="home-mode-actions">
            <Link className="home-mode-action home-mode-solo" href="/solo/">
              <span className="home-mode-topline">
                <span className="home-mode-label">Play solo</span>
                <span aria-hidden="true">→</span>
              </span>
              <small>Learn the fleet against the enemy AI.</small>
            </Link>
            <Link className="home-mode-action home-mode-versus" href="/versus/">
              <span className="home-mode-topline">
                <span className="home-mode-label">Battle a friend</span>
                <span aria-hidden="true">→</span>
              </span>
              <small>Create a private code and fight live.</small>
            </Link>
          </div>

          <ul className="home-hero-facts" aria-label="Game details">
            <li>1–2 commanders</li>
            <li>10–15 minutes</li>
            <li>No account</li>
          </ul>
        </div>

        <div className="home-hero-visual">
          <img
            alt="Fleet Dice ships and dice crossing a battlefield in space."
            className="home-hero-art"
            height={640}
            src={KEY_ART}
            width={1024}
          />
        </div>
      </section>

      {!loadingMatches && savedMatches.length ? (
        <section className="your-matches" aria-label="Your matches">
          <div className="your-matches-head">
            <p className="card-kicker">YOUR MATCHES</p>
            <h2>
              {savedMatches.length === 1
                ? "Your battle is waiting"
                : `${savedMatches.length} battles are waiting`}
            </h2>
            <p className="your-matches-hint">
              Open a saved seat on this device. Remove only forgets the
              shortcut; it does not end the match.
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
                    {card.status === "waiting"
                      ? " · waiting for opponent"
                      : ` · Round ${card.round}`}
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

      <section className="home-join-card" aria-labelledby="join-title">
        <header className="home-join-copy">
          <p className="card-kicker">HAVE A BATTLE CODE?</p>
          <h2 id="join-title">Join the fight.</h2>
          <p>
            Enter your display name and the four numbers from your friend. Your
            browser remembers your seat.
          </p>
        </header>
        <form className="home-join-form" onSubmit={joinByCode}>
          <input
            aria-label="Display name"
            autoComplete="nickname"
            maxLength={24}
            onChange={(event) => setName(event.target.value)}
            placeholder="Display name"
            value={name}
          />
          <div className="home-join-form-row">
            <input
              aria-label="Four digit game code"
              className="code-input"
              inputMode="numeric"
              maxLength={4}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, ""))
              }
              placeholder="0000"
              value={code}
            />
            <button
              className="action-button blue-action"
              disabled={joining}
              type="submit"
            >
              {joining ? "Opening…" : "Join match"}
            </button>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
        </form>
      </section>

      <LiveBattlesBoard />

      <RecentResultsBoard />

      <footer className="home-footer home-footer-v2">
        <p>Fleet Dice plays in your browser. Nothing to install.</p>
        <span>BUILD · RISK · STRIKE</span>
      </footer>
    </main>
  );
}
