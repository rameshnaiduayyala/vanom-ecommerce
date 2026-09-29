/** Request body for creating a bulk shipping address. */
export const addressBody = {
  type: "object",
  required: ["label", "contactName", "phone", "addressLine1", "city", "postalCode", "countryCode"],
  additionalProperties: false,
  properties: {
    label: { type: "string", minLength: 1 },
    contactName: { type: "string", minLength: 2 },
    phone: { type: "string", minLength: 5 },
    addressLine1: { type: "string", minLength: 2 },
    addressLine2: { type: ["string", "null"] },
    city: { type: "string", minLength: 2 },
    state: { type: ["string", "null"] },
    postalCode: { type: "string", minLength: 2 },
    countryCode: { type: "string", minLength: 2 },
    isDefault: { type: "boolean" }
  }
};
