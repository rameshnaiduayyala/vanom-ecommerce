import * as controller from "./product.controller.js";

const idParams = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", minLength: 1 }
  }
};

const productProperties = {
  name: { type: "string", minLength: 2, maxLength: 200 },
  slug: { type: "string", minLength: 2, maxLength: 220 },
  description: { type: ["string", "null"] },
  type: { type: "string", enum: ["SIMPLE", "VARIABLE"] },
  basePrice: { type: ["number", "string", "null"] },
  sku: { type: ["string", "null"] },
  stock: { type: "integer", minimum: 0 },
  brandId: { type: ["string", "null"] },
  categoryId: { type: ["string", "null"] },
  isActive: { type: "boolean" },
  isNew: { type: "boolean" },
  isFeatured: { type: "boolean" },
  isTrending: { type: "boolean" },
  isBestSeller: { type: "boolean" }
};

const productBodySchema = {
  type: "object",
  required: ["name"],
  additionalProperties: false,
  properties: productProperties
};

const countryProperties = {
  countryId: { type: "string", minLength: 1 },
  isAvailable: { type: "boolean" },
  oldPrice: { type: ["number", "string", "null"], minimum: 0 },
  stock: { type: "integer", minimum: 0 },
  price: { type: ["number", "string", "null"] }
};

const imageProperties = {
  url: { type: "string", minLength: 1 },
  fileId: { type: ["string", "null"] },
  sortOrder: { type: "integer", minimum: 0 }
};

const variantProperties = {
  sku: { type: "string", minLength: 1, maxLength: 100 },
  name: { type: ["string", "null"] },
  attributes: { type: ["object", "null"] },
  stock: { type: "integer", minimum: 0 },
  isActive: { type: "boolean" },
  countries: { type: "array", items: { type: "object", additionalProperties: false, properties: countryProperties } }
};

productProperties.countries = { type: "array", items: { type: "object", additionalProperties: false, properties: countryProperties } };
productProperties.images = { type: "array", items: { type: "object", required: ["url"], additionalProperties: false, properties: imageProperties } };
productProperties.variants = { type: "array", items: { type: "object", required: ["sku"], additionalProperties: false, properties: variantProperties } };

export async function productRoutes(fastify) {
  fastify.post("/products", {
    schema: {
      body: {
        content: {
          "application/json": { schema: productBodySchema },
          "multipart/form-data": { schema: { type: "object" } }
        }
      }
    }
  }, controller.create);

  fastify.get("/products", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          page: { type: "integer", minimum: 1, default: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          search: { type: "string" },
          type: { type: "string", enum: ["SIMPLE", "VARIABLE"] },
          isActive: { type: "boolean" },
          isNew: { type: "boolean" },
          isFeatured: { type: "boolean" },
          isTrending: { type: "boolean" },
          isBestSeller: { type: "boolean" }
        }
      }
    }
  }, controller.list);

  fastify.get("/products/highlights/:type", {
    schema: {
      params: {
        type: "object",
        required: ["type"],
        properties: { type: { type: "string", enum: ["new", "featured", "trending", "best-seller"] } }
      },
      querystring: {
        type: "object",
        properties: {
          page: { type: "integer", minimum: 1, default: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100, default: 20 }
        }
      }
    }
  }, controller.highlights);

  fastify.get("/products/:id", {
    schema: { params: idParams }
  }, controller.getById);

  fastify.put("/products/:id", {
    schema: {
      params: idParams,
      body: {
        type: "object",
        minProperties: 1,
        additionalProperties: false,
        properties: productProperties
      }
    }
  }, controller.update);

  fastify.delete("/products/:id", {
    schema: { params: idParams }
  }, controller.remove);

  fastify.post("/products/:productId/variants", {
    schema: {
      params: { type: "object", required: ["productId"], properties: { productId: { type: "string", minLength: 1 } } },
      body: { type: "object", required: ["sku"], additionalProperties: false, properties: variantProperties }
    }
  }, controller.createVariant);

  fastify.get("/products/:productId/variants", {
    schema: { params: { type: "object", required: ["productId"], properties: { productId: { type: "string", minLength: 1 } } } }
  }, controller.listVariants);

  fastify.get("/products/:productId/variants/:id", {
    schema: { params: { type: "object", required: ["productId", "id"], properties: { productId: { type: "string" }, id: { type: "string" } } } }
  }, controller.getVariant);

  fastify.put("/products/:productId/variants/:id", {
    schema: {
      params: { type: "object", required: ["productId", "id"], properties: { productId: { type: "string" }, id: { type: "string" } } },
      body: { type: "object", minProperties: 1, additionalProperties: false, properties: variantProperties }
    }
  }, controller.updateVariant);

  fastify.delete("/products/:productId/variants/:id", {
    schema: { params: { type: "object", required: ["productId", "id"], properties: { productId: { type: "string" }, id: { type: "string" } } } }
  }, controller.deleteVariant);
}
