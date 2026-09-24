import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

// Guest cart identity, persisted across page loads until the guest logs in
const getGuestSessionId = () => {
  let id = localStorage.getItem('tapbazaar_guest_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('tapbazaar_guest_session_id', id);
  }
  return id;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  const guestHeaders = user ? {} : { 'x-guest-session-id': getGuestSessionId() };

const refreshCart = useCallback(async () => {
    try {
      const res = await api.get('/cart', { headers: guestHeaders });
      setCart(res.data.cart);
    } catch (err) {
      console.error("Cart fetch error:", err); // <-- Added this shield!
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshCart();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [refreshCart]);

  // BR-03: merge guest cart into the user's cart right after successful auth
  const mergeGuestCartIntoAccount = useCallback(async () => {
    const guestSessionId = localStorage.getItem('tapbazaar_guest_session_id');
    if (!guestSessionId) return;
    const res = await api.post('/cart/merge', { guestSessionId });
    setCart(res.data.cart);
    localStorage.removeItem('tapbazaar_guest_session_id');
  }, []);

  const addItem = async (productId, quantity = 1) => {
    const res = await api.post('/cart/items', { productId, quantity, guestSessionId: getGuestSessionId() }, { headers: guestHeaders });
    setCart(res.data.cart);
  };

  const updateItemQuantity = async (productId, quantity) => {
    const res = await api.put(`/cart/items/${productId}`, { quantity }, { headers: guestHeaders });
    setCart(res.data.cart);
  };

  const removeItem = async (productId) => {
    const res = await api.delete(`/cart/items/${productId}`, { headers: guestHeaders });
    setCart(res.data.cart);
  };

  return (
    <CartContext.Provider
      value={{ cart, loading, addItem, updateItemQuantity, removeItem, refreshCart, mergeGuestCartIntoAccount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
