import type { Metadata } from "next";
import { VersusLauncher } from "@/components/VersusLauncher";

export const metadata: Metadata = {
  title: "Create a Fleet Dice 2 Match",
};

export default function VersusV2Page() {
  return <VersusLauncher ruleset="v2" />;
}
