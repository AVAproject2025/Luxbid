import type { Metadata } from "next";
import Link from 'next/link'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import NotificationBell from "@/components/ui/notification-bell";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LuxBID - Luxury Auction Platform",
  description: "Discover and bid on the world's finest luxury watches, handbags, and jewelry. Secure, anonymous bidding with guaranteed authenticity.",
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
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <header className="border-b bg-white/80 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                    <span className="text-xl font-bold text-gray-900">LuxBID</span>
                  </div>
                  <nav className="hidden md:flex items-center space-x-8">
                    <Link href="/listings" className="text-gray-600 hover:text-gray-900 transition-colors">
                      Browse Items
                    </Link>
                    <Link href="/dashboard" className="text-gray-900 font-medium">
                      Dashboard
                    </Link>
                    <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                      Profile
                    </Link>
                  </nav>
                  <div className="flex items-center space-x-4">
                    <NotificationBell userId="current-user" />
                    <span className="text-sm text-gray-600">Welcome, John Doe</span>
                    <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </header>
            <main>
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
