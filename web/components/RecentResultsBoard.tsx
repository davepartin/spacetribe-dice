"use client";

import { useEffect, useState } from "react";
import { firebaseConfigured } from "@/lib/firebase";
import {
  watchRecentBattleResults,
  type BattleResultRow,
} from "@/lib/firebase-match";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

export function RecentResultsBoard() {
  const [expanded, setExpanded] = useState(false);
  const [rows, setRows] = useState<BattleResultRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!expanded || !firebaseConfigured) return;
    return watchRecentBattleResults(
      (next) => {
        setRows(next);
        setError("");
      },
      (reason) => {
        setError(reason.message || "Could not load recent results.");
        setRows([]);
      },
    );
  }, [expanded]);

  function toggleResults() {
    if (!firebaseConfigured) {
      setError("Recent results are unavailable until Firebase is configured.");
    }
    setExpanded((current) => !current);
  }

  return (
    <section className="recent-results" aria-labelledby="recent-results-title">
      <button
        aria-controls="recent-results-list"
        aria-expanded={expanded}
        className="recent-results-toggle"
        onClick={toggleResults}
        type="button"
      >
        <span className="recent-results-heading">
          <span className="card-kicker">RECENT RESULTS</span>
          <strong id="recent-results-title">Winners from the last 30 days</strong>
        </span>
        <span className="recent-results-action">
          {expanded ? "Hide results" : "Show results"}
          <span aria-hidden="true">{expanded ? "↑" : "↓"}</span>
        </span>
      </button>

      {expanded ? (
        <div aria-live="polite" className="recent-results-body" id="recent-results-list">
          {error ? <p className="form-error">{error}</p> : null}
          {rows === null && !error ? (
            <p className="recent-results-empty">Loading completed battles…</p>
          ) : null}
          {rows && rows.length > 0 ? (
            <ul className="recent-results-list">
              {rows.map((row) => (
                <li key={row.id}>
                  <span className="recent-result-names">
                    <strong>{row.winnerName}</strong>
                    <span>defeated {row.loserName}</span>
                  </span>
                  <time dateTime={row.finishedAt.toISOString()}>
                    {dateFormatter.format(row.finishedAt)}
                  </time>
                </li>
              ))}
            </ul>
          ) : rows && !error ? (
            <p className="recent-results-empty">No completed versus battles in the last 30 days.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
