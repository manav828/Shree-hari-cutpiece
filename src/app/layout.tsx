import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import Providers from "@/components/Providers";
import { getActiveTheme, getDbActiveTheme } from "@/lib/theme";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activeTheme = await getActiveTheme();
  const dbTheme = await getDbActiveTheme();

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var dbTheme = ${JSON.stringify(dbTheme)};
                var match = document.cookie.match(/(?:^|; )storefront_theme=([^;]*)/);
                var currentCookie = match ? match[1].replace(/"/g, "").trim().toLowerCase() : null;
                if (currentCookie !== dbTheme) {
                  document.cookie = "storefront_theme=" + dbTheme + "; path=/; max-age=31536000; SameSite=Lax";
                  window.location.reload();
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans">
        <NextTopLoader color="#9f3f29" height={3} showSpinner={false} />
        <Providers activeTheme={activeTheme}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
