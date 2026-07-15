import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/signin",
  "/signup",
  "/forgot-password",
  "/vendors",
  "/reset-password",
]

const ROLE_HOME = {
  client: "/dashboard",
  vendor: "/vendor/dashboard",
  admin: "/admin/dashboard",
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Exclude static assets, files, and api routes from middleware interception
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // Clean trailing slashes for unified route comparisons (except root "/")
  const cleanPath = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname
  const isPublicPath = PUBLIC_PATHS.includes(cleanPath)

  // 1. Read JWT from cookie named 'homeevo-token'
  const token = request.cookies.get("homeevo-token")?.value

  // 2. If no token AND path is not public → redirect to /signin
  if (!token) {
    if (!isPublicPath) {
      return NextResponse.redirect(new URL("/signin", request.url))
    }
    return NextResponse.next()
  }

  // 3. If token present → verify with jose jwtVerify using JWT_SECRET env var
  try {
    const secretStr = process.env.JWT_SECRET
    if (!secretStr) {
      console.error("JWT_SECRET is not configured in environment variables")
      return NextResponse.next()
    }
    
    const secret = new TextEncoder().encode(secretStr)
    const { payload } = await jwtVerify(token, secret)
    
    // 4. Extract role from JWT payload
    const role = payload.role as "client" | "vendor" | "admin"

    if (!role || !ROLE_HOME[role]) {
      throw new Error("Invalid or missing role in JWT payload")
    }

    // 5. Role mismatch guard:
    //    /vendor/* routes → only 'vendor' allowed (do not match public /vendors)
    //    /admin/* routes → only 'admin' allowed
    //    /dashboard (and subroutes) → only 'client' allowed
    const isVendorRoute = cleanPath === "/vendor" || cleanPath.startsWith("/vendor/")
    const isAdminRoute = cleanPath === "/admin" || cleanPath.startsWith("/admin/")
    const isClientRoute = cleanPath === "/dashboard" || cleanPath.startsWith("/dashboard/")

    if (isVendorRoute && role !== "vendor") {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url))
    }

    if (isAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url))
    }

    if (isClientRoute && role !== "client") {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url))
    }

    // 6. Authenticated user visiting /signin or /signup → redirect to ROLE_HOME[role]
    if (cleanPath === "/signin" || cleanPath === "/signup") {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // 7. On JWT verification error → delete cookie + redirect to /signin (if not a public path)
    console.error("JWT verification failed in middleware:", error)
    if (isPublicPath) {
      const response = NextResponse.next()
      response.cookies.delete("homeevo-token")
      return response
    }
    const response = NextResponse.redirect(new URL("/signin", request.url))
    response.cookies.delete("homeevo-token")
    return response
  }
}

// Exclude: _next/static, _next/image, favicon.ico, and static file extensions in public directory
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
}