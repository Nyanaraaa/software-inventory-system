import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get("authToken")?.value;

  
  if (!authToken && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  
  if (authToken) {
    const token = await fetch(`${request.nextUrl.origin}/api/auth`, {
      method: "GET",
      headers: {
        authToken: authToken,
      },
    });

    if (!token.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }


  console.log("AuthToken:", authToken);
  return NextResponse.next();
}
