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
  rememberedActiveMatch,
} from "@/lib/firebase-match";
import { withBasePath } from "@/lib/paths";

const KEY_ART = withBasePath("/fleet-dice-key-art.png");

export function HomeScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");
  const [savedMatchId, setSavedMatchId] = useState<string | null>(null);

  useEffect(() => {
    setName(commanderName() === "Commander" ? "" : commanderName());
    let cancelled = false;
    async function loadSavedMatch() {
      const id = rememberedActiveMatch();
      if (!id) {
        if (!cancelled) setSavedMatchId(null);
        return;
      }
      try {
        const match = await enterLiveMatch(id);
        if (cancelled) return;
        if (match.state.status === "finished") {
          clearActiveMatch(id);
          setSavedMatchId(null);
          return;
        }
        setSavedMatchId(id);
      } catch {
        if (!cancelled) {
          clearActiveMatch(id);
          setSavedMatchId(null);
        }
      }
    }
    void loadSavedMatch();
    return () => {
      cancelled = true;
    };
  }, []);

  async function resumeMatch() {
    if (!savedMatchId) return;
    setResuming(true);
    setError("");
    try {
      const match = await enterLiveMatch(savedMatchId);
      if (match.state.status === "finished") {
        clearActiveMatch(savedMatchId);
        setSavedMatchId(null);
        setError("That match is already over. Start a new one when you’re ready.");
        setResuming(false);
        return;
      }
      router.push(`/match/?id=${encodeURIComponent(match.id)}`);
    } catch (reason) {
      setSavedMatchId(null);
      setError(reason instanceof Error ? reason.message : "That saved room did not open.");
      setResuming(false);
    }
  }

  function quitSavedMatch() {
    if (!savedMatchId) return;
    setClearing(true);
    clearActiveMatch(savedMatchId);
    setSavedMatchId(null);
    setClearing(false);
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
        <a className="nav-link" href={withBasePath("/fleet-dice-v83.html#ref")}>
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

      {savedMatchId ? (
        <section className="resume-strip">
          <div>
            <p className="card-kicker">PICK UP WHERE YOU LEFT OFF</p>
            <h2>Return to your match</h2>
          </div>
          <div className="resume-actions">
            <button
              className="action-button light-action"
              disabled={clearing || resuming}
              onClick={quitSavedMatch}
              type="button"
            >
              Quit game
            </button>
            <button
              className="action-button gold-action"
              disabled={resuming || clearing}
              onClick={resumeMatch}
              type="button"
            >
              {resuming ? "Opening…" : "Continue match"}
            </button>
          </div>
        </section>
      ) : null}

      <section className="mode-grid compact-modes" aria-label="Choose a match">
        <article className="mode-card solo-card compact-mode">
          <p className="card-kicker">SOLO COMMAND</p>
          <h2>Play the computer</h2>
          <p>The complete v83 game against AI on your phone.</p>
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
