import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { AccountSwitcher } from "@/components/AccountSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YOUKT | Interactive Coding Platform",
  description: "A premium coding platform to test your skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-neutral-950 text-neutral-50 selection:bg-indigo-500/30 flex flex-col`}
      >
        <AuthProvider>
          <header className="sticky top-0 z-50 shrink-0 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
            <div className="flex h-14 items-center justify-between px-6">
              <a href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
                <div className="h-6 w-6 rounded bg-indigo-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">YK</span>
                </div>
                <span className="font-bold tracking-tight text-lg text-white">YOUKT</span>
              </a>
              <div className="flex items-center gap-4">
                <a href="/" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">Build Assessment</a>
                <AccountSwitcher />
              </div>
            </div>
          </header>
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
