import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define paths that don't require authentication
const publicPaths = ["/", "/login", "/register", "/forgot-password", "/api/auth", "/setup"]

// Define paths that are only accessible during setup
const setupPaths = ["/setup", "/setup/database", "/setup/admin", "/setup/business", "/setup/complete"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  // Check if the path is a setup path
  const isSetupPath = setupPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  // Get the session cookie
  const sessionCookie = request.cookies.get("session_id")

  // Check if the system is set up
  const isSetupCookie = request.cookies.get("system_setup_complete")
  const isSetupComplete = isSetupCookie?.value === "true"

  // If the system is not set up and the user is not on a setup path or public path, redirect to setup
  if (!isSetupComplete && !isSetupPath && !isPublicPath && pathname !== "/api/health") {
    return NextResponse.redirect(new URL("/setup", request.url))
  }

  // If the system is set up and the user is on a setup path, redirect to dashboard
  if (isSetupComplete && isSetupPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If the path requires authentication and there's no session, redirect to login
  if (!isPublicPath && !sessionCookie) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // If the user is logged in and trying to access login/register, redirect to dashboard
  if ((pathname === "/login" || pathname === "/register") && sessionCookie && isSetupComplete) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/health route
     * 2. /_next (Next.js internals)
     * 3. /fonts (inside /public)
     * 4. /images (inside /public)
     * 5. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/health|_next/static|_next/image|fonts|images|favicon.ico).*)",
  ],
}

