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

  // Redirect to /login if no auth token is found
  if (!authToken && request.nextUrl.pathname.startsWith("/home")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check if the authToken exists in the database
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

  //   // Redirect to /home if the user is authenticated and tries to access /login
  //   if (token && request.nextUrl.pathname.startsWith("/login")) {
  //     return NextResponse.redirect(new URL("/home", request.url));
  //   }
  // }

  console.log("AuthToken:", authToken);
  return NextResponse.next();
}
