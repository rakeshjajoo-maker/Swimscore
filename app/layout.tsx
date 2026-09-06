import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { getCurrentSwimmerId } from "@/lib/currentSwimmer";
import { SwimmerPicker } from "@/components/SwimmerPicker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwimScore",
  description: "Training and progress tracking for competitive swimmers",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [swimmers, currentId] = await Promise.all([
    prisma.swimmer.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getCurrentSwimmerId(),
  ]);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="bg-pool-700 text-white sticky top-0 z-10">
          <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between gap-3">
            <Link href="/" className="font-bold text-lg tracking-tight">
              🏊 SwimScore
            </Link>
            {swimmers.length > 0 && (
              <SwimmerPicker swimmers={swimmers} currentId={currentId} />
            )}
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
