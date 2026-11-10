import { prisma } from "../../config/prisma.js";

/**
 * Parses user agent string into human-friendly browser, OS, and device type.
 */
export function parseDeviceFromUserAgent(ua) {
  if (!ua) return "Unknown Device";

  // Operating System
  let os = "Unknown OS";
  if (/windows nt 10/i.test(ua)) os = "Windows 10/11";
  else if (/windows nt 6\.3/i.test(ua)) os = "Windows 8.1";
  else if (/windows nt 6\.1/i.test(ua)) os = "Windows 7";
  else if (/windows/i.test(ua)) os = "Windows";
  else if (/iphone/i.test(ua)) os = "iOS (iPhone)";
  else if (/ipad/i.test(ua)) os = "iPadOS (iPad)";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/cros/i.test(ua)) os = "ChromeOS";
  else if (/linux/i.test(ua)) os = "Linux";

  // Browser
  let browser = "Web Browser";
  if (/edg\//i.test(ua)) browser = "Microsoft Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) browser = "Google Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Mozilla Firefox";
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Apple Safari";

  // Device Form Factor
  let deviceType = "Desktop";
  if (/iphone|android.*mobile|mobile/i.test(ua)) deviceType = "Mobile";
  else if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) deviceType = "Tablet";

  return `${browser} on ${os} (${deviceType})`;
}

// Mapping common ISO country codes to readable names
const COUNTRY_NAMES = {
  IN: "India",
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  UK: "United Kingdom",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  AE: "UAE",
  SG: "Singapore",
  JP: "Japan",
  CN: "China",
  NL: "Netherlands",
  CH: "Switzerland",
  BR: "Brazil",
};

// Known timezone to physical country / location mapping
const TIMEZONE_TO_LOCATION = {
  "Asia/Calcutta": "India",
  "Asia/Kolkata": "India",
  "Asia/Dubai": "Dubai, UAE",
  "Asia/Singapore": "Singapore",
  "Asia/Tokyo": "Tokyo, Japan",
  "Asia/Hong_Kong": "Hong Kong",
  "Asia/Bangkok": "Bangkok, Thailand",
  "Asia/Dhaka": "Dhaka, Bangladesh",
  "Asia/Karachi": "Karachi, Pakistan",
  "Asia/Colombo": "Colombo, Sri Lanka",
  "Asia/Kathmandu": "Kathmandu, Nepal",
  "America/New_York": "New York, US",
  "America/Chicago": "Chicago, US",
  "America/Los_Angeles": "California, US",
  "America/Denver": "Denver, US",
  "America/Toronto": "Toronto, Canada",
  "America/Vancouver": "Vancouver, Canada",
  "Europe/London": "London, UK",
  "Europe/Berlin": "Berlin, Germany",
  "Europe/Paris": "Paris, France",
  "Australia/Sydney": "Sydney, Australia",
  "Australia/Melbourne": "Melbourne, Australia",
};

function formatLocationFromTimezone(tz) {
  if (!tz) return null;
  if (TIMEZONE_TO_LOCATION[tz]) return TIMEZONE_TO_LOCATION[tz];
  if (tz.includes("/")) {
    const [continent, city] = tz.split("/");
    return `${city.replace(/_/g, " ")}, ${continent}`;
  }
  return tz;
}

/**
 * Extracts geographical location from incoming request headers or IP.
 */
export function parseLocationFromRequest(request, ip) {
  if (!request) return "Unknown Location";

  const headers = request.headers || {};

  // 1. Check real CDN / Cloud proxy headers (Cloudflare, Vercel, AWS CloudFront)
  const city =
    headers["cf-ipcity"] ||
    headers["x-vercel-ip-city"] ||
    headers["cloudfront-viewer-city"];
  const region =
    headers["cf-region"] ||
    headers["x-vercel-ip-country-region"] ||
    headers["cloudfront-viewer-country-region-name"];
  const rawCountry =
    headers["cf-ipcountry"] ||
    headers["x-vercel-ip-country"] ||
    headers["cloudfront-viewer-country"];

  // Format readable country if CDN header is present
  const country = rawCountry
    ? (COUNTRY_NAMES[String(rawCountry).toUpperCase()] || rawCountry)
    : null;

  const parts = [city, region, country].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(", ");
  }

  // 2. Client-provided timezone header (e.g. Asia/Calcutta -> India)
  const clientTz = headers["x-client-timezone"];
  const tzLocation = formatLocationFromTimezone(clientTz);

  const cleanIp = (ip || "").trim();
  const isLocalOrPrivate =
    !cleanIp ||
    cleanIp === "127.0.0.1" ||
    cleanIp === "::1" ||
    cleanIp === "localhost" ||
    cleanIp.startsWith("192.168.") ||
    cleanIp.startsWith("10.") ||
    cleanIp.startsWith("172.");

  if (tzLocation) {
    return isLocalOrPrivate ? `${tzLocation} (Localhost)` : tzLocation;
  }

  if (isLocalOrPrivate) {
    return "Localhost / Internal";
  }

  return "Unknown Location";
}

/**
 * Reusable Audit Log Helper
 * Safely creates an audit record in the database without failing the primary transaction if logging encounters an issue.
 *
 * @param {Object} params
 * @param {string} [params.actorId] - User/Admin ID performing the action
 * @param {string} [params.actorEmail] - User/Admin email
 * @param {string} [params.actorRole] - User/Admin role (e.g. ADMIN, USER, B2B)
 * @param {string} params.action - Event action code (e.g. PRODUCT_CREATED, PRODUCT_UPDATED, USER_LOGIN)
 * @param {string} params.entityType - Target entity type (e.g. Product, User, Order, Session)
 * @param {string} [params.entityId] - Target entity ID
 * @param {string} [params.description] - Human-readable explanation of the action
 * @param {string} [params.ipAddress] - IP address of the client
 * @param {string} [params.userAgent] - Browser or user-agent string
 * @param {string} [params.device] - Device description (e.g. Chrome on Windows)
 * @param {string} [params.location] - Geographical location string (e.g. Dallas, US)
 * @param {Object} [params.beforeData] - Snapshot before modification
 * @param {Object} [params.afterData] - Snapshot after modification
 * @param {Object} [params.metadata] - Extra contextual information
 * @param {Object} [params.request] - Fastify request object
 */
export async function logAuditEvent({
  actorId = null,
  actorEmail = null,
  actorRole = null,
  action,
  entityType,
  entityId = null,
  description = null,
  ipAddress = null,
  userAgent = null,
  device = null,
  location = null,
  beforeData = null,
  afterData = null,
  metadata = null,
  request = null,
}) {
  try {
    let resolvedIp = ipAddress;
    let resolvedUserAgent = userAgent;
    let resolvedActorId = actorId;
    let resolvedActorEmail = actorEmail;
    let resolvedActorRole = actorRole;

    if (request) {
      if (!resolvedIp) {
        resolvedIp =
          request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
          request.headers["x-real-ip"] ||
          request.ip ||
          request.socket?.remoteAddress ||
          "127.0.0.1";
      }
      if (!resolvedUserAgent) {
        resolvedUserAgent = request.headers["user-agent"] || null;
      }
      if (request.user) {
        resolvedActorId = resolvedActorId || request.user.sub || request.user.id || null;
        resolvedActorEmail = resolvedActorEmail || request.user.email || null;
        resolvedActorRole = resolvedActorRole || request.user.role || null;
      }
    }

    const resolvedDevice = device || parseDeviceFromUserAgent(resolvedUserAgent);
    const resolvedLocation = location || parseLocationFromRequest(request, resolvedIp);

    const cleanBeforeData = beforeData ? JSON.parse(JSON.stringify(beforeData)) : null;
    const cleanAfterData = afterData ? JSON.parse(JSON.stringify(afterData)) : null;
    const cleanMetadata = {
      ...(metadata ? JSON.parse(JSON.stringify(metadata)) : {}),
      device: resolvedDevice,
      location: resolvedLocation,
      ipAddress: resolvedIp,
    };

    // Insert directly into AuditLog with all columns (device, location, ipAddress, actor)
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO "AuditLog" ("id", "createdAt", "actorId", "actorEmail", "actorRole", "action", "entityType", "entityId", "description", "ipAddress", "userAgent", "device", "location", "beforeData", "afterData", "metadata")
       VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14::jsonb, $15::jsonb)`,
      id,
      resolvedActorId,
      resolvedActorEmail,
      resolvedActorRole,
      action.toUpperCase(),
      entityType,
      entityId ? String(entityId) : null,
      description,
      resolvedIp,
      resolvedUserAgent,
      resolvedDevice,
      resolvedLocation,
      cleanBeforeData ? JSON.stringify(cleanBeforeData) : null,
      cleanAfterData ? JSON.stringify(cleanAfterData) : null,
      cleanMetadata ? JSON.stringify(cleanMetadata) : null
    );

    return {
      id,
      action,
      entityType,
      entityId,
      ipAddress: resolvedIp,
      device: resolvedDevice,
      location: resolvedLocation,
    };
  } catch (error) {
    // Non-blocking log failure so critical user operations continue smoothly
    console.error(`[AUDIT_LOG_ERROR] Failed to record audit log for ${action} on ${entityType}:`, error.message);
    return null;
  }
}
