"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SiteHeader } from "./Brand";
import { commanderName, firebaseConfigured, rememberCommanderName } from "@/lib/firebase";
import { joinLiveMatch } from "@/lib/firebase-match";

export function JoinMatch() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id")?.trim() || "";
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
      const message = reason instanceof Error ? reason.message : "The battlefield did not open.";
      if (/insufficient permissions|permission-denied/i.test(message)) {
        setError(
          "Firebase blocked joining this room. The host’s phase changes when you join, and the old security rules rejected that. Deploy the updated firestore.rules, then try again.",
        );
      } else {
        setError(message);
      }
      setBusy(false);
    }
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
          Choose the name your opponent will see. Your browser remembers this
          match—there is no account or password.
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
