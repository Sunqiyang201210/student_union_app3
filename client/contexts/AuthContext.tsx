import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  username: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@student_union_token';
const USER_KEY = '@student_union_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      const storedUser = await AsyncStorage.getItem(USER_KEY);
      
      if (storedToken && storedUser) {
        // 验证token是否过期
        try {
          const payload = JSON.parse(atob(storedToken));
          if (payload.exp > Date.now()) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // token过期，清除
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(USER_KEY);
          }
        } catch {
          await AsyncStorage.removeItem(TOKEN_KEY);
          await AsyncStorage.removeItem(USER_KEY);
        }
      }
    } catch (e) {
      console.log('Load auth failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const baseUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
    const url = `${baseUrl}/api/v1/auth/login`;
    
    // 重试机制：最多3次
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'bypass-tunnel-reminder': 'true'
          },
          body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (data.code === 0) {
          await AsyncStorage.setItem(TOKEN_KEY, data.data.token);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
          setToken(data.data.token);
          setUser(data.data.user);
          return { success: true, message: '登录成功' };
        } else {
          return { success: false, message: data.message || '登录失败' };
        }
      } catch (e) {
        console.log(`Login attempt ${attempt} failed:`, e);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 等待500ms后重试
        }
      }
    }
    
    return { success: false, message: '网络错误，请检查网络连接后重试' };
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    } catch (e) {
      console.log('Logout failed:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
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

export function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${useAuth().token}`,
    'Content-Type': 'application/json',
  };
}
