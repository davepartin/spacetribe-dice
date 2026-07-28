import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fleet Dice",
    short_name: "Fleet Dice",
    description: "Build a fleet of dice, chase straights, and break the enemy flagship.",
    start_url: "/",
    display: "standalone",
    background_color: "#080c18",
    theme_color: "#080c18",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
