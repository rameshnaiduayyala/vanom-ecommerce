import { authenticate, authorize } from "../../../common/guards/auth.guard.js";

/**
 * Fastify preHandler array that requires an authenticated SUPERADMIN.
 * Import this constant instead of duplicating the array in every route file.
 */
export const adminGuard = [authenticate, authorize("SUPERADMIN")];
