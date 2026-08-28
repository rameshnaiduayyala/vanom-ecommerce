const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "refreshToken",
  "jwt",
  "authorization",
  "secret",
  "creditCard",
  "cardNumber",
  "cvv",
  "apiKey",
]);

export function sanitizeLogData(data) {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase()) || SENSITIVE_KEYS.has(key)) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
