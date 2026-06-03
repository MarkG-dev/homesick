import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const pilat = localFont({
  src: [
    { path: "./fonts/PilatTest-Thin.otf", weight: "100" },
    { path: "./fonts/PilatTest-Light.otf", weight: "300" },
    { path: "./fonts/PilatTest-Book.otf", weight: "350" },
    { path: "./fonts/PilatTest-Regular.otf", weight: "400" },
    { path: "./fonts/PilatTest-Demi.otf", weight: "600" },
    { path: "./fonts/PilatTest-Bold.otf", weight: "700" },
    { path: "./fonts/PilatTest-Heavy.otf", weight: "800" },
    { path: "./fonts/PilatTest-Black.otf", weight: "900" },
  ],
  variable: "--font-pilat",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
  ?? "https://homesick.dev";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.homesick.dev"),
  title: {
    default: "Homesick",
    template: "%s — Homesick",
  },
  description: "building magical objects",
  icons: {
    icon: "/mask.png",
    apple: "/mask.png",
  },
  openGraph: {
    title: "Homesick",
    description: "building magical objects",
    type: "website",
    images: [{ url: "/og.png", width: 1600, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Homesick",
    description: "building magical objects",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pilat.variable} h-full overflow-hidden bg-black antialiased`}>
      <head>
        {/* Landing mask first — fires before any JS */}
        <link rel="preload" as="image" href="/maskbig.png" fetchPriority="high" />
        {/* Sheep video second — home screen plays immediately after Go Home */}
        <link rel="preload" as="video" href="/assets/hero-video.mp4" fetchPriority="high" />
      </head>
      <body className="h-full overflow-hidden overscroll-none bg-black flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
