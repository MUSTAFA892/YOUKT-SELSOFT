"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const google_1 = require("next/font/google");
require("./globals.css");
const AuthProvider_1 = require("@/components/AuthProvider");
const AccountSwitcher_1 = require("@/components/AccountSwitcher");
const geistSans = (0, google_1.Geist)({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});
const geistMono = (0, google_1.Geist_Mono)({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});
exports.metadata = {
    title: "YOUKT | Interactive Coding Platform",
    description: "A premium coding platform to test your skills.",
};
function RootLayout({ children, }) {
    return (<html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-neutral-950 text-neutral-50 selection:bg-indigo-500/30 flex flex-col`}>
        <AuthProvider_1.AuthProvider>
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
                <AccountSwitcher_1.AccountSwitcher />
              </div>
            </div>
          </header>
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider_1.AuthProvider>
      </body>
    </html>);
}
//# sourceMappingURL=layout.js.map