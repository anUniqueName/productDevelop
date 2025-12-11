import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * 生成钉钉 OAuth 2.0 登录 URL
 * GET /api/auth/dingtalk-login
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
    const clientId = process.env.DINGTALK_APP_KEY;
    const redirectUri = process.env.DINGTALK_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return res.status(500).json({ 
        error: 'DingTalk configuration missing',
        message: 'Please configure DINGTALK_APP_KEY and DINGTALK_REDIRECT_URI in environment variables'
      });
    }

    // 生成随机 state 用于防止 CSRF 攻击
    const state = Math.random().toString(36).substring(2, 15);

    // 构造钉钉 OAuth 2.0 授权 URL
    const authUrl = new URL('https://login.dingtalk.com/oauth2/auth');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('scope', 'openid');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('prompt', 'consent');

    return res.status(200).json({
      authUrl: authUrl.toString(),
      state
    });

  } catch (error: any) {
    console.error('DingTalk Login URL Generation Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate login URL', 
      message: error.message 
    });
  }
}

