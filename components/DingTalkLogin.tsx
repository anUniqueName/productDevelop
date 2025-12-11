import React, { useState } from 'react';
import { getDingTalkLoginUrl } from '../services/authService';

const DingTalkLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取钉钉登录 URL
      const { authUrl, state } = await getDingTalkLoginUrl();

      // 保存 state 到 sessionStorage 用于验证
      sessionStorage.setItem('dingtalk_oauth_state', state);

      // 跳转到钉钉登录页面
      window.location.href = authUrl;

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || '登录失败，请重试');
      setLoading(false);
    }
  };

  return (
    <div className="dingtalk-login-container">
      <button
        onClick={handleLogin}
        disabled={loading}
        className="dingtalk-login-button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 24px',
          backgroundColor: '#0089FF',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = '#0077DD';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#0089FF';
        }}
      >
        {/* 钉钉图标 */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.5 16.5H7.5V15H16.5V16.5ZM16.5 13.5H7.5V12H16.5V13.5ZM16.5 10.5H7.5V9H16.5V10.5Z"
            fill="currentColor"
          />
        </svg>

        <span>{loading ? '登录中...' : '使用钉钉登录'}</span>
      </button>

      {error && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#FEE',
            color: '#C33',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default DingTalkLogin;

