import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "찬양 콘티 관리",
  description: "찬양인도자를 위한 콘티 공유 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${inter.variable} ${mono.variable} antialiased`}
      >
        <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex h-14 md:h-16 items-center justify-between">
              <Link href="/dashboard" className="text-lg md:text-xl font-bold text-blue-600">
                Selah
              </Link>
              <div className="flex gap-3 md:gap-4">
                <Link
                  href="/songs"
                  className="text-xs md:text-sm font-medium text-gray-700 hover:text-blue-600 active:text-blue-700"
                >
                  악보
                </Link>
                <Link
                  href="/setlists"
                  className="text-xs md:text-sm font-medium text-gray-700 hover:text-blue-600 active:text-blue-700"
                >
                  콘티
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
