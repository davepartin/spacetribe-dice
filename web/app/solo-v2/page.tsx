import type { Metadata } from "next";
import { SoloGame } from "@/components/SoloGame";

export const metadata: Metadata = {
  title: "Fleet Dice 2",
};

export default function SoloV2Page() {
  return (
    <SoloGame
      gameSrc="/fleet-dice-2.html?v=2.06"
      title="Fleet Dice 2 prototype"
    />
  );
}
