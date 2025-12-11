/**
 * 认证服务
 * 处理所有与用户认证相关的 API 调用
 */

// 在开发环境使用本地 API，生产环境使用相对路径
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : '';

export interface User {
  userId: string;
  nick: string;
  avatarUrl?: string;
  email?: string;
}

/**
 * 获取钉钉登录 URL
 */
export const getDingTalkLoginUrl = async (): Promise<{ authUrl: string; state: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/dingtalk-login`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get login URL');
  }

  return response.json();
};

/**
 * 处理钉钉回调，交换 token
 */
export const handleDingTalkCallback = async (code: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/dingtalk-callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 重要：包含 cookie
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Authentication failed');
  }

  const data = await response.json();
  return data.user;
};

/**
 * 获取当前登录用户信息
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/user-info`, {
      credentials: 'include', // 重要：包含 cookie
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null; // 未登录
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user info');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * 登出
 */
export const logout = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include', // 重要：包含 cookie
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Logout failed');
  }
};

