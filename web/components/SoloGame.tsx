"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/Brand";
import { withBasePath } from "@/lib/paths";

export function SoloGame() {
  const router = useRouter();
  const [confirmQuit, setConfirmQuit] = useState(false);

  return (
    <main className="solo-shell">
      <header className="solo-topbar">
        <Brand compact />
        <div className="solo-topbar-actions">
          <button
            className="home-nav-button solo-quit-btn"
            onClick={() => setConfirmQuit(true)}
            type="button"
          >
            Quit game
          </button>
          <Link className="home-nav-button" href="/">
            Home
          </Link>
        </div>
      </header>

      <iframe
        className="solo-game"
        src={withBasePath("/fleet-dice-v87.html")}
        title="Fleet Dice solo game"
        allow="fullscreen"
      />

      {confirmQuit ? (
        <div
          className="confirm-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="solo-quit-title"
        >
          <div className="confirm-card">
            <p className="eyebrow">LEAVE THE FIELD</p>
            <h2 id="solo-quit-title">Quit this game?</h2>
            <p>Are you sure? Your current match will be lost.</p>
            <div className="confirm-actions">
              <button
                className="action-button red-action"
                onClick={() => router.push("/")}
                type="button"
              >
                Yes, quit to home
              </button>
              <button
                className="action-button outline-action"
                onClick={() => setConfirmQuit(false)}
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
