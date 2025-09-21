import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../api/authService';

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && token) {
      setUser(user);
    }
    setIsLoading(false);
  }, [token]);

const login = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login(userData);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      setUser(data);
      setToken(data.token);
      setIsLoading(false);
      return true;
    } catch (err) {
      // This part is crucial
      const message = err.response?.data?.message || 'Login failed.';
      console.error('Login Error:', err.response); // Log the full error
      setError(message);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.register(userData);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      setUser(data);
      setToken(data.token);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };
  
  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};