import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DingTalkLogin from './components/DingTalkLogin';
import DingTalkCallback from './components/DingTalkCallback';
import UserProfile from './components/UserProfile';
import App from './App';

/**
 * 登录页面
 */
const LoginPage: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '48px',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Logo 或标题 */}
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          无限开发配置器
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '40px',
          }}
        >
          Design Configurator 2.0
        </p>

        {/* 登录按钮 */}
        <DingTalkLogin />

        {/* 说明文字 */}
        <p
          style={{
            fontSize: '12px',
            color: '#999',
            marginTop: '24px',
            lineHeight: '1.6',
          }}
        >
          使用钉钉账号登录以访问应用
          <br />
          首次登录将自动创建账户
        </p>
      </div>
    </div>
  );
};

/**
 * 主应用包装器（带认证）
 */
const AppWrapper: React.FC = () => {
  const { user, loading, login } = useAuth();
  const [isCallback, setIsCallback] = useState(false);

  // 开发模式：跳过认证
  const isDevMode = import.meta.env.VITE_DEV_MODE_SKIP_AUTH === 'true';

  useEffect(() => {
    // 开发模式：自动登录一个测试用户
    if (isDevMode && !user) {
      login({
        userId: 'dev-user-001',
        nick: '开发测试用户',
        avatarUrl: '',
        email: 'dev@test.com',
      });
    }

    // 检查是否是钉钉回调页面
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setIsCallback(true);
    }
  }, [isDevMode, user, login]);

  // 处理回调成功
  const handleCallbackSuccess = () => {
    // 清除 URL 参数
    window.history.replaceState({}, document.title, window.location.pathname);
    setIsCallback(false);
  };

  // 加载中
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 钉钉回调处理
  if (isCallback) {
    return <DingTalkCallback onSuccess={handleCallbackSuccess} />;
  }

  // 未登录 - 显示登录页面
  if (!user) {
    return <LoginPage />;
  }

  // 已登录 - 显示主应用（带用户信息）
  return (
    <div>
      {/* 顶部用户信息栏 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 9999,
          padding: '16px 24px',
        }}
      >
        <UserProfile />
      </div>

      {/* 主应用 */}
      <App />
    </div>
  );
};

/**
 * 带认证的应用入口
 */
const AppWithAuth: React.FC = () => {
  return (
    <AuthProvider>
      <AppWrapper />
    </AuthProvider>
  );
};

export default AppWithAuth;

