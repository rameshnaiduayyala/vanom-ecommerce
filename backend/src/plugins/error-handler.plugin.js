import fp from "fastify-plugin";

export default fp(async (app) => {
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    reply.status(error.statusCode || 500).send({
      success: false,
      message: error.message || "Internal server error"
    });
  });
});
