"use client";

import { useEffect, useState } from "react";
import { firebaseConfigured } from "@/lib/firebase";
import { watchLiveBattles, type LiveBattleRow } from "@/lib/firebase-match";

export function LiveBattlesBoard() {
  const [rows, setRows] = useState<LiveBattleRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseConfigured) {
      setRows([]);
      return;
    }
    const stop = watchLiveBattles(
      (next) => {
        setRows(next);
        setError("");
      },
      (reason) => {
        setError(reason.message || "Could not load live battles.");
        setRows([]);
      },
    );
    return stop;
  }, []);

  const count = rows?.length ?? 0;
  const label =
    count === 0 ? "No matches live" : count === 1 ? "1 match live" : `${count} matches live`;

  return (
    <section className="live-board" aria-live="polite">
      <div className="live-board-head">
        <p className="card-kicker">NOW ON THE FIELD</p>
        <h2>{rows === null ? "Checking the field…" : label}</h2>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {rows && rows.length > 0 ? (
        <ul className="live-board-list">
          {rows.map((row) => (
            <li key={row.id}>
              {row.status === "waiting" || !row.guestName ? (
                <>
                  <span className="live-names">{row.hostName}</span>
                  <span className="live-meta">waiting for opponent</span>
                </>
              ) : (
                <>
                  <span className="live-names">
                    {row.hostName} <b>vs</b> {row.guestName}
                  </span>
                  <span className="live-meta">Round {row.round}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : rows ? (
        <p className="live-board-empty">Open a versus room and your names will appear here.</p>
      ) : null}
    </section>
  );
}
