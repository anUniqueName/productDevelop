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
      console.error("[DingTalk] Missing authorization code");
      return new Response(
        JSON.stringify({ error: "Missing authorization code" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const clientId = Deno.env.get("DINGTALK_APP_KEY");
    const clientSecret = Deno.env.get("DINGTALK_APP_SECRET");
    const jwtSecret = Deno.env.get("JWT_SECRET");

    // 详细的配置检查日志
    console.log("[DingTalk] Configuration check:");
    console.log("  - DINGTALK_APP_KEY:", clientId ? `${clientId.substring(0, 10)}...` : "❌ MISSING");
    console.log("  - DINGTALK_APP_SECRET:", clientSecret ? "✅ SET" : "❌ MISSING");
    console.log("  - JWT_SECRET:", jwtSecret ? "✅ SET" : "❌ MISSING");

    if (!clientId || !clientSecret || !jwtSecret) {
      console.error("[DingTalk] Server configuration incomplete!");
      return new Response(
        JSON.stringify({
          error: "Server configuration missing",
          details: {
            hasAppKey: !!clientId,
            hasAppSecret: !!clientSecret,
            hasJwtSecret: !!jwtSecret
          }
        }),
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
      console.error("[DingTalk] Token Error Response:", errorText);
      console.error("[DingTalk] Token Request Details:");
      console.error("  - clientId:", clientId?.substring(0, 10) + "...");
      console.error("  - code:", code?.substring(0, 20) + "...");

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

      // 如果是AppKey或AppSecret错误
      if (errorData.code === "Forbidden.AccessDenied" ||
          errorData.message?.includes("appKey") ||
          errorData.message?.includes("appSecret")) {
        return new Response(
          JSON.stringify({
            error: "Invalid DingTalk credentials",
            message: "钉钉应用配置错误，请检查DINGTALK_APP_KEY和DINGTALK_APP_SECRET",
            details: errorData
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          error: "Failed to get access token",
          message: "获取访问令牌失败，请检查钉钉应用配置",
          details: errorData
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const tokenData = await tokenResponse.json();

    // 🔍 详细日志:检查 tokenData 的完整结构
    console.log("=== [DingTalk] Complete Token Response ===");
    console.log("Full tokenData:", JSON.stringify(tokenData, null, 2));
    console.log("Available keys:", Object.keys(tokenData));
    console.log("Has accessToken:", !!tokenData.accessToken);
    console.log("Has refreshToken:", !!tokenData.refreshToken);
    console.log("Has expireIn:", !!tokenData.expireIn);
    console.log("Has corpId:", !!tokenData.corpId);
    console.log("Has nick:", !!tokenData.nick);
    console.log("Has unionId:", !!tokenData.unionId);
    console.log("Has openId:", !!tokenData.openId);
    console.log("Has mobile:", !!tokenData.mobile);
    console.log("Has email:", !!tokenData.email);
    console.log("Has avatarUrl:", !!tokenData.avatarUrl);
    console.log("==========================================");

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
      const errorText = await userInfoResponse.text();
      console.error("[DingTalk] UserInfo Error Response:", errorText);
      console.error("[DingTalk] UserInfo Request Details:");
      console.error("  - Access Token:", accessToken?.substring(0, 20) + "...");
      console.error("  - API Endpoint: https://api.dingtalk.com/v1.0/contact/users/me");

      // 解析错误信息
      let errorData: any;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      return new Response(
        JSON.stringify({
          error: "DingTalk API Error",
          message: errorData.message || "获取用户信息失败",
          code: errorData.code,
          details: errorData,
          troubleshooting: {
            step1: "确认钉钉开放平台应用已配置 'Contact.User.Read' 权限",
            step2: "确认权限已审核通过(状态为'已授权')",
            step3: "确认应用已发布/上线",
            step4: "尝试重新生成 AppKey 和 AppSecret"
          }
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
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

