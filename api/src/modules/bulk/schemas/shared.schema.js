/** Reusable ID field — non-empty string. */
export const id = { type: "string", minLength: 1 };

/** Route params schema requiring an `id` path parameter. */
export const idParams = {
  type: "object",
  required: ["id"],
  properties: { id }
};

/** Generic paginated list querystring with optional filters. */
export const pageQuery = {
  type: "object",
  properties: {
    page: { type: "integer", minimum: 1 },
    limit: { type: "integer", minimum: 1, maximum: 100 },
    search: { type: "string" },
    countryCode: { type: "string" },
    status: { type: "string" },
    isActive: { type: "boolean" },
    from: { type: "string", format: "date-time" },
    to: { type: "string", format: "date-time" }
  }
};
