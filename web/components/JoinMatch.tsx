"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "./Brand";
import { commanderName, firebaseConfigured, rememberCommanderName } from "@/lib/firebase";
import { enterLiveMatch, joinLiveMatch } from "@/lib/firebase-match";
import { withBasePath } from "@/lib/paths";

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
          <img
            alt=""
            aria-hidden="true"
            className="launcher-key-art"
            height={640}
            src={withBasePath("/fleet-dice-key-art.png")}
            width={1024}
          />
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
        <img
          alt=""
          aria-hidden="true"
          className="launcher-key-art"
          height={640}
          src={withBasePath("/fleet-dice-key-art.png")}
          width={1024}
        />
        <p className="eyebrow">YOU HAVE BEEN CHALLENGED</p>
        <h1>Enter the battlefield.</h1>
        <p>
          Pick a display name your opponent will see, then join with this invite.
          The name is only a label. If you created the room, go to Your matches on
          that same phone instead — joining here can look like a third player.
        </p>
        <form onSubmit={join}>
          <label htmlFor="join-commander">DISPLAY NAME</label>
          <input
            autoComplete="nickname"
            autoFocus
            id="join-commander"
            maxLength={24}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name on the board"
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
