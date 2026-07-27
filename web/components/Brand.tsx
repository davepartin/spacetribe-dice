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
}: {
  round?: number;
  code?: string;
}) {
  return (
    <header className="site-header">
      <Brand compact />
      <div className="header-pills">
        {code ? <span className="quiet-pill">CODE {code}</span> : null}
        {round ? <span className="quiet-pill">ROUND {round}</span> : null}
      </div>
    </header>
  );
}
