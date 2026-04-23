import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: "Homesick",
  description: "Homesick",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pilat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black">{children}</body>
    </html>
  );
}
