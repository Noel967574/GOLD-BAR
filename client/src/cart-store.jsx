import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'aurelia-cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function add(product) {
    setItems((current) => {
      const found = current.find((item) => item.product.id === product.id);
      if (found) return current.map((item) => item.product.id === product.id
        ? { ...item, quantity: Math.min(10, item.quantity + 1) }
        : item);
      return [...current, { product, quantity: 1 }];
    });
  }

  function setQuantity(id, quantity) {
    if (quantity < 1) {
      setItems((current) => current.filter((item) => item.product.id !== id));
      return;
    }
    setItems((current) => current.map((item) => item.product.id === id
      ? { ...item, quantity: Math.min(10, quantity) }
      : item));
  }

  const value = useMemo(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalCents: items.reduce((sum, item) => sum + item.product.price_cents * item.quantity, 0),
    add,
    setQuantity,
    clear: () => setItems([])
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
