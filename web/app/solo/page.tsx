import type { Metadata } from "next";
import { withBasePath } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Solo Command",
};

export default function SoloPage() {
  return (
    <main className="solo-shell">
      <iframe
        className="solo-game"
        src={withBasePath("/fleet-dice-v86.html")}
        title="Fleet Dice solo game"
        allow="fullscreen"
      />
    </main>
  );
}
