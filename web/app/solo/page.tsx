import type { Metadata } from "next";
import Link from "next/link";
import { withBasePath } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Solo Command",
};

export default function SoloPage() {
  return (
    <main className="solo-shell">
      <div className="solo-topbar">
        <Link className="solo-exit" href="/">
          ← Exit solo
        </Link>
        <span className="solo-topbar-label">Solo Command</span>
      </div>
      <iframe
        className="solo-game"
        src={withBasePath("/fleet-dice-v84.html")}
        title="Fleet Dice solo game"
        allow="fullscreen"
      />
    </main>
  );
}
