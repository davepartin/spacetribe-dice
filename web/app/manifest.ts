import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return {
    name: "Fleet Dice",
    short_name: "Fleet Dice",
    description: "Build a fleet of dice, chase straights, and break the enemy flagship.",
    start_url: base ? `${base}/` : "/",
    display: "standalone",
    background_color: "#080c18",
    theme_color: "#080c18",
    icons: [
      {
        src: `${base}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${base}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: `${base}/apple-touch-icon.png`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
