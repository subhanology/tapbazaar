import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

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

  const signup = async (payload) => {
    const res = await api.post('/auth/signup', payload);
    setUser(res.data.user);
    return res.data.user;
  };

  const signin = async (payload) => {
    const res = await api.post('/auth/signin', payload);
    setUser(res.data.user);
    return res.data.user;
  };

  const signout = async () => {
    await api.post('/auth/signout');
    setUser(null);
  };

  // Lets pages like Account.jsx push a fresh user object (e.g. after a
  // profile picture upload) into context without a full refetch/reload.
  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, loading, signup, signin, signout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);