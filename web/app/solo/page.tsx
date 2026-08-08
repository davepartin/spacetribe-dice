import type { Metadata } from "next";
import { SoloGame } from "@/components/SoloGame";

export const metadata: Metadata = {
  title: "Solo Command",
};

export default function SoloPage() {
  return <SoloGame />;
}
