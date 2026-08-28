import fp from "fastify-plugin";
import swagger from "@fastify/swagger";

export default fp(async (app) => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Enterprise B2C + B2B Ecommerce API",
        version: "1.0.0"
      }
    }
  });
});
