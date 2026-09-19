const DEFAULT_WINDOW_MS = 60 * 1000;

const rules = [
  { matches: (path) => path.endsWith("/auth/login"), max: 10 },
  { matches: (path) => path.endsWith("/auth/register"), max: 5 },
  { matches: (path) => path.endsWith("/forgot-password"), max: 5 },
  { matches: (path) => path.endsWith("/refresh"), max: 10 },
  { matches: (path) => /\/coupons?(\/|$)/.test(path), max: 20 },
  { matches: (path) => /\/checkout(\/|$)/.test(path), max: 10 }
];

export async function registerRateLimit(fastify) {
  const hits = new Map();
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || DEFAULT_WINDOW_MS;

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  cleanup.unref?.();

  fastify.addHook("onRequest", async (request, reply) => {
    const path = request.url.split("?", 1)[0];
    const rule = rules.find(({ matches }) => matches(path));
    if (!rule) return;

    const key = `${request.ip}:${path}`;
    const now = Date.now();
    const current = hits.get(key);
    const entry = current && current.resetAt > now
      ? current
      : { count: 0, resetAt: now + windowMs };

    entry.count += 1;
    hits.set(key, entry);

    reply.header("X-RateLimit-Limit", rule.max);
    reply.header("X-RateLimit-Remaining", Math.max(rule.max - entry.count, 0));
    reply.header("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000));

    if (entry.count > rule.max) {
      reply.header("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      return reply.code(429).send({
        success: false,
        message: "Too many requests. Please try again later.",
        error: { code: "RATE_LIMIT_EXCEEDED" }
      });
    }
  });
}
