import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("auth_token")?.value; // Read the token from cookies

  // If the user is not authenticated and tries to access a protected route, redirect to login
  if (!token && req.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Apply the middleware only to non-root pages
export const config = {
  matcher: ["/collaborator/:path*", "/account/:path*"], // Protects all pages under /dashboard and /profile
};
