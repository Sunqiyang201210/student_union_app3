'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/utils/storage';

interface User {
  username: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'student_union_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 检查登录状态
  const checkAuth = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const { user: storedUser, exp } = JSON.parse(stored);
        if (exp > Date.now()) {
          setUser(storedUser);
        } else {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 登录
  const login = async (username: string, password: string) => {
    try {
      const response = await api.login(username, password);
      
      if (response.code === 0 && response.data) {
        const userData = response.data.user || { username, name: username, role: 'admin' };
        const tokenData = response.data.token || '';
        
        // 保存登录状态
        const authData = {
          user: userData,
          token: tokenData,
          exp: Date.now() + 86400000, // 24小时后过期
        };
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        
        setUser(userData);
        return { success: true, message: '登录成功' };
      }
      
      return { success: false, message: response.message || '登录失败' };
    } catch (error) {
      console.error('登录失败:', error);
      return { success: false, message: '网络错误，请稍后重试' };
    }
  };

  // 退出登录
  const logout = async () => {
    try {
      await api.logout();
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
