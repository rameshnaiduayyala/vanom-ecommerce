/** Request body for registering or creating a bulk business. */
export const businessBody = {
  type: "object",
  required: ["businessName", "businessEmail", "businessPhone", "countryCode", "address", "contactPersonName"],
  additionalProperties: false,
  properties: {
    businessName: { type: "string", minLength: 2, maxLength: 200 },
    businessEmail: { type: "string", format: "email" },
    businessPhone: { type: "string", minLength: 5, maxLength: 40 },
    taxRegistrationNumber: { type: ["string", "null"], maxLength: 100 },
    registrationNumber: { type: ["string", "null"], maxLength: 100 },
    countryCode: { type: "string", minLength: 2, maxLength: 10 },
    address: { type: "string", minLength: 5, maxLength: 500 },
    contactPersonName: { type: "string", minLength: 2, maxLength: 150 },
    user: {
      type: ["object", "null"],
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 8 },
        firstName: { type: ["string", "null"] },
        lastName: { type: ["string", "null"] },
        phone: { type: ["string", "null"] }
      }
    }
  }
};

/** Partial version of businessBody used for PATCH / PUT updates. */
export const updateBusinessBody = {
  ...businessBody,
  required: [],
  minProperties: 1
};

/** Body required when rejecting a business application. */
export const rejectBusinessBody = {
  type: "object",
  required: ["rejectionReason"],
  additionalProperties: false,
  properties: {
    rejectionReason: { type: "string", minLength: 2 }
  }
};
