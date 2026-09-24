import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

/**
 * Retrieves an existing guest session ID from local storage or 
 * generates a new UUID if one does not exist. This identifies unauthenticated users.
 * 
 * @returns {string} The guest session ID
 */
const getGuestSessionId = () => {
  let id = localStorage.getItem('tapbazaar_guest_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('tapbazaar_guest_session_id', id);
  }
  return id;
};

/**
 * Provider component that manages global cart state, supporting both authenticated users 
 * and persistent guest sessions.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped by the provider
 * @returns {JSX.Element} The CartProvider component
 */
export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  const guestHeaders = user ? {} : { 'x-guest-session-id': getGuestSessionId() };

  /**
   * Fetches the current cart data from the server.
   * Automatically utilizes the guest session ID in headers if the user is unauthenticated.
   */
  const refreshCart = useCallback(async () => {
    try {
      const res = await api.get('/cart', { headers: guestHeaders });
      setCart(res.data.cart);
    } catch (err) {
      console.error("Cart fetch error:", err);
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

  /**
   * Merges an existing guest cart into the user's persistent account cart upon successful authentication.
   * Cleans up the local guest session identifier afterward.
   */
  const mergeGuestCartIntoAccount = useCallback(async () => {
    const guestSessionId = localStorage.getItem('tapbazaar_guest_session_id');
    if (!guestSessionId) return;
    
    const res = await api.post('/cart/merge', { guestSessionId });
    setCart(res.data.cart);
    localStorage.removeItem('tapbazaar_guest_session_id');
  }, []);

  /**
   * Adds a specified product to the cart or increments its quantity if it already exists.
   * 
   * @param {string} productId - The ID of the product to add
   * @param {number} [quantity=1] - The amount to add
   */
  const addItem = async (productId, quantity = 1) => {
    const res = await api.post('/cart/items', { productId, quantity, guestSessionId: getGuestSessionId() }, { headers: guestHeaders });
    setCart(res.data.cart);
  };

  /**
   * Updates the exact quantity of a specific product already residing in the cart.
   * 
   * @param {string} productId - The ID of the product to update
   * @param {number} quantity - The new quantity value
   */
  const updateItemQuantity = async (productId, quantity) => {
    const res = await api.put(`/cart/items/${productId}`, { quantity }, { headers: guestHeaders });
    setCart(res.data.cart);
  };

  /**
   * Completely removes a specific product from the cart.
   * 
   * @param {string} productId - The ID of the product to remove
   */
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

/**
 * Custom hook providing access to the cart context.
 * 
 * @returns {Object} The cart context containing cart state and interaction methods
 */
export const useCart = () => useContext(CartContext);