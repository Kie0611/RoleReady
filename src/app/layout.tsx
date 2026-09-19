import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RoleReady",
    template: "%s | RoleReady",
  },
  description: "AI-powered mock interview simulator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "oklch(0.19 0.012 300)",
              color: "oklch(0.956 0.012 86)",
              border: "1px solid oklch(0.86 0.018 82)",
              borderRadius: "0.25rem",
              fontFamily: "Space Mono, monospace",
              fontSize: "12px",
            },
            success: {
              iconTheme: {
                primary: "oklch(0.43 0.105 145)",
                secondary: "oklch(0.956 0.012 86)",
              },
            },
            error: {
              iconTheme: {
                primary: "oklch(0.58 0.18 35)",
                secondary: "oklch(0.956 0.012 86)",
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}