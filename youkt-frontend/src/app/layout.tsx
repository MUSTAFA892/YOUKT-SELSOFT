import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import Script from "next/script";

import { ThemeProvider } from "@/components/theme-provider";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground selection:bg-primary selection:text-white flex flex-col`}
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
