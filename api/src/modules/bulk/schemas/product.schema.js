/** A single pricing tier within a country price entry. */
const tier = {
  type: "object",
  required: ["minQuantity", "price"],
  additionalProperties: false,
  properties: {
    minQuantity: { type: "integer", minimum: 1 },
    maxQuantity: { type: ["integer", "null"], minimum: 1 },
    price: { type: ["number", "string"], minimum: 0 }
  }
};

/** Pricing and availability for a specific country. */
const countryPrice = {
  type: "object",
  required: ["countryCode", "currencyCode", "moq", "tiers"],
  additionalProperties: false,
  properties: {
    countryCode: { type: "string", minLength: 2 },
    currencyCode: { type: "string", minLength: 3 },
    moq: { type: "integer", minimum: 1 },
    stock: { type: "integer", minimum: 0 },
    isAvailable: { type: "boolean" },
    tiers: { type: "array", minItems: 1, items: tier }
  }
};

/** A single product variant with optional pricing per country. */
const variant = {
  type: "object",
  required: ["sku"],
  additionalProperties: false,
  properties: {
    name: { type: ["string", "null"] },
    sku: { type: "string", minLength: 1 },
    attributes: { type: ["object", "null"] },
    isActive: { type: "boolean" },
    countryPrices: { type: "array", items: countryPrice }
  }
};

/** Request body for creating a bulk product. */
export const productBody = {
  type: "object",
  required: ["name", "type"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 2, maxLength: 200 },
    slug: { type: "string", minLength: 2, maxLength: 220 },
    sku: { type: ["string", "null"] },
    description: { type: ["string", "null"] },
    category: { type: ["string", "null"] },
    brand: { type: ["string", "null"] },
    type: { type: "string", enum: ["SIMPLE", "VARIABLE"] },
    isActive: { type: "boolean" },
    images: {
      type: "array",
      items: {
        anyOf: [
          { type: "string", minLength: 1 },
          {
            type: "object",
            additionalProperties: false,
            properties: {
              mediaAssetId: { type: "string" },
              url: { type: "string" },
              isPrimary: { type: "boolean" },
              sortOrder: { type: "integer", minimum: 0 }
            }
          }
        ]
      }
    },
    countryPrices: { type: "array", items: countryPrice },
    variants: { type: "array", items: variant }
  }
};

/** Partial productBody used for update (PUT) requests. */
export const updateProductBody = {
  ...productBody,
  required: [],
  minProperties: 1
};
