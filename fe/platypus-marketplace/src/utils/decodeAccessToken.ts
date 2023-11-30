var jwt = require("jsonwebtoken");

const decodeAccessToken = (accessToken: string) => {
  try {
    return jwt.decode(accessToken);
  } catch (error) {
    return null;
  }
};

export default decodeAccessToken;
