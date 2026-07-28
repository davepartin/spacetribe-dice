"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "./Brand";
import { commanderName, firebaseConfigured, rememberCommanderName } from "@/lib/firebase";
import { enterLiveMatch, joinLiveMatch } from "@/lib/firebase-match";

export function JoinMatch() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id")?.trim() || "";
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(Boolean(matchId));
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!matchId || !firebaseConfigured) {
      setChecking(false);
      return;
    }

    (async () => {
      try {
        const existing = await enterLiveMatch(matchId);
        if (!cancelled) {
          router.replace(`/match/?id=${encodeURIComponent(existing.id)}`);
        }
      } catch {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [matchId, router]);

  async function join(event: React.FormEvent) {
    event.preventDefault();
    if (!matchId) {
      setError("This invite link is missing its room id.");
      return;
    }
    const chosenName = name.trim() || commanderName();
    setBusy(true);
    setError("");
    try {
      rememberCommanderName(chosenName);
      const match = await joinLiveMatch(matchId, chosenName);
      router.replace(`/match/?id=${encodeURIComponent(match.id)}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The battlefield did not open.");
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <main className="page-shell launcher-page">
        <SiteHeader />
        <section className="launcher-card enemy-launcher">
          <p className="eyebrow">OPENING YOUR ROOM</p>
          <h1>Checking this invite…</h1>
          <p>If you already created or joined this match, we will put you back in.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell launcher-page">
      <SiteHeader />
      <section className="launcher-card enemy-launcher">
        <div className="versus-mark small-versus" aria-hidden="true">
          <span>YOU</span>
          <b>VS</b>
          <span>ENEMY</span>
        </div>
        <p className="eyebrow">YOU HAVE BEEN CHALLENGED</p>
        <h1>Enter the battlefield.</h1>
        <p>
          Type the name your opponent will see, then join. If you are the one who
          created the room, go back to your original game tab instead — you are
          already in.
        </p>
        <form onSubmit={join}>
          <label htmlFor="join-commander">COMMANDER NAME</label>
          <input
            autoComplete="nickname"
            autoFocus
            id="join-commander"
            maxLength={24}
            onChange={(event) => setName(event.target.value)}
            placeholder="Commander"
            value={name}
          />
          <button
            className="action-button red-action full-action"
            disabled={busy || !firebaseConfigured}
            type="submit"
          >
            {busy ? "Entering…" : "Join match"}
          </button>
        </form>
        {!firebaseConfigured ? (
          <p className="form-error">This battlefield is not connected yet.</p>
        ) : null}
        {error ? <p className="form-error">{error}</p> : null}
      </section>
    </main>
  );
}
