import { env } from "../../config/env.js";

export function createAccessToken(jwt, user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    { expiresIn: env.jwtExpiresIn }
  );
}
