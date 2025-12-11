import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

/**
 * 处理钉钉 OAuth 2.0 回调
 * POST /api/auth/dingtalk-callback
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
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    const clientId = process.env.DINGTALK_APP_KEY;
    const clientSecret = process.env.DINGTALK_APP_SECRET;
    const jwtSecret = process.env.JWT_SECRET;

    if (!clientId || !clientSecret || !jwtSecret) {
      return res.status(500).json({ 
        error: 'Server configuration missing',
        message: 'Please configure DINGTALK_APP_KEY, DINGTALK_APP_SECRET, and JWT_SECRET'
      });
    }

    // 步骤 1: 使用 code 获取 accessToken
    const tokenResponse = await fetch('https://api.dingtalk.com/v1.0/oauth2/userAccessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId,
        clientSecret,
        code,
        grantType: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(`Failed to get access token: ${JSON.stringify(error)}`);
    }

    const tokenData = await tokenResponse.json();
    const { accessToken, refreshToken, expireIn } = tokenData;

    // 步骤 2: 使用 accessToken 获取用户信息
    const userInfoResponse = await fetch('https://api.dingtalk.com/v1.0/contact/users/me', {
      method: 'GET',
      headers: {
        'x-acs-dingtalk-access-token': accessToken,
      }
    });

    if (!userInfoResponse.ok) {
      const error = await userInfoResponse.json();
      throw new Error(`Failed to get user info: ${JSON.stringify(error)}`);
    }

    const userInfo = await userInfoResponse.json();

    // 步骤 3: 生成 JWT token
    const jwtToken = jwt.sign(
      {
        userId: userInfo.unionId || userInfo.openId,
        nick: userInfo.nick,
        avatarUrl: userInfo.avatarUrl,
        mobile: userInfo.mobile,
        email: userInfo.email,
      },
      jwtSecret,
      { expiresIn: '7d' } // JWT 有效期 7 天
    );

    // 步骤 4: 设置 httpOnly cookie（安全）
    const cookie = serialize('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 天
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);

    // 返回用户信息（不包含敏感信息）
    return res.status(200).json({
      success: true,
      user: {
        userId: userInfo.unionId || userInfo.openId,
        nick: userInfo.nick,
        avatarUrl: userInfo.avatarUrl,
        email: userInfo.email,
      }
    });

  } catch (error: any) {
    console.error('DingTalk Callback Error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed', 
      message: error.message 
    });
  }
}

