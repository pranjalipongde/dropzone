import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // ── Placeholder: in Module 3 we replace this with a real session check ──
  const isLoggedIn = false; // ← will become: await auth() from Auth.js
  const isAdmin = false; // ← will become: session?.user?.role === 'admin'

  // Protect /account routes — must be logged in
  if (pathname.startsWith("/account") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect /admin routes — must be logged in AND be an admin
  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Everyone else passes through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run middleware on all routes EXCEPT:
     * - _next/static  (Tailwind, JS bundles)
     * - _next/image   (Next.js image optimization)
     * - favicon.ico
     * - /api/auth     (Auth.js needs to be reachable without a session)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
