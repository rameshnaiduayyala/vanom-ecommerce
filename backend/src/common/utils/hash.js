import bcrypt from "bcrypt";
import crypto from "crypto";

export class HashUtil {
  static async hashPassword(password, saltRounds = 10) {
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static sha256(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  static generateRandomToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString("hex");
  }
}
