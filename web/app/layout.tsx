import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const siteOrigin = "https://davepartin.github.io/spacetribe-dice";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/spacetribe-dice";

export const viewport: Viewport = {
  themeColor: "#080c18",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "Fleet Dice",
    template: "%s · Fleet Dice",
  },
  description:
    "Build a fleet of dice, chase straights, and break the enemy flagship.",
  applicationName: "Fleet Dice",
  appleWebApp: {
    capable: true,
    title: "Fleet Dice",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: `${basePath}/favicon.svg`, type: "image/svg+xml" },
      { url: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" },
    ],
    shortcut: `${basePath}/favicon.svg`,
    apple: [{ url: `${basePath}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Fleet Dice",
    description:
      "Build a fleet of dice, chase straights, and break the enemy flagship.",
    type: "website",
    images: [
      {
        url: "/fleet-dice-key-art.png",
        width: 1024,
        height: 640,
        alt: "Fleet Dice — Build the fleet. Break the flagship.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fleet Dice",
    description:
      "Build a fleet of dice, chase straights, and break the enemy flagship.",
    images: ["/fleet-dice-key-art.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
