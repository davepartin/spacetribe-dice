import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { HelpSheet } from "@/components/ReferenceSheets";

export const metadata: Metadata = {
  title: "How to Play",
  description:
    "Learn how to roll, build your fleet, score straights, and break the enemy flagship in Fleet Dice.",
};

export default function HowToPlayPage() {
  return (
    <main className="how-to-page">
      <header className="how-to-page-header">
        <Brand compact />
        <Link className="home-nav-button" href="/">
          Back home
        </Link>
      </header>

      <section
        className="reference-sheet reference-sheet-wide how-to-page-sheet"
        aria-label="Fleet Dice rules"
      >
        <HelpSheet flagLevel={1} standalone />
        <Link className="action-button blue-action full-action" href="/">
          Back to Fleet Dice home
        </Link>
      </section>
    </main>
  );
}
