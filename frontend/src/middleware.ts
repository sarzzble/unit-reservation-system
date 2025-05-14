import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Korumalı rotalar
const protectedRoutes = ["/units", "/my-reservations"];
// Herkese açık rotalar
const publicRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  // Anasayfa için özel kontrol
  if (pathname === "/") {
    // Token varsa units sayfasına yönlendir
    if (token) {
      return NextResponse.redirect(new URL("/units", request.url));
    }
    // Token yoksa anasayfaya erişime izin ver
    return NextResponse.next();
  }

  // Eğer login veya register sayfasındaysak
  if (publicRoutes.includes(pathname)) {
    // Token varsa units sayfasına yönlendir
    if (token) {
      return NextResponse.redirect(new URL("/units", request.url));
    }
    // Token yoksa sayfaya erişime izin ver
    return NextResponse.next();
  }

  // Korumalı rotalar için token kontrolü
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    // Token yoksa login sayfasına yönlendir
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    // Token varsa sayfaya erişime izin ver
    return NextResponse.next();
  }

  // Diğer tüm sayfalara erişime izin ver
  return NextResponse.next();
}

// Middleware'in hangi rotalarda çalışacağını belirt
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
