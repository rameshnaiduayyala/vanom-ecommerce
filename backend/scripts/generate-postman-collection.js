import fs from "fs";
import path from "path";

const postmanCollection = {
  info: {
    name: "Vanom Ecommerce API Collection",
    _postman_id: "vanom-ecommerce-api-collection-v1",
    description: "Production Enterprise B2C + B2B Wholesale Ecommerce API with S3 Storage, Company Verification, Order Pipelines, and Cart/Catalog CRUD.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:3000/api/v1", type: "string" },
    { key: "accessToken", value: "", type: "string" },
    { key: "adminToken", value: "", type: "string" },
    { key: "companyId", value: "", type: "string" },
    { key: "fileAssetId", value: "", type: "string" },
    { key: "verificationAppId", value: "", type: "string" },
    { key: "productId", value: "", type: "string" },
    { key: "categoryId", value: "", type: "string" },
    { key: "cartItemId", value: "", type: "string" },
    { key: "orderId", value: "", type: "string" },
    { key: "paymentId", value: "", type: "string" }
  ],
  item: [
    {
      name: "1. Authentication & Users",
      item: [
        {
          name: "Register B2C Customer",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "shopper@example.com",
                password: "Password123!",
                firstName: "Aarav",
                lastName: "Patel",
                phone: "+919876543210",
                customerType: "B2C"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/auth/register", host: ["{{baseUrl}}"], path: ["auth", "register"] }
          }
        },
        {
          name: "Register B2B Bulk Buyer",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "bulkbuyer@agroexports.com",
                password: "Password123!",
                firstName: "Rajesh",
                lastName: "Sharma",
                phone: "+919812345678",
                customerType: "B2B"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/auth/register", host: ["{{baseUrl}}"], path: ["auth", "register"] }
          }
        },
        {
          name: "B2C Customer Login",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "const res = pm.response.json();",
                  "if (res.success && res.data.tokens) {",
                  "    pm.collectionVariables.set('accessToken', res.data.tokens.accessToken);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "shopper@example.com",
                password: "Password123!"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/auth/login", host: ["{{baseUrl}}"], path: ["auth", "login"] }
          }
        },
        {
          name: "B2B Bulk Buyer Login",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "const res = pm.response.json();",
                  "if (res.success && res.data.tokens) {",
                  "    pm.collectionVariables.set('accessToken', res.data.tokens.accessToken);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "bulkbuyer@agroexports.com",
                password: "Password123!"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/auth/login", host: ["{{baseUrl}}"], path: ["auth", "login"] }
          }
        },
        {
          name: "Admin Login",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "const res = pm.response.json();",
                  "if (res.success && res.data.tokens) {",
                  "    pm.collectionVariables.set('adminToken', res.data.tokens.accessToken);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "admin@vanom.com",
                password: "Password123!"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/auth/login", host: ["{{baseUrl}}"], path: ["auth", "login"] }
          }
        },
        {
          name: "Get Current Profile (Me)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/auth/me", host: ["{{baseUrl}}"], path: ["auth", "me"] }
          }
        },
        {
          name: "Refresh Token",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                refreshToken: "<paste_refresh_token_here>"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/auth/refresh", host: ["{{baseUrl}}"], path: ["auth", "refresh"] }
          }
        }
      ]
    },
    {
      name: "2. B2B Company Onboarding & Admin Approval",
      item: [
        {
          name: "Register Company Details (Initial PENDING)",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "const res = pm.response.json();",
                  "if (res.success && res.data.id) {",
                  "    pm.collectionVariables.set('companyId', res.data.id);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                legalName: "Sharma Agro Supplies LLP",
                tradingName: "Sharma Agro Global",
                registrationNumber: "LLPIN-987654",
                taxId: "27AAAAA0000A1Z5",
                countryCode: "IN"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/companies", host: ["{{baseUrl}}"], path: ["companies"] }
          }
        },
        {
          name: "List Companies (Self vs Admin Filtered)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/companies?search=Sharma", host: ["{{baseUrl}}"], path: ["companies"], query: [{ key: "search", value: "Sharma" }] }
          }
        },
        {
          name: "Get Company Details By ID",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/companies/{{companyId}}", host: ["{{baseUrl}}"], path: ["companies", "{{companyId}}"] }
          }
        },
        {
          name: "Self Edit Company Details (Only Allowed while PENDING)",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                tradingName: "Sharma Agro Exports Global",
                taxId: "27AAAAA0000A1Z9"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/companies/{{companyId}}", host: ["{{baseUrl}}"], path: ["companies", "{{companyId}}"] }
          }
        },
        {
          name: "Upload Business Document File (Base64)",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "const res = pm.response.json();",
                  "if (res.success && res.data.id) {",
                  "    pm.collectionVariables.set('fileAssetId', res.data.id);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                originalName: "gst_certificate.pdf",
                mimeType: "application/pdf",
                type: "BUSINESS_DOCUMENT",
                base64Content: "TW9jayBHU1QgQ2VydGlmaWNhdGUgQ29udGVudA=="
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/files/upload", host: ["{{baseUrl}}"], path: ["files", "upload"] }
          }
        },
        {
          name: "Attach Document to Company",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                fileAssetId: "{{fileAssetId}}",
                documentType: "TAX_CERTIFICATE",
                documentNumber: "27AAAAA0000A1Z9",
                expiresAt: "2030-12-31T23:59:59.000Z"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/companies/{{companyId}}/documents", host: ["{{baseUrl}}"], path: ["companies", "{{companyId}}", "documents"] }
          }
        },
        {
          name: "Submit Company For Admin Verification",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/companies/{{companyId}}/submit-verification", host: ["{{baseUrl}}"], path: ["companies", "{{companyId}}", "submit-verification"] }
          }
        },
        {
          name: "Admin: List Business Verification Applications",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "const res = pm.response.json();",
                  "if (res.data && res.data.length > 0) {",
                  "    pm.collectionVariables.set('verificationAppId', res.data[0].id);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: { raw: "{{baseUrl}}/admin/business-applications?status=UNDER_REVIEW", host: ["{{baseUrl}}"], path: ["admin", "business-applications"], query: [{ key: "status", value: "UNDER_REVIEW" }] }
          }
        },
        {
          name: "Admin: Approve Application (Locks Self-Edits)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{adminToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                notes: "Verified against GSTN and MCA registry database"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/admin/business-applications/{{verificationAppId}}/approve", host: ["{{baseUrl}}"], path: ["admin", "business-applications", "{{verificationAppId}}", "approve"] }
          }
        },
        {
          name: "Admin: Reject Application",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{adminToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                reason: "Tax Identification document is blurry or unreadable"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/admin/business-applications/{{verificationAppId}}/reject", host: ["{{baseUrl}}"], path: ["admin", "business-applications", "{{verificationAppId}}", "reject"] }
          }
        },
        {
          name: "Admin: Edit Approved Company (Credit Terms & Status)",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{adminToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                paymentTermsDays: 45,
                creditLimit: 500000
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/companies/{{companyId}}", host: ["{{baseUrl}}"], path: ["companies", "{{companyId}}"] }
          }
        }
      ]
    },
    {
      name: "3. Categories & Category Images",
      item: [
        {
          name: "List Categories Tree (Public)",
          request: {
            method: "GET",
            url: { raw: "{{baseUrl}}/categories", host: ["{{baseUrl}}"], path: ["categories"] }
          }
        },
        {
          name: "Get Category By ID (Public)",
          request: {
            method: "GET",
            url: { raw: "{{baseUrl}}/categories/{{categoryId}}", host: ["{{baseUrl}}"], path: ["categories", "{{categoryId}}"] }
          }
        },
        {
          name: "Create Category (Admin / Auth)",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "const res = pm.response.json();",
                  "if (res.success && res.data.id) {",
                  "    pm.collectionVariables.set('categoryId', res.data.id);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{adminToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Agricultural Fertilizers",
                description: "Organic and chemical soil nutrients for bulk farming",
                sortOrder: 1
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/categories", host: ["{{baseUrl}}"], path: ["categories"] }
          }
        },
        {
          name: "Upload Category Image (Multipart)",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            body: {
              mode: "formdata",
              formdata: [
                { key: "image", type: "file", src: [] }
              ]
            },
            url: { raw: "{{baseUrl}}/categories/{{categoryId}}/image", host: ["{{baseUrl}}"], path: ["categories", "{{categoryId}}", "image"] }
          }
        },
        {
          name: "Get S3 Pre-Signed URL for Category Image Upload",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{adminToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                contentType: "image/jpeg"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/categories/{{categoryId}}/presigned-image-url", host: ["{{baseUrl}}"], path: ["categories", "{{categoryId}}", "presigned-image-url"] }
          }
        },
        {
          name: "Delete Category Image",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: { raw: "{{baseUrl}}/categories/{{categoryId}}/image", host: ["{{baseUrl}}"], path: ["categories", "{{categoryId}}", "image"] }
          }
        },
        {
          name: "Update Category",
          request: {
            method: "PUT",
            header: [
              { key: "Authorization", value: "Bearer {{adminToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Agricultural Fertilizers & Compost",
                sortOrder: 2
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/categories/{{categoryId}}", host: ["{{baseUrl}}"], path: ["categories", "{{categoryId}}"] }
          }
        },
        {
          name: "Delete Category",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: { raw: "{{baseUrl}}/categories/{{categoryId}}", host: ["{{baseUrl}}"], path: ["categories", "{{categoryId}}"] }
          }
        }
      ]
    },
    {
      name: "4. Products & Catalog CRUD",
      item: [
        {
          name: "List Products (Public with Filters)",
          request: {
            method: "GET",
            header: [
              { key: "x-country-code", value: "IN" },
              { key: "x-currency-code", value: "INR" }
            ],
            url: { raw: "{{baseUrl}}/products?page=1&limit=20", host: ["{{baseUrl}}"], path: ["products"], query: [{ key: "page", value: "1" }, { key: "limit", value: "20" }] }
          }
        },
        {
          name: "Get Featured Products (Public)",
          request: {
            method: "GET",
            url: { raw: "{{baseUrl}}/products/featured?limit=10", host: ["{{baseUrl}}"], path: ["products", "featured"], query: [{ key: "limit", value: "10" }] }
          }
        },
        {
          name: "Get Best-Seller Products (Public)",
          request: {
            method: "GET",
            url: { raw: "{{baseUrl}}/products/best-sellers?limit=10", host: ["{{baseUrl}}"], path: ["products", "best-sellers"], query: [{ key: "limit", value: "10" }] }
          }
        },
        {
          name: "Get Product Details (Contextual Pricing)",
          request: {
            method: "GET",
            header: [
              { key: "x-country-code", value: "IN" },
              { key: "x-currency-code", value: "INR" }
            ],
            url: { raw: "{{baseUrl}}/products/{{productId}}", host: ["{{baseUrl}}"], path: ["products", "{{productId}}"] }
          }
        },
        {
          name: "Create Product (Admin)",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "const res = pm.response.json();",
                  "if (res.success && res.data.id) {",
                  "    pm.collectionVariables.set('productId', res.data.id);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{adminToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Organic Vermicompost 50kg",
                slug: "organic-vermicompost-50kg",
                sku: "VERMI-50KG",
                description: "Premium pure worm castings fertilizer sack",
                status: "ACTIVE"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/products", host: ["{{baseUrl}}"], path: ["products"] }
          }
        },
        {
          name: "Update Product (Admin)",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{adminToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Organic Pure Vermicompost 50kg"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/products/{{productId}}", host: ["{{baseUrl}}"], path: ["products", "{{productId}}"] }
          }
        },
        {
          name: "Archive / Delete Product (Admin)",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: { raw: "{{baseUrl}}/products/{{productId}}", host: ["{{baseUrl}}"], path: ["products", "{{productId}}"] }
          }
        }
      ]
    },
    {
      name: "5. Banners, Sliders & Promotional Carousels",
      item: [
        {
          name: "List Active Banners (Public)",
          request: {
            method: "GET",
            url: { raw: "{{baseUrl}}/banners", host: ["{{baseUrl}}"], path: ["banners"] }
          }
        },
        {
          name: "List Hero Carousels Only (Public)",
          request: {
            method: "GET",
            url: { raw: "{{baseUrl}}/banners?type=HERO_CAROUSEL", host: ["{{baseUrl}}"], path: ["banners"], query: [{ key: "type", value: "HERO_CAROUSEL" }] }
          }
        },
        {
          name: "List Promotional Banners Only (Public)",
          request: {
            method: "GET",
            url: { raw: "{{baseUrl}}/banners?type=PROMOTIONAL", host: ["{{baseUrl}}"], path: ["banners"], query: [{ key: "type", value: "PROMOTIONAL" }] }
          }
        },
        {
          name: "Create Banner / Slider (Admin)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{adminToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                title: "New Season Organic Compost Launch",
                subtitle: "Direct Farm Logistics",
                description: "Certified vermicompost and enriched organic topsoil available in 50KG bulk sacks.",
                type: "HERO_CAROUSEL",
                imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
                buttonText: "Shop New Season",
                buttonLink: "/products?category=gardening-supplies",
                badgeText: "2026 Collection",
                bgGradient: "from-emerald-900 via-emerald-800 to-green-950",
                sortOrder: 1,
                active: true
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/banners", host: ["{{baseUrl}}"], path: ["banners"] }
          }
        },
        {
          name: "Get Banner By ID",
          request: {
            method: "GET",
            url: { raw: "{{baseUrl}}/banners/{{bannerId}}", host: ["{{baseUrl}}"], path: ["banners", "{{bannerId}}"] }
          }
        },
        {
          name: "Update Banner (Admin)",
          request: {
            method: "PUT",
            header: [
              { key: "Authorization", value: "Bearer {{adminToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                title: "Updated Banner Heading",
                buttonText: "Explore Now",
                buttonLink: "/products"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/banners/{{bannerId}}", host: ["{{baseUrl}}"], path: ["banners", "{{bannerId}}"] }
          }
        },
        {
          name: "Delete Banner (Admin)",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: { raw: "{{baseUrl}}/banners/{{bannerId}}", host: ["{{baseUrl}}"], path: ["banners", "{{bannerId}}"] }
          }
        }
      ]
    },
    {
      name: "6. B2C Customer Profile & Addresses CRUD",
      item: [
        {
          name: "Get Customer Profile",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/customers/profile", host: ["{{baseUrl}}"], path: ["customers", "profile"] }
          }
        },
        {
          name: "Update Customer Profile",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                firstName: "Aarav Kumar",
                preferredCurrency: "INR",
                preferredLocale: "en-IN",
                marketingOptIn: true
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/customers/profile", host: ["{{baseUrl}}"], path: ["customers", "profile"] }
          }
        },
        {
          name: "Add Delivery Address",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Home Delivery",
                line1: "Flat 402, Lotus Towers",
                line2: "MG Road, Indiranagar",
                city: "Bengaluru",
                state: "Karnataka",
                postalCode: "560038",
                countryCode: "IN",
                phone: "+919876543210",
                type: "SHIPPING",
                isDefault: true
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/customers/addresses", host: ["{{baseUrl}}"], path: ["customers", "addresses"] }
          }
        },
        {
          name: "List Saved Addresses",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/customers/addresses", host: ["{{baseUrl}}"], path: ["customers", "addresses"] }
          }
        },
        {
          name: "Delete Address",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/customers/addresses/:id", host: ["{{baseUrl}}"], path: ["customers", "addresses", ":id"] }
          }
        }
      ]
    },
    {
      name: "6. Cart CRUD",
      item: [
        {
          name: "Get Cart",
          request: {
            method: "GET",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "x-country-code", value: "IN" },
              { key: "x-currency-code", value: "INR" }
            ],
            url: { raw: "{{baseUrl}}/cart", host: ["{{baseUrl}}"], path: ["cart"] }
          }
        },
        {
          name: "Add Item to Cart",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "const res = pm.response.json();",
                  "if (res.success && res.data.items && res.data.items.length > 0) {",
                  "    pm.collectionVariables.set('cartItemId', res.data.items[0].id);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" },
              { key: "x-country-code", value: "IN" },
              { key: "x-currency-code", value: "INR" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                variantId: "<paste_product_variant_id_here>",
                quantity: 2
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/cart/items", host: ["{{baseUrl}}"], path: ["cart", "items"] }
          }
        },
        {
          name: "Update Cart Item Quantity",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" },
              { key: "x-country-code", value: "IN" },
              { key: "x-currency-code", value: "INR" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                quantity: 5
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/cart/items/{{cartItemId}}", host: ["{{baseUrl}}"], path: ["cart", "items", "{{cartItemId}}"] }
          }
        },
        {
          name: "Remove Single Cart Item",
          request: {
            method: "DELETE",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "x-country-code", value: "IN" },
              { key: "x-currency-code", value: "INR" }
            ],
            url: { raw: "{{baseUrl}}/cart/items/{{cartItemId}}", host: ["{{baseUrl}}"], path: ["cart", "items", "{{cartItemId}}"] }
          }
        },
        {
          name: "Clear Entire Cart",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/cart", host: ["{{baseUrl}}"], path: ["cart"] }
          }
        }
      ]
    },
    {
      name: "7. Checkout & Orders CRUD",
      item: [
        {
          name: "Validate Checkout / Preview Calculation",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" },
              { key: "x-country-code", value: "IN" },
              { key: "x-currency-code", value: "INR" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                shippingAddress: {
                  name: "Aarav Patel",
                  line1: "Flat 402, Lotus Towers",
                  city: "Bengaluru",
                  state: "Karnataka",
                  postalCode: "560038",
                  countryCode: "IN"
                },
                billingAddress: {
                  name: "Aarav Patel",
                  line1: "Flat 402, Lotus Towers",
                  city: "Bengaluru",
                  state: "Karnataka",
                  postalCode: "560038",
                  countryCode: "IN"
                }
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/checkout/validate", host: ["{{baseUrl}}"], path: ["checkout", "validate"] }
          }
        },
        {
          name: "Place Order (Idempotent)",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "const res = pm.response.json();",
                  "if (res.success && res.data.id) {",
                  "    pm.collectionVariables.set('orderId', res.data.id);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" },
              { key: "Idempotency-Key", value: "ik_order_{{$timestamp}}" },
              { key: "x-country-code", value: "IN" },
              { key: "x-currency-code", value: "INR" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                shippingAddress: {
                  name: "Aarav Patel",
                  line1: "Flat 402, Lotus Towers",
                  city: "Bengaluru",
                  state: "Karnataka",
                  postalCode: "560038",
                  countryCode: "IN"
                },
                billingAddress: {
                  name: "Aarav Patel",
                  line1: "Flat 402, Lotus Towers",
                  city: "Bengaluru",
                  state: "Karnataka",
                  postalCode: "560038",
                  countryCode: "IN"
                }
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/orders", host: ["{{baseUrl}}"], path: ["orders"] }
          }
        },
        {
          name: "List Orders",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/orders?page=1&limit=10", host: ["{{baseUrl}}"], path: ["orders"], query: [{ key: "page", value: "1" }, { key: "limit", value: "10" }] }
          }
        },
        {
          name: "Get Order By ID",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/orders/{{orderId}}", host: ["{{baseUrl}}"], path: ["orders", "{{orderId}}"] }
          }
        },
        {
          name: "Cancel Order (Releases Reserved Inventory)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                reason: "Customer changed mind on delivery date"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/orders/{{orderId}}/cancel", host: ["{{baseUrl}}"], path: ["orders", "{{orderId}}", "cancel"] }
          }
        }
      ]
    },
    {
      name: "8. Payments & Webhooks",
      item: [
        {
          name: "Create Payment Intent",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "const res = pm.response.json();",
                  "if (res.success && res.data.paymentId) {",
                  "    pm.collectionVariables.set('paymentId', res.data.paymentId);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                orderId: "{{orderId}}",
                provider: "RAZORPAY"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/payments/create", host: ["{{baseUrl}}"], path: ["payments", "create"] }
          }
        },
        {
          name: "Capture Payment (Marks Order PAID)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                amount: 590
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/payments/{{paymentId}}/capture", host: ["{{baseUrl}}"], path: ["payments", "{{paymentId}}", "capture"] }
          }
        },
        {
          name: "Refund Payment",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                amount: 590,
                reason: "Goods returned by customer"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/payments/{{paymentId}}/refund", host: ["{{baseUrl}}"], path: ["payments", "{{paymentId}}", "refund"] }
          }
        },
        {
          name: "Payment Gateway Webhook (Idempotent)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "x-webhook-id", value: "evt_wh_{{$timestamp}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                provider: "RAZORPAY",
                externalEventId: "evt_wh_{{$timestamp}}",
                eventType: "payment.captured",
                payload: {
                  id: "pay_test_external_123"
                }
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/payments/webhook", host: ["{{baseUrl}}"], path: ["payments", "webhook"] }
          }
        }
      ]
    },
    {
      name: "9. Admin Console",
      item: [
        {
          name: "Admin Metrics",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: { raw: "{{baseUrl}}/admin/metrics", host: ["{{baseUrl}}"], path: ["admin", "metrics"] }
          }
        },
        {
          name: "Admin Orders List",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: { raw: "{{baseUrl}}/admin/orders", host: ["{{baseUrl}}"], path: ["admin", "orders"] }
          }
        },
        {
          name: "Admin Companies List",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: { raw: "{{baseUrl}}/admin/companies", host: ["{{baseUrl}}"], path: ["admin", "companies"] }
          }
        }
      ]
    }
  ]
};

const outputPath = path.resolve("vanom_ecommerce_postman_collection.json");
fs.writeFileSync(outputPath, JSON.stringify(postmanCollection, null, 2), "utf8");
console.log("Postman collection successfully generated at:", outputPath);
