# Vanom Enterprise Ecommerce Frontend

A production-grade, enterprise-level ecommerce frontend built with **React**, **Vite**, **JavaScript**, **React Router v7**, **Tailwind CSS v4**, **TanStack Query**, **Axios**, **Zustand**, **React Hook Form**, and **Lucide React**.

---

## 🎯 Architecture: One Project, Three Applications

The application provides three completely isolated user experiences with dedicated layouts, navigation systems, and route boundaries:

```text
                           React Application
                                 │
          ┌──────────────────────┼──────────────────────┐
          ↓                      ↓                      ↓
       Public B2C          B2B Wholesale              Admin
    Retail Storefront          Portal               Dashboard
```

### 1. Public B2C Retail Experience (`/`)
- **Header**: Search, categories, regional market (India ₹, USA $, UK £), Wishlist, Account, and Slide-out Mini Cart Drawer.
- **Routes**:
  - `/` (Home)
  - `/products` (Catalog & Category filter)
  - `/products/:slug` (Product Details & Retail pricing)
  - `/cart` (Cart management)
  - `/checkout` (Multi-step checkout with authoritative backend tax & price calculations)
  - `/orders` & `/orders/:id` (Order tracking timeline)
  - `/wishlist`
  - `/login`, `/register`, `/forgot-password` (Includes 1-click Demo Account switchers)

### 2. B2B Wholesale Experience (`/b2b`)
- **Header & Sidebar**: Dark enterprise theme, approved commercial tier badge, available NET 30 invoice credit line, pallet/sack unit specs.
- **Routes**:
  - `/b2b/dashboard` (Credit limit widget, pending quotes, open purchase orders)
  - `/b2b/catalog` (Wholesale catalog with MOQ badges and volume tier previews)
  - `/b2b/catalog/:slug` (Wholesale product configurator, quantity tier table, pallet breakdown)
  - `/b2b/bulk-order` (Interactive spreadsheet for rapid multi-line wholesale ordering)
  - `/b2b/quotes` & `/b2b/quotes/:id` (Negotiation history, revision requests, PO conversion)
  - `/b2b/orders` (Wholesale PO tracking & tax invoice access)
  - `/b2b/company/profile`, `/b2b/company/documents`, `/b2b/company/members` (Corporate management)

### 3. Admin Control Plane (`/admin`)
- **Header & Sidebar**: Mission-control layout with live system status.
- **Routes**:
  - `/admin/dashboard` (Gross revenue, order velocity, pending approvals, inventory alerts)
  - `/admin/business-applications` & `/admin/companies/:id` (Document verification dossier review, approval/rejection dialogs)
  - `/admin/products` & `/admin/pricing` (Regional wholesale tier matrices for IN, US, GB)
  - `/admin/inventory` (Multi-warehouse stock balances & reservations)
  - `/admin/orders`, `/admin/quotes`, `/admin/payments`, `/admin/reports`, `/admin/audit-logs`

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite 7
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS v4 + `@tailwindcss/vite`
- **Server State**: TanStack Query v5
- **Client State**: Zustand
- **API Client**: Axios with automatic JWT refresh rotation interceptor
- **Icons**: Lucide React

---

## ⚙️ Mock Mode & Real API Switching

The frontend includes a seamless dual-mode API adapter:
- When `VITE_USE_MOCK_API=true` (default), the app runs with rich, realistic mock data without requiring a backend server.
- When `VITE_USE_MOCK_API=false`, all requests dynamically route to the real Fastify backend at `VITE_API_BASE_URL`.

---

## 🏃 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
