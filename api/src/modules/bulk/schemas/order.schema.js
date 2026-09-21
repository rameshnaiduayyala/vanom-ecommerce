/** Schema for the optional shipping address on a bulk order. */
const shippingAddressSchema = {
  type: "object",
  properties: {
    contactName: { type: "string" },
    phone: { type: "string" },
    addressLine1: { type: "string" },
    addressLine2: { type: ["string", "null"] },
    city: { type: "string" },
    state: { type: ["string", "null"] },
    postalCode: { type: "string" },
    countryCode: { type: "string" }
  }
};

/** Request body for creating a bulk order (from cart or explicit items). */
export const orderBody = {
  type: "object",
  required: ["countryCode"],
  additionalProperties: true,
  properties: {
    countryCode: { type: "string", minLength: 2 },
    shippingCharges: { type: "number", minimum: 0 },
    tax: { type: "number", minimum: 0 },
    notes: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        required: ["productId", "quantity"],
        properties: {
          productId: { type: "string" },
          variantId: { type: ["string", "null"] },
          quantity: { type: "integer", minimum: 1 },
          unitPrice: { type: "number" }
        }
      }
    },
    shippingAddress: shippingAddressSchema
  }
};

/** Request body for admin status updates on a bulk order. */
export const updateOrderStatusBody = {
  type: "object",
  minProperties: 1,
  additionalProperties: false,
  properties: {
    status: {
      type: "string",
      enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
    },
    paymentStatus: {
      type: "string",
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"]
    },
    shippingStatus: {
      type: "string",
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"]
    }
  }
};
