import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Holdly - Decentralized Book Lending",
  description: "Lend and borrow books with STX deposits on Stacks blockchain",
  other: {
    "talentapp:project_verification":
      "edb62f28bd96473c1ca1aa7d9c3d4abc6be238ec2569c506af16eeab75e3a3f0ff46bca3c15ef6bab1cf2024d4d188b2c2abc9c3dd9535e3f3b5474cbf10e5f6",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
