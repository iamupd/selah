import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Selah - 서울-안디옥교회 찬양팀",
  description: "서울-안디옥교회 찬양팀을 위한 간편한 콘티 관리 서비스",
  openGraph: {
    title: "Selah - 서울-안디옥교회 찬양팀",
    description: "서울-안디옥교회 찬양팀을 위한 간편한 콘티 관리 서비스",
    type: "website",
    images: [
      {
        url: "/selah.jpg",
        width: 1200,
        height: 630,
        alt: "Selah",
      },
    ],
  },
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
        <Navbar />
        {children}
      </body>
    </html>
  );
}
