"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brand } from "./Brand";
import { LiveBattlesBoard } from "./LiveBattlesBoard";
import { commanderName, rememberCommanderName } from "@/lib/firebase";
import { joinLiveMatchByCode } from "@/lib/firebase-match";
import { withBasePath } from "@/lib/paths";

export function HomeScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

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

      <section className="hero">
        <p className="eyebrow">A DICE-BUILDING BATTLE</p>
        <h1>
          BUILD THE FLEET.
          <br />
          <span>BREAK THE FLAGSHIP.</span>
        </h1>
        <p className="hero-copy">
          Upgrade your ships. Hunt the straight. Decide what to risk—and when
          to put your fleet in the line of fire.
        </p>
      </section>

      <section className="mode-grid" aria-label="Choose a match">
        <article className="mode-card solo-card">
          <div className="mode-art" aria-hidden="true">
            <span className="mini-die d4">4</span>
            <span className="mini-die flag-die">3</span>
            <span className="mini-die d8">8</span>
          </div>
          <p className="card-kicker">PLAY NOW</p>
          <h2>Solo Command</h2>
          <p>Build your fleet against the computer. The complete v83 game.</p>
          <Link className="action-button light-action" href="/solo/">
            Start solo
            <span aria-hidden="true">→</span>
          </Link>
        </article>

        <article className="mode-card versus-card">
          <div className="versus-mark" aria-hidden="true">
            <span>YOU</span>
            <b>VS</b>
            <span>ENEMY</span>
          </div>
          <p className="card-kicker">PRIVATE MATCH</p>
          <h2>Versus Command</h2>
          <p>Create a room, text the invite, and play together from any phone.</p>
          <Link className="action-button red-action" href="/versus/">
            Create match
            <span aria-hidden="true">→</span>
          </Link>
        </article>
      </section>

      <section className="join-strip">
        <div>
          <p className="card-kicker">HAVE A GAME CODE?</p>
          <h2>Join your enemy</h2>
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
