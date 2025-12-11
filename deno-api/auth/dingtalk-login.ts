/**
 * 生成钉钉 OAuth 2.0 登录 URL (Deno 版本)
 * GET /api/auth/dingtalk-login
 */

export async function handleDingTalkLogin(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const clientId = Deno.env.get("DINGTALK_APP_KEY");
    const redirectUri = Deno.env.get("DINGTALK_REDIRECT_URI");

    if (!clientId || !redirectUri) {
      return new Response(
        JSON.stringify({
          error: "DingTalk configuration missing",
          message: "Please configure DINGTALK_APP_KEY and DINGTALK_REDIRECT_URI",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 生成随机 state 用于防止 CSRF 攻击
    const state = crypto.randomUUID();

    // 构造钉钉 OAuth 2.0 授权 URL
    const authUrl = new URL("https://login.dingtalk.com/oauth2/auth");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("scope", "openid");
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("prompt", "login"); // 强制重新登录,允许切换账号

    return new Response(
      JSON.stringify({
        authUrl: authUrl.toString(),
        state,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("DingTalk Login URL Generation Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate login URL",
        message: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

