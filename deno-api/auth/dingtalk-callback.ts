/**
 * 处理钉钉 OAuth 2.0 回调 (Deno 版本)
 * POST /api/auth/dingtalk-callback
 */

import { create } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

export async function handleDingTalkCallback(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return new Response(
        JSON.stringify({ error: "Missing authorization code" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const clientId = Deno.env.get("DINGTALK_APP_KEY");
    const clientSecret = Deno.env.get("DINGTALK_APP_SECRET");
    const jwtSecret = Deno.env.get("JWT_SECRET");

    if (!clientId || !clientSecret || !jwtSecret) {
      return new Response(
        JSON.stringify({ error: "Server configuration missing" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 1: 交换 code 获取 accessToken
    console.log("[DingTalk] Exchanging code for access token...");
    const tokenResponse = await fetch(
      "https://api.dingtalk.com/v1.0/oauth2/userAccessToken",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientSecret,
          code,
          grantType: "authorization_code",
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[DingTalk] Token Error:", errorText);

      // 解析错误信息
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      // 如果是授权码已使用的错误，返回更友好的提示
      if (errorData.code === "invalidParameter.authCode.notFound") {
        return new Response(
          JSON.stringify({
            error: "Authorization code expired or already used",
            message: "授权码已失效或已被使用，请重新登录",
            details: errorData
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          error: "Failed to get access token",
          details: errorData
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.accessToken;
    console.log("[DingTalk] Access token obtained successfully");

    // Step 2: 获取用户信息
    const userInfoResponse = await fetch(
      "https://api.dingtalk.com/v1.0/contact/users/me",
      {
        headers: { "x-acs-dingtalk-access-token": accessToken },
      }
    );

    if (!userInfoResponse.ok) {
      const error = await userInfoResponse.text();
      console.error("DingTalk UserInfo Error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get user info" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const userInfo = await userInfoResponse.json();
    const { unionId: userId, nick, avatarUrl, mobile, email } = userInfo;

    // Step 3: 生成 JWT Token
    console.log("[DingTalk] Generating JWT token...");
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(jwtSecret),
      { name: "HMAC", hash: "SHA-512" },
      true,
      ["sign", "verify"]
    );

    const jwtToken = await create(
      { alg: "HS512", typ: "JWT" },
      {
        userId,
        nick,
        avatarUrl,
        mobile,
        email,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
      },
      key
    );
    console.log("[DingTalk] JWT token generated successfully");

    // Step 4: 设置 Cookie
    // 生产环境使用Secure标志,开发环境不使用(支持HTTP)
    const isProduction = Deno.env.get("DENO_ENV") === "production";
    const secureFlag = isProduction ? "Secure; " : "";

    const headers = new Headers({
      "Content-Type": "application/json",
      "Set-Cookie": `auth_token=${jwtToken}; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: { userId, nick, avatarUrl, email },
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error("DingTalk Callback Error:", error);
    return new Response(
      JSON.stringify({
        error: "Authentication failed",
        message: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

