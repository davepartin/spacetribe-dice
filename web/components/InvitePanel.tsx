"use client";

import { useMemo, useState } from "react";
import { absoluteAppUrl } from "@/lib/paths";

export function InvitePanel({
  matchId,
  code,
  onCancel,
  busy = false,
}: {
  matchId: string;
  code: string;
  onCancel?: () => void;
  busy?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const url = useMemo(
    () => absoluteAppUrl(`/join/?id=${encodeURIComponent(matchId)}&code=${encodeURIComponent(code)}`),
    [matchId, code],
  );
  const message = `Join my Fleet Dice match. Game code ${code}: ${url}`;

  async function copyInvite() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function shareInvite() {
    if (navigator.share) {
      await navigator.share({
        title: "Fleet Dice match",
        text: `Join my Fleet Dice match. Game code ${code}.`,
        url,
      });
      return;
    }
    await copyInvite();
  }

  return (
    <section className="invite-panel">
      <div className="signal" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <p className="eyebrow">PRIVATE ROOM OPEN</p>
      <h1>Waiting for the Enemy.</h1>
      <p>
        <b>Stay on this page</b> — you are already in the game. Send the link or
        the four numbers to your friend. Only they should open the invite.
      </p>
      <div className="room-code" aria-label={`Game code ${code}`}>
        {code.split("").map((number, index) => (
          <span key={`${number}-${index}`}>{number}</span>
        ))}
      </div>
      <div className="invite-actions">
        <button className="action-button red-action" onClick={shareInvite}>
          Share invite
        </button>
        <button className="action-button outline-action" onClick={copyInvite}>
          {copied ? "Copied" : "Copy link + code"}
        </button>
        <a
          className="action-button outline-action"
          href={`sms:?&body=${encodeURIComponent(message)}`}
        >
          Text invite
        </a>
        {onCancel ? (
          <button
            className="action-button outline-action"
            disabled={busy}
            onClick={onCancel}
            type="button"
          >
            Cancel game
          </button>
        ) : null}
      </div>
      <p className="waiting-note">
        Keep this page open. When your friend joins with the code, the battle starts here automatically.
      </p>
    </section>
  );
}
