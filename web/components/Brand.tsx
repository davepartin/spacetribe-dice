import Link from "next/link";
import { withBasePath } from "@/lib/paths";

const KEY_ART = withBasePath("/fleet-dice-key-art.png");

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`brand ${compact ? "brand-compact" : ""}`} href="/">
      <img
        alt=""
        aria-hidden="true"
        className="brand-mark"
        height={40}
        src={KEY_ART}
        width={64}
      />
      <span className="brand-copy">
        <span>FLEET DICE</span>
        <small>ONLINE</small>
      </span>
    </Link>
  );
}

export function SiteHeader({
  round,
  code,
  onInstructions,
  onCosts,
}: {
  round?: number;
  code?: string;
  onInstructions?: () => void;
  onCosts?: () => void;
}) {
  const matchChrome = Boolean(code);
  return (
    <header className={`site-header ${matchChrome ? "site-header-match" : ""}`}>
      <Brand compact />
      {code ? (
        <div className="game-title" aria-label={`Game ${code}`}>
          <span className="game-title-label">Game</span>
          <strong className="game-title-code">{code}</strong>
        </div>
      ) : null}
      <div className="header-pills">
        {onCosts ? (
          <button className="header-ref-btn header-ref-costs" onClick={onCosts} type="button">
            Upgrade costs
          </button>
        ) : null}
        {onInstructions ? (
          <button className="header-ref-btn" onClick={onInstructions} type="button">
            Instructions
          </button>
        ) : null}
        {round ? <span className="quiet-pill">ROUND {round}</span> : null}
      </div>
    </header>
  );
}
