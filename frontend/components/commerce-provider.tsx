"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";

type CartLine = { product: Product; quantity: number };
type CommerceState = {
  cart: CartLine[];
  wishlist: string[];
  cartCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  toggleWishlist: (slug: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "xvond-store-commerce-v1";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const CommerceContext = createContext<CommerceState | null>(null);

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let restoredCart: CartLine[] = [];
    let restoredWishlist: string[] = [];
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { cart?: CartLine[]; wishlist?: string[] };
        restoredCart = parsed.cart ?? [];
        restoredWishlist = parsed.wishlist ?? [];
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    queueMicrotask(() => {
      setCart(restoredCart);
      setWishlist(restoredWishlist);
      setHydrated(true);
    });
    void fetch(`${API_URL}/account/wishlist`, { credentials: "include" }).then(async (response) => {
      if (!response.ok) return;
      const remote = await response.json() as string[];
      const merged = [...new Set([...remote, ...restoredWishlist])];
      setWishlist(merged);
      for (const slug of restoredWishlist.filter((item) => !remote.includes(item))) {
        void fetch(`${API_URL}/account/wishlist`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_slug: slug }) });
      }
    });
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, wishlist }));
  }, [cart, wishlist, hydrated]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((line) => line.product.slug === product.slug);
      return existing
        ? current.map((line) => line.product.slug === product.slug ? { ...line, quantity: Math.min(line.quantity + quantity, 99) } : line)
        : [...current, { product, quantity: Math.max(1, quantity) }];
    });
  }, []);

  const removeFromCart = useCallback((slug: string) => setCart((current) => current.filter((line) => line.product.slug !== slug)), []);
  const updateQuantity = useCallback((slug: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(slug);
    setCart((current) => current.map((line) => line.product.slug === slug ? { ...line, quantity: Math.min(quantity, 99) } : line));
  }, [removeFromCart]);
  const toggleWishlist = useCallback((slug: string) => {
    const removing = wishlist.includes(slug);
    setWishlist((current) => removing ? current.filter((item) => item !== slug) : [...current, slug]);
    void fetch(`${API_URL}/account/wishlist${removing ? `/${encodeURIComponent(slug)}` : ""}`, {
      method: removing ? "DELETE" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: removing ? undefined : JSON.stringify({ product_slug: slug }),
    });
  }, [wishlist]);
  const clearCart = useCallback(() => setCart([]), []);
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const value = useMemo(() => ({ cart, wishlist, cartCount, addToCart, removeFromCart, updateQuantity, toggleWishlist, clearCart }), [cart, wishlist, cartCount, addToCart, removeFromCart, updateQuantity, toggleWishlist, clearCart]);

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const value = useContext(CommerceContext);
  if (!value) throw new Error("useCommerce must be used inside CommerceProvider");
  return value;
}
