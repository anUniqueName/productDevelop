/**
 * Deno Deploy 主服务器
 * 处理 API 路由和静态文件服务
 */

import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";
import { handleAnalyze } from "./deno-api/analyze.ts";
import { handleGenerate } from "./deno-api/generate.ts";
import { handleDingTalkLogin } from "./deno-api/auth/dingtalk-login.ts";
import { handleDingTalkCallback } from "./deno-api/auth/dingtalk-callback.ts";
import { handleUserInfo } from "./deno-api/auth/user-info.ts";
import { handleLogout } from "./deno-api/auth/logout.ts";

/**
 * 路由处理器
 */
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // CORS 处理
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // 处理 OPTIONS 预检请求
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // API 路由
  if (pathname.startsWith("/api/")) {
    let response: Response;

    try {
      // 认证相关 API
      if (pathname === "/api/auth/dingtalk-login") {
        response = await handleDingTalkLogin(req);
      } else if (pathname === "/api/auth/dingtalk-callback") {
        response = await handleDingTalkCallback(req);
      } else if (pathname === "/api/auth/user-info") {
        response = await handleUserInfo(req);
      } else if (pathname === "/api/auth/logout") {
        response = await handleLogout(req);
      }
      // 业务 API
      else if (pathname === "/api/analyze") {
        response = await handleAnalyze(req);
      } else if (pathname === "/api/generate") {
        response = await handleGenerate(req);
      }
      // 404
      else {
        response = new Response(
          JSON.stringify({ error: "API endpoint not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // 添加 CORS 头
      const headers = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      console.error("API Error:", error);
      return new Response(
        JSON.stringify({ 
          error: "Internal server error", 
          message: error instanceof Error ? error.message : String(error)
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  }

  // 静态文件服务（Vite 构建产物）
  try {
    return await serveDir(req, {
      fsRoot: "./dist",
      urlRoot: "",
      showDirListing: false,
      enableCors: true,
    });
  } catch {
    // 如果文件不存在，返回 index.html（SPA 路由）
    try {
      const indexFile = await Deno.readFile("./dist/index.html");
      return new Response(indexFile, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } catch {
      return new Response("404 Not Found", { status: 404 });
    }
  }
}

/**
 * 启动服务器
 */
const port = parseInt(Deno.env.get("PORT") || "8000");

console.log(`🦕 Deno server running on http://localhost:${port}`);
console.log(`📁 Serving static files from ./dist`);
console.log(`🔌 API endpoints available at /api/*`);

Deno.serve({ port }, handler);

