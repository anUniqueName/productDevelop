import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { handleDingTalkCallback } from '../services/authService';

const DingTalkCallback: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(false); // 防止重复处理

  useEffect(() => {
    // 如果已经处理过，直接返回
    if (processed) {
      return;
    }

    const processCallback = async () => {
      try {
        // 标记为已处理
        setProcessed(true);

        // 从 URL 获取 code 和 state
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (!code) {
          throw new Error('未获取到授权码');
        }

        console.log('[Callback] Processing authorization code...');

        // 验证 state（防止 CSRF 攻击）
        const savedState = sessionStorage.getItem('dingtalk_oauth_state');
        if (state && savedState && state !== savedState) {
          throw new Error('State 验证失败，请重新登录');
        }

        // 清除保存的 state
        sessionStorage.removeItem('dingtalk_oauth_state');

        // 调用后端 API 交换 token 并获取用户信息
        console.log('[Callback] Calling backend API...');
        const user = await handleDingTalkCallback(code);
        console.log('[Callback] User info received:', user);

        // 更新认证状态
        login(user);

        setStatus('success');

        // 1 秒后跳转到主页
        setTimeout(() => {
          onSuccess();
        }, 1000);

      } catch (err: any) {
        console.error('[Callback] Processing error:', err);
        setError(err.message || '登录失败');
        setStatus('error');
      }
    };

    processCallback();
  }, [processed]); // 只依赖 processed 状态

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {status === 'processing' && (
          <>
            <div
              style={{
                width: '60px',
                height: '60px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #0089FF',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px',
              }}
            />
            <h2 style={{ fontSize: '20px', marginBottom: '10px', color: '#333' }}>
              正在登录...
            </h2>
            <p style={{ fontSize: '14px', color: '#666' }}>
              请稍候，正在验证您的身份
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#52C41A',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  fill="white"
                />
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', marginBottom: '10px', color: '#333' }}>
              登录成功！
            </h2>
            <p style={{ fontSize: '14px', color: '#666' }}>
              即将跳转到主页...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#FF4D4F',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                  fill="white"
                />
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', marginBottom: '10px', color: '#333' }}>
              登录失败
            </h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
              {error}
            </p>
            {error?.includes('授权码已失效') && (
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '20px' }}>
                💡 提示：如果您已经看到主页，说明登录已成功，可以忽略此错误。
              </p>
            )}
            <button
              onClick={() => (window.location.href = '/')}
              style={{
                padding: '10px 24px',
                backgroundColor: '#0089FF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              返回首页
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DingTalkCallback;

