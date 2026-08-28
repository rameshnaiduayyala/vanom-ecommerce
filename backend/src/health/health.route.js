export default async function healthRoutes(app) {
  app.get("/health/live", async () => ({ status: "ok" }));
  app.get("/health/ready", async () => {
    await app.prisma.$queryRaw`SELECT 1`;
    return { status: "ready" };
  });
}
