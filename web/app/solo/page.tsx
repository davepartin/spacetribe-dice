import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/Brand";
import { withBasePath } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Solo Command",
};

export default function SoloPage() {
  return (
    <main className="solo-shell">
      <div className="solo-header">
        <SiteHeader />
        <Link className="quiet-pill" href="/">
          EXIT SOLO
        </Link>
      </div>
      <iframe
        className="solo-game"
        src={withBasePath("/fleet-dice-v82.html")}
        title="Fleet Dice solo game"
      />
    </main>
  );
}
