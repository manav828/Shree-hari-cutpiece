import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import Providers from "@/components/Providers";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shree Hari Cutpiece | Premium Fabric Per Meter",
  description: "Discover premium cutpiece fabrics at Shree Hari. Quality cotton, silk, georgette & more - sold per meter. Design your own outfits with our curated fabric collection.",
  keywords: ["fabric", "cutpiece", "cotton", "silk", "georgette", "rayon", "per meter", "Ahmedabad", "textile"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans">
        <NextTopLoader color="#9f3f29" height={3} showSpinner={false} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
