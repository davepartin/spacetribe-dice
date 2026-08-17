"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "./Brand";
import { commanderName, firebaseConfigured, rememberCommanderName } from "@/lib/firebase";
import { createLiveMatch } from "@/lib/firebase-match";
import { withBasePath } from "@/lib/paths";

export function VersusLauncher() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function createRoom(event: React.FormEvent) {
    event.preventDefault();
    const chosenName = name.trim() || commanderName();
    setBusy(true);
    setError("");
    try {
      rememberCommanderName(chosenName);
      const result = await createLiveMatch(chosenName);
      router.push(`/match/?id=${encodeURIComponent(result.match.id)}`);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "The room could not be created.";
      if (/insufficient permissions|permission-denied/i.test(message)) {
        setError(
          "Firebase blocked creating the room. Confirm Anonymous Auth is enabled and firestore.rules are deployed to space-tribes.",
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
      <section className="launcher-card">
        <img
          alt=""
          aria-hidden="true"
          className="launcher-key-art"
          height={640}
          src={withBasePath("/fleet-dice-key-art.png")}
          width={1024}
        />
        <p className="eyebrow">VERSUS COMMAND</p>
        <h1>Open a private battlefield.</h1>
        <p>
          Pick a display name for this match. We’ll make a four-number code for
          your friend. Stay on this phone — that’s how you get back into your seat.
          If you already have an empty room waiting, this closes it and opens a new one.
        </p>
        <form onSubmit={createRoom}>
          <label htmlFor="commander">DISPLAY NAME</label>
          <input
            autoComplete="nickname"
            autoFocus
            id="commander"
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
            {busy ? "Opening room…" : "Create private match"}
          </button>
        </form>
        {!firebaseConfigured ? (
          <p className="form-error">
            The live battlefield is being connected to Firebase.
          </p>
        ) : null}
        {error ? <p className="form-error">{error}</p> : null}
        <div className="trust-row">
          <span>NO ACCOUNT</span>
          <span>PRIVATE CODE</span>
          <span>PHONE READY</span>
        </div>
      </section>
    </main>
  );
}
