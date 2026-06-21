import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import NavbarLinks from "@/components/NavbarLinks";
import Script from "next/script";

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
        className={`${inter.variable} antialiased min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 flex flex-col`}
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <Script
          id="suppress-metamask-errors"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var originalError = window.console.error;
                window.console.error = function() {
                  var msg = arguments[0];
                  if (msg && (typeof msg === 'string' && (msg.indexOf('MetaMask') !== -1 || msg.indexOf('chrome-extension://') !== -1 || msg.indexOf('nkbihfbeogaeaoehlefnkodbefgpgknn') !== -1))) {
                    return;
                  }
                  originalError.apply(window.console, arguments);
                };
                window.addEventListener('error', function(event) {
                  if (event.filename && (event.filename.indexOf('chrome-extension://') !== -1 || event.filename.indexOf('MetaMask') !== -1)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                  if (event.message && (event.message.indexOf('MetaMask') !== -1 || event.message.indexOf('chrome-extension') !== -1)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(event) {
                  if (event.reason && (
                    (event.reason.stack && event.reason.stack.indexOf('chrome-extension://') !== -1) ||
                    (event.reason.message && event.reason.message.indexOf('MetaMask') !== -1)
                  )) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);
              })();
            `
          }}
        />
        <AuthProvider>
          {/* Premium Glassmorphism Header */}
          <header className="sticky top-0 z-50 shrink-0 border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl">
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
              <NavbarLinks />
            </div>
          </header>
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
