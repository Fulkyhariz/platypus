import { NextRequest, NextResponse } from "next/server";
import isAccessTokenExpired from "./checkTokenExpired";

const validateAccessToken = async (
  accessToken: string,
  refreshToken: string,
  request: NextRequest,
) => {
  if (!accessToken) {
    // Handle unauthenticated requests
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAccessTokenExpired(accessToken)) {
    if (!refreshToken) {
      // Handle case where refresh token is missing
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const response = await fetch(`${process.env.BASE_API_URL}/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (response.ok) {
      // Extract the new access token from the response
      const responseJson = await response.json();

      const newAccessToken = responseJson.data.access_token;

      if (!newAccessToken) {
        // Handle case where token refresh failed
        return NextResponse.redirect(new URL("/login", request.url));
      }

      return newAccessToken;
    }
  }

  return null;
};

export default validateAccessToken;
