import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isAuthInApis = (pathname: string) => {
  const authPathnames = ["/auth/signin", "/auth/signout"];
  return authPathnames.includes(pathname);
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  console.log(token);

  if (request.nextUrl.pathname.startsWith("/api")) {
    if (isAuthInApis(request.nextUrl.pathname) && !token) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401 }
      );
    }
  }

  if (request.nextUrl.pathname.startsWith("/host")) {
    if (!token || token.role !== "HOST") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/host/:path*"],
};
