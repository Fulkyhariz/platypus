import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import validateAccessToken from "./utils/validateAccessToken";
import checkTokenExpired from "./utils/checkTokenExpired";

export async function middleware(request: NextRequest) {
  let cookieAccessToken = request.cookies.get("accessToken");
  let cookieRefreshToken = request.cookies.get("refreshToken");
  const accessToken = cookieAccessToken?.value;
  const refreshToken = cookieRefreshToken?.value;

  if (request.nextUrl.pathname.startsWith("/login")) {
    if (checkTokenExpired(refreshToken as string)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/vm4", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/register")) {
    if (checkTokenExpired(refreshToken as string)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/vm4", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/user")) {
    if (checkTokenExpired(refreshToken as string)) {
      const middlewareResponse = NextResponse.redirect(
        new URL("/vm4/login", request.url),
      );
      middlewareResponse.cookies
        .delete({
          name: "accessToken",
          path: "/",
        })
        .delete({
          name: "refreshToken",
          path: "/",
        });
      return middlewareResponse;
    } else {
      NextResponse.next();
    }
  }

  if (request.nextUrl.pathname.startsWith("/merchant-center")) {
    if (checkTokenExpired(refreshToken as string)) {
      const middlewareResponse = NextResponse.redirect(
        new URL("/vm4/login", request.url),
      );
      middlewareResponse.cookies
        .delete({
          name: "accessToken",
          path: "/",
        })
        .delete({
          name: "refreshToken",
          path: "/",
        });
      return middlewareResponse;
    } else {
      NextResponse.next();
    }
  }

  if (request.nextUrl.pathname.startsWith("/change-pin-platypay")) {
    if (checkTokenExpired(refreshToken as string)) {
      const middlewareResponse = NextResponse.redirect(
        new URL("/vm4/login", request.url),
      );
      middlewareResponse.cookies
        .delete({
          name: "accessToken",
          path: "/",
        })
        .delete({
          name: "refreshToken",
          path: "/",
        });
      return middlewareResponse;
    } else {
      NextResponse.next();
    }
  }

  if (request.nextUrl.pathname.startsWith("/change-password")) {
    if (checkTokenExpired(refreshToken as string)) {
      const middlewareResponse = NextResponse.redirect(
        new URL("/vm4/login", request.url),
      );
      middlewareResponse.cookies
        .delete({
          name: "accessToken",
          path: "/",
        })
        .delete({
          name: "refreshToken",
          path: "/",
        });
      return middlewareResponse;
    } else {
      NextResponse.next();
    }
  }

  if (request.nextUrl.pathname.startsWith("/cart")) {
    if (checkTokenExpired(refreshToken as string)) {
      const middlewareResponse = NextResponse.redirect(
        new URL("/vm4/login", request.url),
      );
      middlewareResponse.cookies
        .delete({
          name: "accessToken",
          path: "/",
        })
        .delete({
          name: "refreshToken",
          path: "/",
        });
      return middlewareResponse;
    } else {
      NextResponse.next();
    }
  }

  if (request.nextUrl.pathname.startsWith("/new-password")) {
    if (checkTokenExpired(refreshToken as string)) {
      const middlewareResponse = NextResponse.redirect(
        new URL("/vm4/login", request.url),
      );
      middlewareResponse.cookies
        .delete({
          name: "accessToken",
          path: "/",
        })
        .delete({
          name: "refreshToken",
          path: "/",
        });
      return middlewareResponse;
    } else {
      NextResponse.next();
    }
  }
  //Check AccessToken Expired To Refresh The Token
  if (checkTokenExpired(accessToken as string)) {
    const newAccessToken = await validateAccessToken(
      accessToken as string,
      refreshToken as string,
      request,
    );
    const middlewareResponse = NextResponse.next();
    middlewareResponse.cookies.set({
      name: "accessToken",
      value: newAccessToken,
      path: "/",
    });
    return middlewareResponse;
  } else {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/user/:path*",
    "/login",
    "/register",
    "/merchant-center/:path*",
    "/change-pin-platypay/:path*",
    "/change-password/:path*",
    "/cart/:path*",
    "/new-password/:path*",
  ],
};
