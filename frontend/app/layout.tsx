import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { Toaster } from "sonner";
import HeaderWrapper from "@/components/HeaderWrapper";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
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
      <body className={`${playfair.variable} ${dmSans.variable}`}>
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(15, 15, 25, 0.95)",
              border: "1px solid rgba(212, 163, 82, 0.2)",
              color: "rgba(255,255,255,0.85)",
              fontFamily: "var(--font-dm-sans)",
              backdropFilter: "blur(12px)",
            },
          }}
        />
        <Providers>
          <HeaderWrapper />
          <main className="app-main">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
