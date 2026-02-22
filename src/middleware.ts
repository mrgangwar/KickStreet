import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Admin Protection Logic
    
    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    
  },
  {
    callbacks: {
     
      authorized: ({ token }) => !!token,
    },
  }
);

// 2. Matcher Configuration 
export const config = { 
  matcher: [
    "/admin/:path*", 
    "/orders/:path*", 
    "/success/:path*", 
    "/checkout/:path*" 
  ] 
};