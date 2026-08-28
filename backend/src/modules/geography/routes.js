import { GeographyController } from "./controller.js";

export default async function geographyRoutes(fastify, options) {
  const controller = new GeographyController();

  fastify.get("/countries", controller.getCountries);
  fastify.get("/countries/:id", controller.getCountry);
  fastify.get("/currencies", controller.getCurrencies);
}
