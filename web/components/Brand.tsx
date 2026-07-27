import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`brand ${compact ? "brand-compact" : ""}`} href="/">
      <span>FLEET DICE</span>
      <small>ONLINE</small>
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
  return (
    <header className="site-header site-header-match">
      <Brand compact />
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
        {code ? <span className="quiet-pill header-code-pill">CODE {code}</span> : null}
      </div>
    </header>
  );
}
