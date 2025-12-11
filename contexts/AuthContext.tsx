import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, logout as logoutService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化时检查用户登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (user: User) => {
    setUser(user);
    // 可选：保存到 localStorage 作为缓存
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = async () => {
    try {
      // 调用后端登出API
      await logoutService();

      // 清除用户状态
      setUser(null);

      // 清除所有本地存储的认证相关数据
      localStorage.removeItem('user');

      // 清除钉钉OAuth相关的sessionStorage
      sessionStorage.removeItem('dingtalk_oauth_state');

      // 可选:清除其他可能的缓存数据
      // localStorage.removeItem('customPromptConfig'); // 如果需要清除提示词配置

      console.log('[Auth] Logout successful, all local data cleared');
    } catch (error) {
      console.error('Logout error:', error);
      // 即使后端登出失败,也清除本地数据
      setUser(null);
      localStorage.removeItem('user');
      sessionStorage.removeItem('dingtalk_oauth_state');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

