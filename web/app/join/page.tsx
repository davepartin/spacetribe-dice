import type { Metadata } from "next";
import { Suspense } from "react";
import { JoinMatch } from "@/components/JoinMatch";

export const metadata: Metadata = {
  title: "Join a Match",
};

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <main className="page-shell launcher-page">
          <p className="waiting-note">Opening invite…</p>
        </main>
      }
    >
      <JoinMatch />
    </Suspense>
  );
}
