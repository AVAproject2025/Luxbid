import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import AppHeader from "@/components/layout/AppHeader";
import { I18nProvider } from "@/components/providers/I18nProvider";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LuxBID - Private Offers for Luxury Items",
  description: "List your luxury items and receive private offers. Accept the best one, then exchange contact details after commission payment.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <I18nProvider>
            <div className="min-h-screen bg-gradient-to-br from-luxbid-gold-50 to-white">
              <AppHeader />
              <main>
                {children}
              </main>
            </div>
          </I18nProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
