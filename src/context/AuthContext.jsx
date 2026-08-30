import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('supportflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('supportflow_token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Quick Demo User Switcher helper for hackathon demonstration
  const setDemoRole = (role) => {
    let demoUser;
    if (role === 'customer') {
      demoUser = {
        _id: 'user_cust_1',
        name: 'Sara Khan (Customer)',
        email: 'customer@demo.com',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
      };
    } else if (role === 'worker') {
      demoUser = {
        _id: 'user_work_1',
        name: 'Worker Ali (Tech Specialist)',
        email: 'worker@demo.com',
        role: 'worker',
        specialty: 'Technical',
        rating: 4.9,
        reviewCount: 24,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      };
    } else if (role === 'admin') {
      demoUser = {
        _id: 'user_admin_1',
        name: 'Supervisor Admin',
        email: 'admin@demo.com',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      };
    }
    setUser(demoUser);
    setToken('demo_token_' + role);
    localStorage.setItem('supportflow_user', JSON.stringify(demoUser));
    localStorage.setItem('supportflow_token', 'demo_token_' + role);
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token, ...userData } = res.data;
      setUser(userData);
      setToken(token);
      localStorage.setItem('supportflow_user', JSON.stringify(userData));
      localStorage.setItem('supportflow_token', token);
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/auth/register', formData);
      const { token, ...userData } = res.data;
      setUser(userData);
      setToken(token);
      localStorage.setItem('supportflow_user', JSON.stringify(userData));
      localStorage.setItem('supportflow_token', token);
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('supportflow_user');
    localStorage.removeItem('supportflow_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        setDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
