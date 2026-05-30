import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const CART_KEY = "prisha-crafts-cart";

export interface CartItem {
  id: string;
  quantity: number;
  selectedVariant?: {
    id: string;
    name: string;
    options: Record<string, string>;
  };
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  addToCart: (productId: string, quantity?: number, selectedVariant?: any) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((productId: string, quantity: number = 1, selectedVariant?: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId && item.selectedVariant?.id === selectedVariant?.id);
      if (existing) {
        return prev.map((item) =>
          item.id === productId && item.selectedVariant?.id === selectedVariant?.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { id: productId, quantity, selectedVariant }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === productId && item.selectedVariant?.id === variantId)));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId && item.selectedVariant?.id === variantId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}
