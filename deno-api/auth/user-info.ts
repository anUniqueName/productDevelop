/**
 * 获取当前用户信息 (Deno 版本)
 * GET /api/auth/user-info
 */

import { verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

export async function handleUserInfo(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // 从 Cookie 中获取 token
    const cookieHeader = req.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [key, ...v] = c.split("=");
        return [key, v.join("=")];
      })
    );

    const token = cookies.auth_token;

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const jwtSecret = Deno.env.get("JWT_SECRET");
    if (!jwtSecret) {
      return new Response(
        JSON.stringify({ error: "Server configuration missing" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 验证 JWT
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(jwtSecret),
      { name: "HMAC", hash: "SHA-512" },
      true,
      ["sign", "verify"]
    );

    const payload = await verify(token, key);

    return new Response(
      JSON.stringify({ user: payload }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("User Info Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to get user info",
        message: error.message,
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
}

