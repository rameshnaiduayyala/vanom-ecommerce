import * as controller from "./invoice.controller.js";
import { authenticate } from "../../common/guards/auth.guard.js";

const invoiceIdParams = {
  type: "object",
  required: ["invoiceId"],
  properties: { invoiceId: { type: "string", minLength: 1 } }
};

const verifyParams = {
  type: "object",
  required: ["invoiceNumber"],
  properties: { invoiceNumber: { type: "string", minLength: 1 } }
};

export async function invoiceRoutes(fastify) {
  // Public Verification Endpoint
  fastify.get(
    "/invoices/verify/:invoiceNumber",
    { schema: { params: verifyParams } },
    controller.verify
  );

  // Authenticated Invoice Download Endpoint
  fastify.get(
    "/invoices/:invoiceId/download",
    { preHandler: authenticate, schema: { params: invoiceIdParams } },
    controller.download
  );
}
