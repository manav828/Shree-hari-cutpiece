"use client";

import { ReactNode, useEffect } from "react";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export default function Providers({ children, activeTheme }: { children: ReactNode; activeTheme?: string }) {
  useEffect(() => {
    if (activeTheme) {
      const match = document.cookie.match(/(?:^|; )storefront_theme=([^;]*)/);
      const currentCookie = match ? match[1].replace(/"/g, "").trim().toLowerCase() : null;
      if (currentCookie !== activeTheme) {
        document.cookie = `storefront_theme=${activeTheme}; path=/; max-age=31536000; SameSite=Lax`;
      }
    }
  }, [activeTheme]);

  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
