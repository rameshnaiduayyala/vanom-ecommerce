import fp from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

// Reusable Model/DTO Dictionary
const COMMON_MODELS = {
  // Auth
  RegisterRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "customer@example.com" },
      password: { type: "string", format: "password", example: "Password123!" },
      firstName: { type: "string", example: "John" },
      lastName: { type: "string", example: "Doe" },
      phone: { type: "string", example: "+12025550143" },
      countryCode: { type: "string", example: "US" },
    },
  },
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "user@example.com" },
      password: { type: "string", format: "password", example: "Password123!" },
    },
  },
  ForgotPasswordRequest: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email", example: "user@example.com" },
    },
  },
  ResetPasswordRequest: {
    type: "object",
    required: ["token", "newPassword"],
    properties: {
      token: { type: "string", example: "reset-token-xyz" },
      newPassword: { type: "string", format: "password", example: "NewSecurePassword123!" },
    },
  },
  RefreshTokenRequest: {
    type: "object",
    properties: {
      refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsIn..." },
    },
  },

  // Catalog & Product Creation
  CreateProductRequest: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", example: "Organic Cold Pressed Virgin Coconut Oil 500ml" },
      slug: { type: "string", example: "organic-cold-pressed-coconut-oil" },
      sku: { type: "string", example: "GROC-COCO-500ML" },
      description: { type: "string", example: "100% natural, unrefined, extra virgin organic coconut oil." },
      categoryId: { type: "string", format: "uuid" },
      brandId: { type: "string", format: "uuid" },
      product_type: { type: "string", enum: ["simple", "variable"], default: "simple" },
      price_usd: { type: "number", example: 14.99, description: "B2C Retail Price USD" },
      old_price_usd: { type: "number", example: 19.99, description: "B2C Compare-at Price USD" },
      price_cad: { type: "number", example: 19.99, description: "B2C Retail Price CAD" },
      stock_quantity: { type: "integer", default: 100 },
      isFeatured: { type: "boolean", default: true },
      isBestSeller: { type: "boolean", default: false },
      status: { type: "string", enum: ["ACTIVE", "DRAFT", "ARCHIVED"], default: "ACTIVE" },
      variants: {
        type: "array",
        description: "Optional: specify multiple variant configurations if product_type is variable",
        items: {
          type: "object",
          properties: {
            variant_name: { type: "string", example: "500ml Glass Jar" },
            sku: { type: "string", example: "GROC-COCO-500ML-JAR" },
            weight: { type: "number", example: 0.5 },
            price_usd: { type: "number", example: 14.99 },
            price_cad: { type: "number", example: 19.99 },
            stock_quantity: { type: "integer", example: 100 },
          },
        },
      },
    },
  },

  // Cart & Checkout
  AddToCartRequest: {
    type: "object",
    required: ["variantId", "quantity"],
    properties: {
      variantId: { type: "string", format: "uuid" },
      quantity: { type: "integer", minimum: 1, default: 1 },
      businessId: { type: "string", format: "uuid", nullable: true },
    },
  },
  ValidateCheckoutRequest: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            variantId: { type: "string", format: "uuid" },
            quantity: { type: "integer", default: 1 },
          },
        },
      },
      couponCode: { type: "string", example: "SUMMER10" },
      shippingAddress: {
        type: "object",
        properties: {
          line1: { type: "string", example: "123 Main St" },
          city: { type: "string", example: "New York" },
          state: { type: "string", example: "NY" },
          postalCode: { type: "string", example: "10001" },
          country: { type: "string", example: "USA" },
        },
      },
    },
  },
  PlaceOrderRequest: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            variantId: { type: "string", format: "uuid" },
            quantity: { type: "integer", default: 1 },
          },
        },
      },
      shippingAddress: { type: "object" },
      billingAddress: { type: "object" },
      notes: { type: "string" },
    },
  },

  // Payments
  CreatePaymentRequest: {
    type: "object",
    required: ["orderId", "provider"],
    properties: {
      orderId: { type: "string", format: "uuid" },
      provider: { type: "string", enum: ["STRIPE", "RAZORPAY", "PAYPAL"] },
    },
  },
  CapturePaymentRequest: {
    type: "object",
    required: ["amount"],
    properties: {
      amount: { type: "number", example: 49.99 },
    },
  },

  // Business & Company Registration (With Admin User details)
  RegisterBusinessRequest: {
    type: "object",
    required: ["legalName"],
    properties: {
      legalName: { type: "string", example: "AgroWholesale North America Corp" },
      businessName: { type: "string", example: "AgroWholesale" },
      tradingName: { type: "string", example: "AgroWholesale" },
      taxId: { type: "string", example: "US-123456789" },
      registrationNumber: { type: "string", example: "US-CORP-991283" },
      countryCode: { type: "string", example: "US" },
      user: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "buyer@agrowholesale.in" },
          password: { type: "string", format: "password", example: "Password123!" },
          firstName: { type: "string", example: "Ramesh" },
          lastName: { type: "string", example: "Patel" },
          phone: { type: "string", example: "+12025550199" },
        },
      },
    },
  },

  // Admin Create User (With Existing Company Linking)
  AdminCreateUserRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "newuser@example.com" },
      password: { type: "string", format: "password", example: "Password123!" },
      firstName: { type: "string", example: "Jane" },
      lastName: { type: "string", example: "Smith" },
      phone: { type: "string", example: "+12025550188" },
      customerType: { type: "string", enum: ["B2C", "B2B"], default: "B2C" },
      roles: {
        type: "array",
        items: { type: "string" },
        example: ["CUSTOMER", "BUSINESS_USER"],
      },
      companyId: {
        type: "string",
        format: "uuid",
        example: "00000000-0000-0000-0000-000000000001",
        description: "Link user to existing company for B2B wholesale access",
      },
      status: { type: "string", enum: ["ACTIVE", "PENDING", "SUSPENDED"], default: "ACTIVE" },
    },
  },

  // Generic Write fallback
  GenericPayload: {
    type: "object",
    additionalProperties: true,
    description: "Request Payload Object",
  },
};

function inferTagFromUrl(url) {
  if (!url) return "General";
  const cleanUrl = url.replace(/^\/api\/v1\//, "").replace(/^\//, "");
  const segment = cleanUrl.split("/")[0]?.split("?")[0]?.toLowerCase();

  const map = {
    auth: "Authentication",
    users: "Users",
    customers: "Customers",
    companies: "Businesses",
    businesses: "Businesses",
    "business-verifications": "Business Verification",
    products: "Catalog",
    catalog: "Catalog",
    categories: "Categories",
    brands: "Brands",
    banners: "Banners",
    pricing: "Pricing",
    geography: "Geography",
    countries: "Geography",
    inventory: "Inventory",
    cart: "Cart",
    checkout: "Checkout",
    orders: "Orders",
    "bulk-orders": "Bulk Orders",
    "bulk-products": "Bulk Products",
    quotes: "Quotes",
    payments: "Payments",
    tax: "Tax",
    shipping: "Shipping",
    reviews: "Reviews",
    wishlists: "Wishlists",
    notifications: "Notifications",
    files: "Files",
    audit: "Audit",
    admin: "Admin",
    health: "Health",
  };

  return map[segment] || (segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "General");
}

function inferBodySchemaFromUrl(method, url) {
  const cleanUrl = String(url || "").toLowerCase();

  if (cleanUrl.includes("/auth/register")) return { $ref: "#/components/schemas/RegisterRequest" };
  if (cleanUrl.includes("/auth/login")) return { $ref: "#/components/schemas/LoginRequest" };
  if (cleanUrl.includes("/auth/forgot-password")) return { $ref: "#/components/schemas/ForgotPasswordRequest" };
  if (cleanUrl.includes("/auth/reset-password")) return { $ref: "#/components/schemas/ResetPasswordRequest" };
  if (cleanUrl.includes("/auth/refresh")) return { $ref: "#/components/schemas/RefreshTokenRequest" };

  if (cleanUrl.includes("/cart/items") && method === "POST") return { $ref: "#/components/schemas/AddToCartRequest" };
  if (cleanUrl.includes("/checkout/validate")) return { $ref: "#/components/schemas/ValidateCheckoutRequest" };
  if (cleanUrl.includes("/checkout/place-order") || (cleanUrl.includes("/orders") && method === "POST")) {
    return { $ref: "#/components/schemas/PlaceOrderRequest" };
  }

  if (cleanUrl.includes("/payments/create")) return { $ref: "#/components/schemas/CreatePaymentRequest" };
  if (cleanUrl.includes("/payments/") && cleanUrl.includes("/capture")) return { $ref: "#/components/schemas/CapturePaymentRequest" };

  if ((cleanUrl.includes("/products") || cleanUrl.includes("/admin/products")) && method === "POST") {
    return { $ref: "#/components/schemas/CreateProductRequest" };
  }

  if (cleanUrl.includes("/admin/users") && method === "POST") return { $ref: "#/components/schemas/AdminCreateUserRequest" };

  if ((cleanUrl.includes("/businesses") || cleanUrl.includes("/companies")) && method === "POST") {
    return { $ref: "#/components/schemas/RegisterBusinessRequest" };
  }

  return { $ref: "#/components/schemas/GenericPayload" };
}

function generateSummary(method, url) {
  const methodStr = (typeof method === "string" ? method : Array.isArray(method) ? method[0] : "GET").toUpperCase();
  const cleanUrl = String(url || "").replace(/^\/api\/v1\//, "/").replace(/^\//, "/");
  const parts = cleanUrl.split("/").filter(Boolean);
  const resource = parts[0] || "resource";
  const hasId = parts.some((p) => p.startsWith(":") || p.includes("{"));

  switch (methodStr) {
    case "GET":
      return hasId ? `Get ${resource} by ID` : `List all ${resource}`;
    case "POST":
      if (parts[1]) return `${parts[1]} ${resource}`;
      return `Create new ${resource}`;
    case "PUT":
    case "PATCH":
      return `Update ${resource}`;
    case "DELETE":
      return `Delete ${resource}`;
    default:
      return `${methodStr} ${cleanUrl}`;
  }
}

async function swaggerPlugin(fastify, options) {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Vanom Multi-Channel Enterprise E-Commerce API",
        description:
          "Comprehensive REST API for Vanom Enterprise E-Commerce Platform supporting B2C Retail & B2B Wholesale channels, Multi-tier Volume Pricing, Company Verification, Dual Currencies (USD, CAD), Inventory Reservations, and Payment Processing.",
        version: "1.0.0",
        contact: {
          name: "Vanom Engineering Team",
          email: "support@vanom.com",
        },
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 4000}`,
          description: "Local Development Server",
        },
      ],
      tags: [
        { name: "Authentication", description: "Customer & Admin registration, JWT login, tokens, password resets" },
        { name: "Users", description: "User account management, addresses, and profiles" },
        { name: "Customers", description: "Customer management and listing" },
        { name: "Businesses", description: "B2B Business entities, company members, and corporate profiles" },
        { name: "Business Verification", description: "B2B verification workflow, document uploads, and reviews" },
        { name: "Catalog", description: "Product catalog, variants, images, and category associations" },
        { name: "Categories", description: "Hierarchical product categories" },
        { name: "Brands", description: "Product brands management" },
        { name: "Banners", description: "Promotional hero banners, sliders, and marketing carousels" },
        { name: "Pricing", description: "Dynamic B2C & B2B price resolution, bulk tiers, and customer pricing" },
        { name: "Geography", description: "Countries, states/provinces, and regional settings (US, CA)" },
        { name: "Inventory", description: "Warehouse stock levels, atomic reservations, movements, and transfers" },
        { name: "Cart", description: "User and B2B carts, item management, and live price estimation" },
        { name: "Checkout", description: "Authoritative checkout validation and atomic order placement" },
        { name: "Orders", description: "Order lifecycle, status tracking, cancellations, and timeline" },
        { name: "Bulk Orders", description: "High-volume B2B bulk orders and RFQs" },
        { name: "Bulk Products", description: "Bulk product operations" },
        { name: "Quotes", description: "B2B custom price quotes, negotiations, and conversions to orders" },
        { name: "Payments", description: "Stripe, Razorpay, and PayPal intent creation, capture, and webhooks" },
        { name: "Tax", description: "US Sales Tax and Canadian GST/PST/HST tax rules" },
        { name: "Shipping", description: "Shipping rates, carrier rules, and package dimension calculations" },
        { name: "Reviews", description: "Product reviews and ratings" },
        { name: "Wishlists", description: "Customer saved items and wishlists" },
        { name: "Notifications", description: "User notifications and communication preferences" },
        { name: "Files", description: "S3 document, attachment, and image uploads" },
        { name: "Audit", description: "Platform security audit logs and event tracing" },
        { name: "Admin", description: "Admin dashboard metrics, user controls, and system configurations" },
        { name: "Health", description: "System health check and database connectivity" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Enter your JWT token in the format: Bearer <token>",
          },
        },
        schemas: COMMON_MODELS,
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    transform: ({ schema, url, route, swaggerObject }) => {
      const transformedSchema = { ...(schema || {}) };

      // Auto-assign tag if missing or if default
      if (!transformedSchema.tags || transformedSchema.tags.length === 0 || transformedSchema.tags.includes("default")) {
        transformedSchema.tags = [inferTagFromUrl(url)];
      }

      // Auto-assign summary if missing
      if (!transformedSchema.summary) {
        transformedSchema.summary = generateSummary(route?.method, url);
      }

      // Automatically provide intelligent DTO Request Body like Spring Boot / .NET
      const method = (typeof route?.method === "string" ? route.method : Array.isArray(route?.method) ? route.method[0] : "GET").toUpperCase();
      if (["POST", "PUT", "PATCH"].includes(method)) {
        if (!transformedSchema.body && !transformedSchema.consumes) {
          transformedSchema.body = inferBodySchemaFromUrl(method, url);
        }
      }

      return {
        schema: transformedSchema,
        url,
      };
    },
  });

  // Register interactive Swagger UI
  await fastify.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      displayRequestDuration: true,
      filter: true,
    },
    staticCSP: false,
    transformStaticCSP: (header) => header,
  });
}

export default fp(swaggerPlugin, {
  name: "swagger-plugin",
});
