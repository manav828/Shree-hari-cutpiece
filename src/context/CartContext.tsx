"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItemOption {
  group_id?: string;
  group_name: string;
  input_type: string;
  value_ids?: string[];
  value_labels?: string[];
  input_value?: string | number;
}

export interface CartItem {
  id: string;
  product_id?: string;
  variant_id?: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  meters: number;
  selling_mode: "meter" | "piece";
  selected_options?: CartItemOption[];
  options_key?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity" | "id" | "options_key"> & { id: string; meters: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, meters: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("shreehari-cart");
    if (savedCart) {
      const parsed = JSON.parse(savedCart) as CartItem[];
      const normalized = parsed.map((item) => ({
        ...item,
        selling_mode: item.selling_mode || "meter",
        selected_options: item.selected_options || [],
      }));
      setItems(normalized);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("shreehari-cart", JSON.stringify(items));
  }, [items]);

  const buildOptionsKey = (options?: CartItemOption[]) => {
    if (!options || options.length === 0) return "default";
    return options
      .map((opt) => {
        const keyName = opt.group_name || opt.group_id || "option";
        const values = opt.value_labels?.join("|") || "";
        const input = opt.input_value !== undefined && opt.input_value !== null ? String(opt.input_value) : "";
        return `${keyName}:${values || input}`;
      })
      .join(";");
  };

  const addToCart = (item: Omit<CartItem, "quantity" | "id" | "options_key"> & { id: string; meters: number }) => {
    const optionsKey = item.options_key || buildOptionsKey(item.selected_options);
    const lineId = `${item.id}::${optionsKey}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === lineId);
      if (existing) {
        return prev.map((i) =>
          i.id === lineId
            ? { ...i, meters: i.meters + item.meters, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, id: lineId, options_key: optionsKey, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, meters: number) => {
    if (meters < 1) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, meters } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.meters, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
