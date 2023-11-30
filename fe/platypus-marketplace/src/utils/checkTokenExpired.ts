import decodeAccessToken from "./decodeAccessToken";

const checkTokenExpired = (accessToken: string) => {
  const decodedToken = decodeAccessToken(accessToken);

  if (!decodedToken || !decodedToken.exp) {
    return true;
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);

  return decodedToken.exp < currentTimestamp;
};

export default checkTokenExpired;
