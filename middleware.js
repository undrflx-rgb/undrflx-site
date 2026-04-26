export default function middleware(req) {
  const authHeader = req.headers.get("Authorization") || "";
  const [user, pass] = atob(authHeader.replace("Basic ", "")).split(":");

  if (user === "portfolio-shin" && pass === "X9k!2mQa#p") {
    return; // 認証OK → そのまま表示
  }

  // 認証失敗 → ブラウザにID/PW入力ダイアログを表示
  return new Response("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Portfolio"' },
  });
}

export const config = { matcher: "/:path*" };
