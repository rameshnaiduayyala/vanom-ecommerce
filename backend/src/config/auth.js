import { env } from "./env.js";

export const authConfig = {
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  refreshTokenExpiresDays: env.REFRESH_TOKEN_EXPIRES_DAYS,
  saltRounds: 10,
};
