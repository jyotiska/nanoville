import type { Metadata } from "next";
import { DM_Sans, Forum, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const dmSans = DM_Sans({
  weight: "variable",
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const forum = Forum({
  weight: "400",
  variable: "--font-forum",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nanoville — Scenario Studio",
  description: "Pick a work problem, bring a team together, and agree on a next step.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${forum.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
