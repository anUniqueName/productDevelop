import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      window.location.reload(); // 刷新页面
    } catch (error) {
      console.error('Logout error:', error);
      alert('登出失败，请重试');
      setLoggingOut(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* 用户头像按钮 */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        {/* 头像 */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.nick}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#0089FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {user.nick?.charAt(0) || 'U'}
          </div>
        )}

        {/* 用户名 */}
        <span style={{ fontSize: '14px', fontWeight: '500' }}>
          {user.nick || '用户'}
        </span>

        {/* 下拉箭头 */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            transform: showMenu ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        >
          <path
            d="M7 10l5 5 5-5H7z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {showMenu && (
        <>
          {/* 遮罩层 */}
          <div
            onClick={() => setShowMenu(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
          />

          {/* 菜单内容 */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              minWidth: '200px',
              overflow: 'hidden',
              zIndex: 1000,
            }}
          >
            {/* 用户信息 */}
            <div
              style={{
                padding: '16px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                {user.nick}
              </div>
              {user.email && (
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {user.email}
                </div>
              )}
            </div>

            {/* 登出按钮 */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
                fontSize: '14px',
                color: loggingOut ? '#999' : '#FF4D4F',
                cursor: loggingOut ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loggingOut) {
                  e.currentTarget.style.backgroundColor = '#FFF1F0';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {loggingOut ? '登出中...' : '登出'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;

