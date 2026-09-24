import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

async function getHealthDetails() {
  let dbStatus = "connected";
  let dbLatency = null;
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = `${Date.now() - start}ms`;
  } catch (err) {
    dbStatus = "disconnected";
  }

  const memory = process.memoryUsage();
  const uptimeSeconds = process.uptime();

  return {
    name: "Vanom E-Commerce API",
    version: "1.0.0",
    status: dbStatus === "connected" ? "UP" : "DEGRADED",
    environment: env.nodeEnv,
    uptime: formatUptime(uptimeSeconds),
    uptimeSeconds: Math.floor(uptimeSeconds),
    timestamp: new Date().toISOString(),
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`
      }
    },
    database: {
      status: dbStatus,
      latency: dbLatency
    },
    endpoints: {
      base: "/api/v1",
      health: "/health",
      documentation: "/api/v1",
      modules: [
        { name: "Authentication", path: "/api/v1/auth" },
        { name: "Products", path: "/api/v1/products" },
        { name: "Categories", path: "/api/v1/categories" },
        { name: "Brands", path: "/api/v1/brands" },
        { name: "Cart", path: "/api/v1/carts" },
        { name: "Orders", path: "/api/v1/orders" },
        { name: "Users", path: "/api/v1/users" },
        { name: "Reviews", path: "/api/v1/reviews" },
        { name: "Pricing", path: "/api/v1/pricing" },
        { name: "Coupons", path: "/api/v1/coupons" },
        { name: "Currencies", path: "/api/v1/currencies" },
        { name: "Countries", path: "/api/v1/countries" },
        { name: "Bulk Orders", path: "/api/v1/bulk" },
        { name: "Admin", path: "/api/v1/admin" }
      ]
    }
  };
}

function renderHtmlDetails(data) {
  const isHealthy = data.status === "UP";
  const badgeColor = isHealthy ? "#10b981" : "#f59e0b";
  const badgeBg = isHealthy ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)";
  const badgeBorder = isHealthy ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)";

  const moduleItems = data.endpoints.modules
    .map(
      (m) => `
      <div class="endpoint-card">
        <div class="endpoint-name">${m.name}</div>
        <a href="${m.path}" class="endpoint-path" target="_blank">${m.path}</a>
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vanom E-Commerce API | System Details</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: rgba(17, 24, 39, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #6366f1;
      --primary-glow: rgba(99, 102, 241, 0.25);
      --accent: #38bdf8;
      --success: #10b981;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: var(--bg);
      background-image: 
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(56, 189, 248, 0.08) 0px, transparent 50%),
        radial-gradient(at 50% 50%, rgba(16, 185, 129, 0.05) 0px, transparent 50%);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2.5rem 1rem;
    }
    .container {
      width: 100%;
      max-width: 960px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--card-border);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .brand-logo {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #6366f1, #38bdf8);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.4rem;
      color: #fff;
      box-shadow: 0 8px 24px var(--primary-glow);
    }
    .brand-info h1 {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .brand-info p {
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      background: ${badgeBg};
      border: 1px solid ${badgeBorder};
      color: ${badgeColor};
      font-weight: 600;
      font-size: 0.875rem;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${badgeColor};
      box-shadow: 0 0 10px ${badgeColor};
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .metric-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.25rem;
      backdrop-filter: blur(12px);
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .metric-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.15);
    }
    .metric-label {
      color: var(--text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    .metric-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
      font-family: 'JetBrains Mono', monospace;
    }
    .metric-sub {
      color: var(--text-muted);
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    .section-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .section-title span {
      background: rgba(99, 102, 241, 0.1);
      color: #818cf8;
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-weight: 500;
    }
    .endpoints-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 0.875rem;
      margin-bottom: 2rem;
    }
    .endpoint-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      backdrop-filter: blur(8px);
    }
    .endpoint-name {
      font-weight: 600;
      font-size: 0.9rem;
    }
    .endpoint-path {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: var(--accent);
      text-decoration: none;
      background: rgba(56, 189, 248, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .endpoint-path:hover {
      background: rgba(56, 189, 248, 0.2);
    }
    .actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-top: 1rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.875rem;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-primary {
      background: #6366f1;
      color: #ffffff;
      box-shadow: 0 4px 14px var(--primary-glow);
    }
    .btn-primary:hover {
      background: #4f46e5;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--card-border);
      color: var(--text-main);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .footer {
      margin-top: 3rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <div class="brand-logo">V</div>
        <div class="brand-info">
          <h1>${data.name}</h1>
          <p>Version ${data.version} &bull; Fastify + Prisma Core Engine</p>
        </div>
      </div>
      <div class="status-badge">
        <div class="status-dot"></div>
        <span>${data.status === "UP" ? "Operational" : "Degraded"}</span>
      </div>
    </div>

    <div class="grid">
      <div class="metric-card">
        <div class="metric-label">Environment</div>
        <div class="metric-value">${data.environment}</div>
        <div class="metric-sub">Node ${data.system.nodeVersion}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Uptime</div>
        <div class="metric-value">${data.uptime}</div>
        <div class="metric-sub">Started successfully</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Database</div>
        <div class="metric-value" style="color: ${data.database.status === "connected" ? "#10b981" : "#ef4444"}">
          ${data.database.status.toUpperCase()}
        </div>
        <div class="metric-sub">Latency: ${data.database.latency || "N/A"}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Memory Usage</div>
        <div class="metric-value">${data.system.memory.heapUsed}</div>
        <div class="metric-sub">RSS: ${data.system.memory.rss}</div>
      </div>
    </div>

    <div class="section-title">
      API Modules & Endpoints <span>v1</span>
    </div>
    <div class="endpoints-grid">
      ${moduleItems}
    </div>

    <div class="actions">
      <a href="/health" class="btn btn-primary">Check Health JSON (/health)</a>
      <a href="/?format=json" class="btn btn-secondary">View System JSON (/?format=json)</a>
    </div>

    <div class="footer">
      Vanom E-Commerce API &bull; ${new Date().getFullYear()} &bull; Last checked at ${new Date(data.timestamp).toLocaleTimeString()}
    </div>
  </div>
</body>
</html>`;
}

export async function registerRootRoutes(fastify) {
  // Default Root Route GET /
  fastify.get("/", async (request, reply) => {
    const details = await getHealthDetails();
    const acceptsHtml =
      request.headers.accept && request.headers.accept.includes("text/html");
    const forceJson = request.query && request.query.format === "json";

    if (acceptsHtml && !forceJson) {
      reply.type("text/html; charset=utf-8").send(renderHtmlDetails(details));
      return;
    }

    return {
      success: true,
      message: "Vanom E-Commerce API is operational",
      data: details
    };
  });

  // Dedicated Health Route GET /health
  fastify.get("/health", async (request, reply) => {
    const details = await getHealthDetails();
    const acceptsHtml =
      request.headers.accept && request.headers.accept.includes("text/html");
    const forceJson = request.query && request.query.format === "json";

    if (acceptsHtml && !forceJson && request.query?.view === "html") {
      reply.type("text/html; charset=utf-8").send(renderHtmlDetails(details));
      return;
    }

    return {
      success: details.status === "UP",
      message: details.status === "UP" ? "API is healthy" : "API degraded",
      data: {
        status: details.status,
        timestamp: details.timestamp,
        uptime: details.uptime,
        environment: details.environment,
        database: details.database
      }
    };
  });
}
