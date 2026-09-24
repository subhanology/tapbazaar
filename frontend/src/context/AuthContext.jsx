import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

/**
 * Provider component that wraps the application and manages global authentication state.
 * Automatically attempts to fetch the currently authenticated user on mount.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped by the provider
 * @returns {JSX.Element} The AuthProvider component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  /**
   * Registers a new user via the API and updates the local authentication state.
   * 
   * @param {Object} payload - User registration data (e.g., email, password)
   * @returns {Promise<Object>} The newly registered user object
   */
  const signup = async (payload) => {
    const res = await api.post('/auth/signup', payload);
    setUser(res.data.user);
    return res.data.user;
  };

  /**
   * Authenticates an existing user via the API and updates the local authentication state.
   * 
   * @param {Object} payload - User login credentials (e.g., email, password)
   * @returns {Promise<Object>} The authenticated user object
   */
  const signin = async (payload) => {
    const res = await api.post('/auth/signin', payload);
    setUser(res.data.user);
    return res.data.user;
  };

  /**
   * Signs the current user out, clearing the server session cookie and local state.
   * 
   * @returns {Promise<void>}
   */
  const signout = async () => {
    await api.post('/auth/signout');
    setUser(null);
  };

  /**
   * Manually updates the current user state within the context.
   * Useful for immediately reflecting profile changes (e.g., picture uploads) 
   * without requiring a full application reload or additional API fetch.
   * 
   * @param {Object} updatedUser - The updated user object to store in state
   */
  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, loading, signup, signin, signout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook providing access to the authentication context.
 * 
 * @returns {Object} The auth context containing user state and authentication methods
 */
export const useAuth = () => useContext(AuthContext);