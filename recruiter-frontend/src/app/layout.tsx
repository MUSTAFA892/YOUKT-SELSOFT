import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { AccountSwitcher } from "@/components/AccountSwitcher";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YOUKT | Recruiter Portal",
  description: "A premium assessment management platform for recruiters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased min-h-screen bg-black text-white selection:bg-indigo-500/30 flex flex-col`}
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <AuthProvider>
          {/* Premium Glassmorphism Header */}
          <header className="sticky top-0 z-50 shrink-0 border-b border-white/10 bg-black/60 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-8 max-w-7xl mx-auto w-full">
              {/* Logo */}
              <a href="/" className="flex items-center gap-3 group">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                  <span className="text-white font-black text-sm">YK</span>
                </div>
                <span className="font-bold tracking-tight text-xl text-white">
                  YOUKT
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Recruiter
                  </span>
                </span>
              </a>

              {/* Nav Links */}
              <nav className="flex items-center gap-1">
                <a
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all"
                >
                  <span>⚡</span> Build Assessment
                </a>
                <a
                  href="/reports"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all"
                >
                  <span>🏆</span> Reports
                </a>
                <a
                  href="/candidates"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                >
                  <span>👥</span> Candidates
                </a>
                <div className="ml-3 pl-3 border-l border-white/10">
                  <AccountSwitcher />
                </div>
              </nav>
            </div>
          </header>
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

