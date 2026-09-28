import "dotenv/config";
const nodeEnv = process.env.NODE_ENV || "development";
const jwtSecret = process.env.JWT_SECRET || (nodeEnv === "production" ? "" : "development-secret");

if (nodeEnv === "production") {
  if (!jwtSecret || jwtSecret === "development-secret" || jwtSecret.length < 32) {
    throw new Error(
      "FATAL SECURITY CONFIGURATION: In production, JWT_SECRET must be explicitly set with a cryptographically secure key of at least 32 characters."
    );
  }
}

export const env = {
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  passwordResetExpiresMinutes: Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES) || 30,
  emailVerificationExpiresMinutes: Number(process.env.EMAIL_VERIFICATION_EXPIRES_MINUTES) || 60,
  emailProvider: process.env.EMAIL_PROVIDER || "console",
  emailFrom: process.env.EMAIL_FROM,
  resendApiKey: process.env.RESEND_API_KEY,
  appUrl: process.env.APP_URL || "http://localhost:3000",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  awsRegion: process.env.AWS_REGION || "us-east-1",
  smsProvider: process.env.SMS_PROVIDER || "console",
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  nodeEnv,
  uploadProvider: process.env.UPLOAD_PROVIDER || "local",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  assetDir: process.env.ASSET_DIR || "assets",
  assetPublicUrl: process.env.ASSET_PUBLIC_URL || `${process.env.APP_URL || "http://localhost:3000"}/assets`,
  uploadMaxFileSize: Number(process.env.UPLOAD_MAX_FILE_SIZE) || 10 * 1024 * 1024,
  imageMaxWidth: Number(process.env.IMAGE_MAX_WIDTH) || 1920,
  imageMaxHeight: Number(process.env.IMAGE_MAX_HEIGHT) || 1920,
  imageWebpQuality: Number(process.env.IMAGE_WEBP_QUALITY) || 82,
  uploadAllowedMimeTypes: (process.env.UPLOAD_ALLOWED_MIME_TYPES || "image/jpeg,image/png,image/webp,application/pdf")
    .split(",").map((value) => value.trim()).filter(Boolean),
  s3Bucket: process.env.S3_BUCKET,
  s3Region: process.env.S3_REGION || "auto",
  s3Endpoint: process.env.S3_ENDPOINT,
  s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  s3PublicUrl: process.env.S3_PUBLIC_URL || process.env.R2_PUBLIC_URL,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY,
  shippoApiKey: process.env.SHIPPO_API_KEY || "",
  shippoWebhookSecret: process.env.SHIPPO_WEBHOOK_SECRET || ""
};
