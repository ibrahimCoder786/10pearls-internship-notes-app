// =============================================
// Context: Auth — Global login state
// =============================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AuthService from '../services/auth.service';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // App load pe token check karo
  useEffect(() => {
    const savedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    const savedUser  = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        // Corrupted data — clear karo
        localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      }
    }

    setLoading(false);
  }, []);

  // Login
  const login = useCallback(async (credentials) => {
    const response = await AuthService.login(credentials);
    const { user: userData, token: userToken } = response.data;

    localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, userToken);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(userData));

    setToken(userToken);
    setUser(userData);

    return response;
  }, []);

  // Signup
  const signup = useCallback(async (data) => {
    const response = await AuthService.signup(data);
    const { user: userData, token: userToken } = response.data;

    localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, userToken);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(userData));

    setToken(userToken);
    setUser(userData);

    return response;
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } finally {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      setToken(null);
      setUser(null);
    }
  }, []);

  // Update user state after profile edit
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
