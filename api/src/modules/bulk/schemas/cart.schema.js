/** Request body for adding a new item to the bulk cart. */
export const cartItemBody = {
  type: "object",
  required: ["productId", "quantity", "countryCode"],
  additionalProperties: false,
  properties: {
    productId: { type: "string", minLength: 1 },
    variantId: { type: ["string", "null"] },
    quantity: { type: "integer", minimum: 1 },
    countryCode: { type: "string", minLength: 2 }
  }
};

/** Request body for updating the quantity of an existing cart item. */
export const updateCartItemBody = {
  type: "object",
  required: ["quantity", "countryCode"],
  additionalProperties: false,
  properties: {
    quantity: { type: "integer", minimum: 1 },
    countryCode: { type: "string", minLength: 2 }
  }
};

/** Querystring for fetching the cart — optionally scoped to a country. */
export const cartQuerystring = {
  type: "object",
  properties: {
    countryCode: { type: "string" }
  }
};
