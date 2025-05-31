import React, { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await api.getCurrentUser(storedToken);
          setUser(userData.user);
        } catch {
          setUser(null);
          setToken(null);
          await AsyncStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const { token, user } = await api.login(email, password);
    setToken(token);
    setUser(user);
    await AsyncStorage.setItem('token', token);
  };

  const register = async (email, password, displayName) => {
    const { token, user } = await api.register(email, password, displayName);
    setToken(token);
    setUser(user);
    await AsyncStorage.setItem('token', token);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('token');
  };

  return (
    <UserContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
