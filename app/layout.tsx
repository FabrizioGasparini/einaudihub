import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import DevUserSwitcher from "@/components/DevUserSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import IntroAnimation from "@/components/IntroAnimation";

export const metadata: Metadata = {
  title: "EinaudiHUB",
  description: "HUB digitale per la vita scolastica quotidiana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
            <IntroAnimation />
          {children}
          <DevUserSwitcher />
        </Providers>
      </body>
    </html>
  );
}
