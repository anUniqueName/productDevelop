/**
 * 用户登出 (Deno 版本)
 * POST /api/auth/logout
 */

export async function handleLogout(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // 清除 Cookie
    const headers = new Headers({
      "Content-Type": "application/json",
      "Set-Cookie": "auth_token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/",
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error("Logout Error:", error);
    return new Response(
      JSON.stringify({
        error: "Logout failed",
        message: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

