# Vanom Enterprise Ecommerce — Complete API Reference Directory
> **Single-File Comprehensive Specification**  
> Base URL: `http://localhost:4000/api/v1` (or production hostname)  
> All responses follow the Standard JSON Envelope: `{ "success": boolean, "data": ... }` or `{ "success": false, "error": { "code": "...", "message": "..." } }`.

---

## Quick Navigation Index

1. [Authentication & Session Lifecycle](#1-authentication--session-lifecycle)
2. [B2C Customer Profile & Addresses CRUD](#2-b2c-customer-profile--addresses-crud)
3. [B2B Wholesale Companies & Document Verification](#3-b2b-wholesale-companies--document-verification)
4. [Categories & Image Management](#4-categories--image-management)
5. [Products & Catalog CRUD (Featured & Best-Sellers)](#5-products--catalog-crud-featured--best-sellers)
6. [Promotional Banners, Sliders & Carousels](#6-promotional-banners-sliders--carousels)
7. [Cart Management CRUD](#7-cart-management-crud)
8. [Checkout & Idempotent Order Placement](#8-checkout--idempotent-order-placement)
9. [Orders & Order Tracking](#9-orders--order-tracking)
10. [Payments, Captures, Refunds & Webhooks](#10-payments-captures-refunds--webhooks)
11. [Admin Console & Operational Oversight](#11-admin-console--operational-oversight)
12. [File Storage (S3 / Local Driver)](#12-file-storage-s3--local-driver)

---

## 1. Authentication & Session Lifecycle

### 1.1 Register B2C Customer
- **Endpoint**: `POST /auth/register`
- **Auth**: Public
- **Request Payload**:
```json
{
  "email": "customer@vanom.com",
  "password": "Password123!",
  "firstName": "Ramesh",
  "lastName": "Ayyala",
  "phone": "+919876543210",
  "customerType": "B2C"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "c1f76d49-4110-449e-8c6e-89a74659b8a1",
      "email": "customer@vanom.com",
      "firstName": "Ramesh",
      "lastName": "Ayyala",
      "phone": "+919876543210",
      "status": "ACTIVE",
      "customerType": "B2C",
      "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80",
      "roles": ["CUSTOMER"],
      "permissions": ["cart:read", "cart:write", "orders:create", "orders:read_own"],
      "companies": []
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
      "refreshToken": "7e3b9a01f92e...",
      "expiresIn": "15m",
      "tokenType": "Bearer"
    }
  }
}
```

---

### 1.2 Enterprise User Login (B2C, B2B, Admin)
- **Endpoint**: `POST /auth/login`
- **Auth**: Public
- **Request Payload**:
```json
{
  "email": "admin@vanom.com",
  "password": "Password123!"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "e4f88120-17aa-45e0-9ef2-7e04f0521c77",
      "email": "admin@vanom.com",
      "firstName": "Super",
      "lastName": "Admin",
      "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      "status": "ACTIVE",
      "customerType": "SYSADMIN",
      "roles": ["SUPER_ADMIN"],
      "permissions": [
        "catalog.read", "catalog.create", "catalog.update", "catalog.delete",
        "pricing.read", "pricing.create", "pricing.update",
        "inventory.read", "inventory.adjust", "inventory.transfer",
        "orders.read", "orders.create", "orders.update", "orders.cancel",
        "companies.read", "companies.create", "companies.update", "companies.approve", "companies.reject",
        "quotes.read", "quotes.create", "quotes.update", "quotes.approve",
        "payments.read", "payments.refund",
        "admin.dashboard", "admin.users", "admin.companies", "admin.pricing", "admin.inventory", "admin.orders"
      ]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
      "refreshToken": "a81cf2980bc...",
      "expiresIn": "15m",
      "tokenType": "Bearer"
    }
  }
}
```

---

### 1.3 Get Current Profile (Me)
- **Endpoint**: `GET /auth/me`
- **Auth**: `Bearer <accessToken>`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "c1f76d49-4110-449e-8c6e-89a74659b8a1",
    "email": "buyer@agrowholesale.in",
    "firstName": "Ramesh",
    "lastName": "Patel",
    "customerType": "B2B",
    "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    "companies": [
      {
        "companyId": "00000000-0000-0000-0000-000000000001",
        "legalName": "AgroWholesale India Private Limited",
        "tradingName": "AgroWholesale",
        "status": "APPROVED",
        "countryCode": "IN",
        "title": "Chief Procurement Officer",
        "isPrimary": true,
        "companyRoles": ["COMPANY_ADMIN"]
      }
    ]
  }
}
```

---

### 1.4 Refresh Token Rotation
- **Endpoint**: `POST /auth/refresh`
- **Auth**: Public
- **Request Payload**:
```json
{
  "refreshToken": "a81cf2980bc..."
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUz...",
      "refreshToken": "new_random_sha256_token...",
      "expiresIn": "15m",
      "tokenType": "Bearer"
    }
  }
}
```

---

### 1.5 Logout & Session Revocation
- **Endpoint**: `POST /auth/logout`
- **Auth**: `Bearer <accessToken>`
- **Request Payload**:
```json
{
  "refreshToken": "new_random_sha256_token..."
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "loggedOut": true
  }
}
```

---

## 2. B2C Customer Profile & Addresses CRUD

### 2.1 Get Customer Profile
- **Endpoint**: `GET /customers/profile`
- **Auth**: `Bearer <accessToken>`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "prof-101",
    "preferredCurrency": "USD",
    "marketingOptIn": true,
    "user": {
      "id": "c1f76d49-4110-449e-8c6e-89a74659b8a1",
      "email": "customer@vanom.com",
      "firstName": "Ramesh",
      "lastName": "Ayyala",
      "phone": "+919876543210",
      "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80"
    },
    "addresses": []
  }
}
```

---

### 2.2 Update Profile & Avatar
- **Endpoint**: `PUT /customers/profile` or `PATCH /customers/profile`
- **Auth**: `Bearer <accessToken>`
- **Request Payload**:
```json
{
  "firstName": "Ramesh",
  "lastName": "Ayyala",
  "phone": "+919876543210",
  "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80",
  "preferredCurrency": "INR",
  "marketingOptIn": true
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "prof-101",
    "preferredCurrency": "INR",
    "marketingOptIn": true,
    "user": {
      "id": "c1f76d49-4110-449e-8c6e-89a74659b8a1",
      "firstName": "Ramesh",
      "lastName": "Ayyala",
      "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80"
    }
  }
}
```

---

### 2.3 List Addresses
- **Endpoint**: `GET /customers/addresses`
- **Auth**: `Bearer <accessToken>`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "addr-101",
      "type": "SHIPPING",
      "name": "Ramesh Home",
      "line1": "Flat 402, Green Meadows",
      "city": "Bengaluru",
      "state": "Karnataka",
      "postalCode": "560001",
      "phone": "+919876543210",
      "isDefault": true,
      "country": { "code": "IN", "name": "India" }
    }
  ]
}
```

---

### 2.4 Add Address
- **Endpoint**: `POST /customers/addresses`
- **Auth**: `Bearer <accessToken>`
- **Request Payload**:
```json
{
  "type": "SHIPPING",
  "name": "Ramesh Headquarters",
  "line1": "Plot 18, Commercial Tech Park",
  "city": "Hyderabad",
  "state": "Telangana",
  "postalCode": "500081",
  "countryCode": "IN",
  "phone": "+919876543210",
  "isDefault": true
}
```
- **Success Response (201 Created)**: Returns the persisted address record.

---

### 2.5 Update Address
- **Endpoint**: `PUT /customers/addresses/:id`
- **Auth**: `Bearer <accessToken>`
- **Request Payload**:
```json
{
  "line1": "Suite 500, Cyber Tower",
  "isDefault": true
}
```
- **Success Response (200 OK)**: Updated address object.

---

### 2.6 Delete Address
- **Endpoint**: `DELETE /customers/addresses/:id`
- **Auth**: `Bearer <accessToken>`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Address deleted"
}
```

---

## 3. B2B Wholesale Companies & Document Verification

### 3.1 Register B2B Company Application
- **Endpoint**: `POST /companies`
- **Auth**: `Bearer <accessToken>`
- **Request Payload**:
```json
{
  "legalName": "Apex Global Wholesale Traders Pvt Ltd",
  "tradingName": "Apex Global",
  "registrationNumber": "U01100MH2020PTC345678",
  "taxId": "27AAACA1234A1Z5",
  "countryCode": "IN",
  "title": "Director of Procurement"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "comp-7128-4091-8812",
    "legalName": "Apex Global Wholesale Traders Pvt Ltd",
    "tradingName": "Apex Global",
    "status": "PENDING",
    "paymentTermsDays": 30,
    "creditLimit": 0
  }
}
```

---

### 3.2 Upload Company Verification Document
- **Endpoint**: `POST /companies/:id/documents`
- **Auth**: `Bearer <accessToken>`
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `document`: `<binary file (PDF/JPEG/PNG)>`
  - `type`: `TAX_CERTIFICATE` or `BUSINESS_REGISTRATION`
  - `documentNumber`: `GST-27AAACA1234A1Z5`
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "doc-8912",
    "type": "TAX_CERTIFICATE",
    "status": "UNDER_REVIEW",
    "documentNumber": "GST-27AAACA1234A1Z5",
    "file": {
      "storageKey": "business_document/1788780-doc.pdf",
      "originalName": "GST_Registration_Certificate.pdf"
    }
  }
}
```

---

### 3.3 Submit Application for Final Review
- **Endpoint**: `POST /companies/:id/submit-verification`
- **Auth**: `Bearer <accessToken>`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "comp-7128-4091-8812",
    "status": "UNDER_REVIEW",
    "message": "Company submitted for administrator review"
  }
}
```

---

### 3.4 Admin Review: Approve Application
- **Endpoint**: `POST /admin/business-applications/:id/approve`
- **Auth**: `Bearer <adminToken>`
- **Request Payload**:
```json
{
  "creditLimit": 500000.00,
  "paymentTermsDays": 30,
  "decisionReason": "Verified via GST portal and Certificate of Incorporation."
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "comp-7128-4091-8812",
    "status": "APPROVED",
    "creditLimit": 500000.00,
    "paymentTermsDays": 30
  }
}
```

---

### 3.5 Admin Review: Reject Application
- **Endpoint**: `POST /admin/business-applications/:id/reject`
- **Auth**: `Bearer <adminToken>`
- **Request Payload**:
```json
{
  "decisionReason": "Expired Tax Identification Certificate. Please re-upload current FY documents."
}
```

---

## 4. Categories & Image Management

### 4.1 List Categories Tree (Public)
- **Endpoint**: `GET /categories`
- **Auth**: Public
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-gardening",
      "name": "Gardening Supplies",
      "slug": "gardening-supplies",
      "description": "Commercial nursery soil, seeds & tools",
      "imageUrl": "https://images.unsplash.com/photo-1585320806297...",
      "children": []
    }
  ]
}
```

---

### 4.2 Create Category (Admin)
- **Endpoint**: `POST /categories`
- **Auth**: `Bearer <adminToken>`
- **Request Payload**:
```json
{
  "name": "Industrial Fasteners & Hardware",
  "slug": "industrial-fasteners",
  "description": "High-grade steel bolts, anchor nuts and brackets",
  "sortOrder": 3
}
```

---

## 5. Products & Catalog CRUD (Featured & Best-Sellers)

### 5.1 List Products with Pagination & Filter
- **Endpoint**: `GET /products?page=1&limit=20&search=soil&isFeatured=true`
- **Headers**:
  - `x-country-code`: `IN` (or `US`, `GB`)
  - `x-currency-code`: `INR` (or `USD`, `GBP`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-101",
      "sku": "SOIL-PREM-BASE",
      "name": "Premium Garden Soil",
      "slug": "premium-garden-soil",
      "status": "ACTIVE",
      "isFeatured": true,
      "isBestSeller": true,
      "brand": { "name": "Vanom Commercial" },
      "categories": [{ "category": { "name": "Gardening Supplies" } }],
      "variants": [...]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 5.2 Get Featured Products (Dedicated Public API)
- **Endpoint**: `GET /products/featured?limit=10`
- **Auth**: Public
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-101",
      "name": "Premium Garden Soil",
      "slug": "premium-garden-soil",
      "isFeatured": true,
      "isBestSeller": true,
      "brand": { "name": "Vanom Commercial" }
    }
  ]
}
```

---

### 5.3 Get Best-Selling Products (Dedicated Public API)
- **Endpoint**: `GET /products/best-sellers?limit=10`
- **Auth**: Public
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-103",
      "name": "Indoor Foliage Plant",
      "slug": "indoor-foliage-plant",
      "isBestSeller": true,
      "brand": { "name": "Vanom Commercial" }
    }
  ]
}
```

---

### 5.4 Get Product Details (Contextual Pricing & Pallet Config)
- **Endpoint**: `GET /products/:id` (Accepts UUID or Slug)
- **Success Response (200 OK)**: Full product hierarchy with contextual tiered prices for wholesale and retail.

---

### 5.5 Create Product (Admin)
- **Endpoint**: `POST /products`
- **Auth**: `Bearer <adminToken>`
- **Request Payload**:
```json
{
  "name": "Commercial Vermicompost 50kg Sack",
  "slug": "vermicompost-50kg-sack",
  "sku": "VERMI-50KG",
  "description": "Pure enriched organic vermicompost for nurseries and bulk farming.",
  "status": "ACTIVE",
  "isFeatured": true,
  "isBestSeller": true
}
```

---

### 5.6 Update Product (Admin)
- **Endpoint**: `PUT /products/:id` or `PATCH /products/:id`
- **Auth**: `Bearer <adminToken>`
- **Request Payload**:
```json
{
  "name": "Commercial Enriched Vermicompost 50kg Sack",
  "isFeatured": true
}
```

---

### 5.7 Delete / Archive Product (Admin)
- **Endpoint**: `DELETE /products/:id`
- **Auth**: `Bearer <adminToken>`
- **Success Response (200 OK)**: Sets product status to `ARCHIVED`.

---

## 6. Promotional Banners, Sliders & Carousels

### 6.1 List Active Banners / Carousels (Public)
- **Endpoint**: `GET /banners?type=HERO_CAROUSEL`
- **Query Options**:
  - `type`: `HERO_CAROUSEL` | `PROMOTIONAL` | `POPUP` | `SIDEBAR`
  - `active`: `true` | `false`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "bann-901",
      "title": "Commercial Agricultural Supplies & Nutrients",
      "subtitle": "Enterprise Procurement 2026",
      "description": "Direct manufacturer pricing for certified fertilizers, seeds, and industrial soil conditioners with guaranteed delivery.",
      "type": "HERO_CAROUSEL",
      "imageUrl": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
      "buttonText": "Explore Wholesale",
      "buttonLink": "/products?category=gardening-supplies",
      "badgeText": "Verified Global Exporters",
      "bgGradient": "from-emerald-900 via-emerald-800 to-green-950",
      "sortOrder": 1,
      "active": true
    }
  ]
}
```

---

### 6.2 Create Banner / Slider (Admin)
- **Endpoint**: `POST /banners`
- **Auth**: `Bearer <adminToken>`
- **Request Payload**:
```json
{
  "title": "Flash Deal: Extra 15% Off Bulk Pallet Freight",
  "subtitle": "Limited Time Offer",
  "description": "Take advantage of zero container demurrage and volume pricing on all domestic bulk shipments.",
  "type": "PROMOTIONAL",
  "imageUrl": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
  "buttonText": "Claim Discount",
  "buttonLink": "/b2b/bulk-order",
  "badgeText": "Flash Deal",
  "bgGradient": "from-blue-900 via-indigo-900 to-slate-900",
  "sortOrder": 1,
  "active": true
}
```
- **Success Response (201 Created)**: Created Banner object.

---

### 6.3 Update Banner (Admin)
- **Endpoint**: `PUT /banners/:id`
- **Auth**: `Bearer <adminToken>`
- **Request Payload**:
```json
{
  "title": "Updated Promotional Heading",
  "buttonText": "Shop Now",
  "active": true
}
```

---

### 6.4 Delete Banner (Admin)
- **Endpoint**: `DELETE /banners/:id`
- **Auth**: `Bearer <adminToken>`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": { "message": "Banner deleted successfully" }
}
```

---

## 7. Cart Management CRUD

### 7.1 Get User Active Cart
- **Endpoint**: `GET /cart`
- **Auth**: `Bearer <accessToken>`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "cart-1209",
    "currencyCode": "INR",
    "items": [
      {
        "id": "ci-1",
        "variantId": "var-soil-50kg",
        "quantity": 25,
        "unitPrice": 420.00,
        "subtotal": 10500.00
      }
    ],
    "subtotal": 10500.00
  }
}
```

---

### 7.2 Add Item to Cart
- **Endpoint**: `POST /cart/items`
- **Auth**: `Bearer <accessToken>`
- **Request Payload**:
```json
{
  "variantId": "var-soil-50kg",
  "quantity": 5
}
```

---

### 7.3 Update Cart Item Quantity
- **Endpoint**: `PUT /cart/items/:id` or `PATCH /cart/items/:id`
- **Auth**: `Bearer <accessToken>`
- **Request Payload**:
```json
{
  "quantity": 10
}
```

---

### 7.4 Remove Cart Item
- **Endpoint**: `DELETE /cart/items/:id`
- **Auth**: `Bearer <accessToken>`

---

### 7.5 Clear Cart
- **Endpoint**: `DELETE /cart`
- **Auth**: `Bearer <accessToken>`

---

## 8. Checkout & Idempotent Order Placement

### 8.1 Validate Checkout & Calculate Tax/Shipping
- **Endpoint**: `POST /checkout/validate`
- **Auth**: `Bearer <accessToken>`
- **Request Payload**:
```json
{
  "shippingAddressId": "addr-101",
  "billingAddressId": "addr-101",
  "shippingMethodId": "STANDARD_FREIGHT",
  "countryCode": "IN",
  "currencyCode": "INR"
}
```
- **Success Response (200 OK)**: Authoritative subtotal, calculated GST/VAT/Sales Tax breakdown, freight costs, and grand total.

---

### 8.2 Place Order (Idempotent Execution)
- **Endpoint**: `POST /checkout/place-order`
- **Headers**:
  - `Authorization`: `Bearer <accessToken>`
  - `Idempotency-Key`: `idemp-902183019823` *(Prevents duplicate charging or double ordering)*
- **Request Payload**:
```json
{
  "shippingAddressId": "addr-101",
  "billingAddressId": "addr-101",
  "paymentMethod": "CREDIT_CARD",
  "notes": "Deliver to Dock 4"
}
```
- **Success Response (200 OK)**: Order record with unique order number (`ORD-YYYYMMDD-XXXX`).

---

## 9. Orders & Order Tracking

### 9.1 List Orders
- **Endpoint**: `GET /orders`
- **Auth**: `Bearer <accessToken>`
- **Success Response (200 OK)**: Paginated orders placed by the authenticated customer or company.

---

### 9.2 Get Order By ID
- **Endpoint**: `GET /orders/:id`
- **Auth**: `Bearer <accessToken>`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "ord-8812",
    "orderNumber": "ORD-20260907-8812",
    "status": "CONFIRMED",
    "paymentStatus": "CAPTURED",
    "subtotal": 10500.00,
    "taxAmount": 1890.00,
    "totalAmount": 12390.00,
    "items": [...],
    "timeline": [...]
  }
}
```

---

### 9.3 Cancel Order
- **Endpoint**: `POST /orders/:id/cancel`
- **Auth**: `Bearer <accessToken>`
- **Request Payload**:
```json
{
  "reason": "Change of delivery requirements"
}
```

---

## 10. Payments, Captures, Refunds & Webhooks

### 10.1 Initialize Payment Intent
- **Endpoint**: `POST /payments/create`
- **Auth**: `Bearer <accessToken>`
- **Request Payload**:
```json
{
  "orderId": "ord-8812",
  "paymentProvider": "STRIPE",
  "amount": 12390.00,
  "currency": "INR"
}
```

---

### 10.2 Capture Payment
- **Endpoint**: `POST /payments/:id/capture`
- **Auth**: `Bearer <accessToken>`

---

### 10.3 Refund Payment
- **Endpoint**: `POST /payments/:id/refund`
- **Auth**: `Bearer <accessToken>`
- **Request Payload**:
```json
{
  "amount": 12390.00,
  "reason": "Damaged goods return"
}
```

---

### 10.4 Webhook Handler
- **Endpoint**: `POST /payments/webhook`
- **Auth**: Public (HMAC Verified via Webhook Signature Header)
- **Request Payload**: Gateway event payload (`payment_intent.succeeded`, `charge.refunded`, etc.)

---

## 11. Admin Console & Operational Oversight

*(All endpoints require `Bearer <adminToken>` with `ADMIN` or `SUPER_ADMIN` role)*

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/admin/metrics` | `GET` | Real-time revenues, daily orders, active accounts, inventory alerts |
| `/admin/products` | `GET` | Catalog management with stock levels and multi-currency pricing |
| `/admin/orders` | `GET` | Full order pipeline, tracking shipments, packaging states |
| `/admin/companies` | `GET` | Company directory, credit usage, verification statuses |
| `/admin/business-applications` | `GET` | Queue of pending B2B buyer compliance applications |
| `/admin/business-applications/:id/approve` | `POST` | Approves B2B application, sets terms and credit limit |
| `/admin/business-applications/:id/reject` | `POST` | Rejects application with required reason note |
| `/admin/users` | `GET` | Manage customers, roles, and administrative permissions |
| `/admin/inventory` | `GET` | Multi-warehouse stock levels, reorder alerts, transfers |
| `/admin/quotes` | `GET` | Manage custom enterprise RFQs and negotiation quotes |
| `/admin/payments` | `GET` | Transactions, captures, refunds, and financial reconciliation |
| `/admin/reports` | `GET` | Exportable financial, regional tax, and sales performance reports |

---

## 12. File Storage (S3 / Local Driver)

### 12.1 Multipart Upload File
- **Endpoint**: `POST /files/upload`
- **Auth**: `Bearer <accessToken>`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file`: `<binary>`
  - `type`: `USER_AVATAR` | `BUSINESS_DOCUMENT` | `PRODUCT_IMAGE`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "file-101",
    "storageKey": "user_avatar/1788780-avatar.png",
    "originalName": "avatar.png",
    "mimeType": "image/png",
    "sizeBytes": 142080
  }
}
```

### 12.2 Stream / Download File
- **Endpoint**: `GET /files/:storageKey`
- **Auth**: Public or Authorized depending on document type
- **Response**: Binary file stream with cache headers
