/**
 * 认证工具函数
 * 提供JWT验证和用户认证功能
 */

import { verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

export interface AuthUser {
  userId: string;
  nick: string;
  avatarUrl?: string;
  email?: string;
  mobile?: string;
  exp?: number;
}

/**
 * 从请求中验证JWT token并返回用户信息
 * @param req - HTTP请求对象
 * @returns 用户信息或null(未认证)
 */
export async function requireAuth(req: Request): Promise<AuthUser | null> {
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
      return null;
    }

    const jwtSecret = Deno.env.get("JWT_SECRET");
    if (!jwtSecret) {
      console.error("[Auth] JWT_SECRET not configured");
      return null;
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
    return payload as AuthUser;
  } catch (error) {
    // Token无效或过期
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

/**
 * 创建未授权响应
 */
export function unauthorizedResponse(message = "Unauthorized"): Response {
  return new Response(
    JSON.stringify({ 
      error: "Unauthorized", 
      message 
    }),
    { 
      status: 401, 
      headers: { "Content-Type": "application/json" } 
    }
  );
}

/**
 * 速率限制器(简单的内存实现)
 */
class RateLimiter {
  private records = new Map<string, { count: number; resetAt: number }>();

  /**
   * 检查是否超过速率限制
   * @param key - 限制键(通常是IP地址)
   * @param maxRequests - 时间窗口内最大请求数
   * @param windowMs - 时间窗口(毫秒)
   * @returns true表示允许请求,false表示超过限制
   */
  check(key: string, maxRequests = 100, windowMs = 60000): boolean {
    const now = Date.now();
    const record = this.records.get(key);

    if (!record || now > record.resetAt) {
      this.records.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * 清理过期记录(定期调用以释放内存)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (now > record.resetAt) {
        this.records.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// 每5分钟清理一次过期记录
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

/**
 * 创建速率限制响应
 */
export function rateLimitResponse(): Response {
  return new Response(
    JSON.stringify({ 
      error: "Too Many Requests", 
      message: "请求过于频繁,请稍后再试" 
    }),
    { 
      status: 429, 
      headers: { 
        "Content-Type": "application/json",
        "Retry-After": "60"
      } 
    }
  );
}

/**
 * 获取客户端IP地址
 */
export function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() 
    || req.headers.get("x-real-ip") 
    || "unknown";
}

