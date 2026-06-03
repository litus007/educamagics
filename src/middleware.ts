// src/middleware.ts
// Protecció de rutes per rol i redirecció automàtica post-login

import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAuth = !!token;
    const pathname = req.nextUrl.pathname;

    // 1. Si no està autenticat i no està al login, l'enviem al login (tancat per a tothom)
    if (!isAuth && pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 2. Lògica de redirecció un cop autenticat
    if (isAuth) {
      const role = token?.role as string;

      // Si l'usuari intenta entrar a /login estant ja loguejat, l'enviem al seu panell
      if (pathname === "/login") {
        if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
        if (role === "CHILD") return NextResponse.redirect(new URL("/child/", req.url));
        if (role === "PARENT") return NextResponse.redirect(new URL("/parent/", req.url));
        if (role === "TEACHER") return NextResponse.redirect(new URL("/teacher/", req.url));
        return NextResponse.redirect(new URL("/parent/dashboard", req.url)); // O on vulguis per pares
      }

      // 3. Protecció de rutes segons el rol
      if (pathname.startsWith("/admintr") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      
      if (pathname.startsWith("/child") && role !== "CHILD") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (pathname.startsWith("/parent") && role !== "PARENT") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (pathname.startsWith("/teacher") && role !== "TEACHER") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

// Ajustem el matcher per incloure el login si cal, o deixar que el middleware ho controli
export const config = {
  matcher: ["/admin", "/child", "/parent", "/teacher", "/login"],
};