import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Öğrenci rotaları
const studentRoutes = ["/student/units", "/student/my-reservations"];
// Öğretmen rotaları
const teacherRoutes = ["/teacher/reservations"];
// Herkese açık rotalar
const publicRoutes = ["/student/login", "/student/register", "/teacher/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;
  const userCookie = request.cookies.get("user")?.value;
  let user;

  try {
    user = userCookie ? JSON.parse(userCookie) : null;
  } catch {
    user = null;
  }

  const isTeacher = user?.is_staff || false;

  // Anasayfa için özel kontrol
  if (pathname === "/") {
    // Token varsa uygun sayfaya yönlendir
    if (token) {
      return NextResponse.redirect(
        new URL(
          isTeacher ? "/teacher/reservations" : "/student/units",
          request.url
        )
      );
    }
    // Token yoksa anasayfaya erişime izin ver
    return NextResponse.next();
  }

  // Eğer login veya register sayfasındaysak
  if (publicRoutes.includes(pathname)) {
    // Token varsa uygun sayfaya yönlendir
    if (token) {
      return NextResponse.redirect(
        new URL(
          isTeacher ? "/teacher/reservations" : "/student/units",
          request.url
        )
      );
    }
    // Token yoksa sayfaya erişime izin ver
    return NextResponse.next();
  }

  // Öğretmen rotaları için kontrol
  if (teacherRoutes.some((route) => pathname.startsWith(route))) {
    // Token yoksa öğretmen girişine yönlendir
    if (!token) {
      const url = new URL("/teacher/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    // Öğretmen değilse ana sayfaya yönlendir
    if (!isTeacher) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Token varsa ve öğretmense sayfaya erişime izin ver
    return NextResponse.next();
  }

  // Öğrenci rotaları için kontrol
  if (studentRoutes.some((route) => pathname.startsWith(route))) {
    // Token yoksa öğrenci girişine yönlendir
    if (!token) {
      const url = new URL("student/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    // Öğretmense öğretmen sayfasına yönlendir
    if (isTeacher) {
      return NextResponse.redirect(
        new URL("/teacher/reservations", request.url)
      );
    }
    // Token varsa ve öğrenciyse sayfaya erişime izin ver
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
