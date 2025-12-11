import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serialize } from 'cookie';

/**
 * 用户登出
 * POST /api/auth/logout
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 清除 auth_token cookie
    const cookie = serialize('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // 立即过期
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error: any) {
    console.error('Logout Error:', error);
    return res.status(500).json({ 
      error: 'Logout failed', 
      message: error.message 
    });
  }
}

