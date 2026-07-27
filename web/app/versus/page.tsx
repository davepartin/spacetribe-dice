import type { Metadata } from "next";
import { VersusLauncher } from "@/components/VersusLauncher";

export const metadata: Metadata = {
  title: "Create a Versus Match",
};

export default function VersusPage() {
  return <VersusLauncher />;
}
