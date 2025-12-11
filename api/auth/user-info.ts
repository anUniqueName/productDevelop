import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

/**
 * 获取当前登录用户信息
 * GET /api/auth/user-info
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({ 
        error: 'Server configuration missing',
        message: 'JWT_SECRET not configured'
      });
    }

    // 从 cookie 中获取 token
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ 
        error: 'Not authenticated',
        message: 'No authentication token found'
      });
    }

    // 验证 JWT token
    try {
      const decoded = jwt.verify(token, jwtSecret) as any;

      return res.status(200).json({
        user: {
          userId: decoded.userId,
          nick: decoded.nick,
          avatarUrl: decoded.avatarUrl,
          email: decoded.email,
        }
      });

    } catch (jwtError: any) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: jwtError.message
      });
    }

  } catch (error: any) {
    console.error('User Info Error:', error);
    return res.status(500).json({ 
      error: 'Failed to get user info', 
      message: error.message 
    });
  }
}

