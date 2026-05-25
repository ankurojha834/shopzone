import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartData, setCartData] = useState({ items: [], total: 0, count: 0 });

  const refreshCart = useCallback(async () => {
    try {
      const data = await api.getCart();
      setCartData(data);
    } catch (e) {
      console.error('Cart fetch failed:', e);
    }
  }, []);

  const addToCart = useCallback(async (productId) => {
    const data = await api.addToCart(productId);
    setCartData(data);
    return data;
  }, []);

  const updateItem = useCallback(async (productId, quantity) => {
    const data = await api.updateCartItem(productId, quantity);
    setCartData(data);
  }, []);

  const removeItem = useCallback(async (productId) => {
    const data = await api.removeFromCart(productId);
    setCartData(data);
  }, []);

  const placeOrder = useCallback(async () => {
    const order = await api.placeOrder();
    setCartData({ items: [], total: 0, count: 0 });
    return order;
  }, []);

  return (
    <CartContext.Provider value={{ cartData, refreshCart, addToCart, updateItem, removeItem, placeOrder }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
