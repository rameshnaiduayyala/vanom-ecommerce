# Enterprise B2C + B2B Ecommerce Backend API

A production-grade, enterprise-level ecommerce backend built with **Node.js**, **Fastify**, **JavaScript**, **Prisma ORM**, and **PostgreSQL**. The platform simultaneously supports normal **B2C retail consumers** and **B2B wholesale/bulk buyers** across **India (IN)**, the **United States (US)**, and the **United Kingdom (GB)**.

---

## 🚀 Key Enterprise Features

1. **Unified Catalog with Multi-Tier Pricing**:
   - Single shared catalog for B2C and B2B products.
   - Dynamic Price Resolver evaluating Country, Currency, Customer Type, Approved B2B Company, Customer Groups, Quantity Tiers, and Minimum Order Quantities (MOQ).
2. **B2B Wholesale & Business Verification**:
   - Company registration, multi-user membership with RBAC (e.g. `COMPANY_ADMIN`, `COMPANY_BUYER`).
   - Private document storage and administrative approval/rejection pipeline.
3. **Financial Precision Arithmetic**:
   - Pure `Prisma.Decimal` arithmetic engine (`Money` utility) ensuring zero floating-point calculation errors for subtotal, taxes, discounts, and totals.
4. **Multi-Jurisdiction Tax Engine**:
   - Provider abstraction supporting India GST (18%), UK VAT (20%), and US Sales Tax with immutable tax lines preserved on orders.
5. **Multi-Warehouse Inventory & Reservations**:
   - Multi-warehouse tracking (`available = onHand - reserved`) with atomic reservations during checkout, inventory movements, and stock transfers.
6. **PostgreSQL-Backed Idempotency Engine**:
   - Native database-backed idempotency using the `Idempotency-Key` header for order placement, payments, and webhook deduplication.
7. **Quotes & Negotiation Versioning**:
   - Strict versioning (`v1 -> v2 -> v3`) preserving historical commercial snapshots before atomic conversion into standard orders.
8. **Outbox Pattern & Event Sourcing**:
   - Atomic inclusion of `OutboxEvent` inside database transactions for reliable decoupled event processing.
9. **Role-Based Access Control (RBAC)**:
   - Hardened RBAC validating permissions (`catalog.*`, `pricing.*`, `orders.*`, `companies.*`, `quotes.*`, `payments.*`, `admin.*`) directly against backend state.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Fastify 5.x
- **Database & ORM**: PostgreSQL + Prisma ORM 6.x
- **Authentication**: JWT (`@fastify/jwt`) with Refresh Token Rotation & bcrypt
- **Security**: Helmet, Rate Limiting, CORS, Parameter Sanitization
- **Testing**: Vitest

---

## 📂 Project Structure

```text
backend/
├── prisma/
│   ├── schema.prisma          # Authoritative Enterprise Schema
│   └── seed.js                # Full database seeder (IN, US, GB, Products, Demo B2B Company)
├── src/
│   ├── app.js                 # Fastify application builder
│   ├── server.js              # Server lifecycle & graceful shutdown
│   ├── config/                # Environment, database, and auth configuration
│   ├── plugins/               # Auth, Security, CORS, Idempotency, Error handler plugins
│   ├── common/                # Money math, Constants, RBAC, Errors, Response formatters
│   ├── infrastructure/        # Prisma singleton, Storage provider, Logger, Outbox service
│   ├── routes/                # Master API v1 route registry
│   └── modules/               # Domain-Driven Modules
│       ├── auth/
│       ├── users/
│       ├── customers/
│       ├── companies/
│       ├── business-verification/
│       ├── catalog/
│       ├── categories/
│       ├── brands/
│       ├── pricing/
│       ├── geography/
│       ├── inventory/
│       ├── cart/
│       ├── checkout/
│       ├── orders/
│       ├── bulk-orders/
│       ├── quotes/
│       ├── payments/
│       ├── tax/
│       ├── shipping/
│       ├── reviews/
│       ├── wishlists/
│       ├── notifications/
│       ├── files/
│       ├── audit/
│       ├── admin/
│       └── health/
└── tests/
    ├── unit/                  # Money precision, Tax calculator, RBAC tests
    └── integration/           # Auth, Pricing & MOQ, Company verification, Cart/Checkout/Orders, Payments
```

---

## 🏃 Getting Started

### 1. Configure Environment
```bash
cp .env.example .env
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Synchronize Database & Generate Prisma Client
```bash
npx prisma db push
npx prisma generate
```

### 4. Seed Enterprise Data
```bash
npm run seed
```

### 5. Run Automated Tests
```bash
npm test
```

### 6. Start Development Server
```bash
npm run dev
```
