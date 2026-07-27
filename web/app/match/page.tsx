import type { Metadata } from "next";
import { Suspense } from "react";
import { MatchGame } from "@/components/MatchGame";

export const metadata: Metadata = {
  title: "Live Match",
};

export default function MatchPage() {
  return (
    <Suspense
      fallback={
        <main className="page-shell">
          <p className="waiting-note">Opening battlefield…</p>
        </main>
      }
    >
      <MatchGame />
    </Suspense>
  );
}
