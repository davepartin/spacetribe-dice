import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteOrigin = "https://davepartin.github.io/spacetribe-dice";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/spacetribe-dice";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "Fleet Dice",
    template: "%s · Fleet Dice",
  },
  description:
    "Build a fleet of dice, chase straights, and break the enemy flagship.",
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
  openGraph: {
    title: "Fleet Dice",
    description:
      "Build a fleet of dice, chase straights, and break the enemy flagship.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1733,
        height: 908,
        alt: "Fleet Dice — Build the fleet. Break the flagship.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fleet Dice",
    description:
      "Build a fleet of dice, chase straights, and break the enemy flagship.",
    images: ["/og.png"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
