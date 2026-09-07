# 📘 Vanom E-Commerce API Documentation

Complete API Reference for **Products** and **Categories** CRUD endpoints, request payloads, query parameters, and response structures.

---

## 🏷️ Category Endpoints (`/api/v1/categories`)

### 1. List Categories
Retrieve all active store and catalog categories in hierarchical or flat format.

- **Method:** `GET`
- **URL:** `/api/v1/categories`
- **Auth:** Public
- **Query Parameters:**
  - `activeOnly` (boolean, default: `true`)
  - `rootOnly` (boolean, optional) - Return only top-level parent categories
  - `search` (string, optional) - Filter by category name or slug

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": "ced0e4d2-874d-417d-824b-0153f0449b3c",
      "name": "Electronics & POS",
      "slug": "electronics-pos",
      "description": "POS terminals, barcode scanners, commercial sensors, and hardware.",
      "imageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
      "parentId": null,
      "sortOrder": 0,
      "active": true,
      "children": [],
      "productCount": 24,
      "createdAt": "2026-09-07T12:00:00.000Z",
      "updatedAt": "2026-09-07T12:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Category by ID or Slug
- **Method:** `GET`
- **URL:** `/api/v1/categories/:id`
- **Auth:** Public

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "ced0e4d2-874d-417d-824b-0153f0449b3c",
    "name": "Electronics & POS",
    "slug": "electronics-pos",
    "description": "POS terminals, barcode scanners, commercial sensors, and hardware.",
    "imageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    "active": true,
    "children": []
  }
}
```

---

### 3. Create Category
- **Method:** `POST`
- **URL:** `/api/v1/categories`
- **Auth:** `Bearer <accessToken>` (Admin / Super Admin)
- **Headers:** `Content-Type: application/json`

#### Request Payload:
```json
{
  "name": "Industrial Packaging",
  "slug": "industrial-packaging",
  "description": "Heavy-duty corrugated boxes, stretch wrap, thermal strapping, and tape.",
  "imageUrl": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80",
  "parentId": null,
  "sortOrder": 1,
  "active": true
}
```

#### Response (`201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "23b9d68f-9ca0-45c1-bd49-54bb927848e0",
    "name": "Industrial Packaging",
    "slug": "industrial-packaging",
    "description": "Heavy-duty corrugated boxes, stretch wrap, thermal strapping, and tape.",
    "imageUrl": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80",
    "sortOrder": 1,
    "active": true,
    "createdAt": "2026-09-07T12:00:00.000Z",
    "updatedAt": "2026-09-07T12:00:00.000Z"
  }
}
```

---

### 4. Update Category
- **Method:** `PUT`
- **URL:** `/api/v1/categories/:id`
- **Auth:** `Bearer <accessToken>` (Admin / Super Admin)

#### Request Payload:
```json
{
  "name": "Industrial Packaging & Shipping",
  "description": "Updated master shipping supplies description.",
  "sortOrder": 2
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "23b9d68f-9ca0-45c1-bd49-54bb927848e0",
    "name": "Industrial Packaging & Shipping",
    "slug": "industrial-packaging",
    "sortOrder": 2,
    "active": true
  }
}
```

---

### 5. Delete Category
- **Method:** `DELETE`
- **URL:** `/api/v1/categories/:id`
- **Auth:** `Bearer <accessToken>` (Admin / Super Admin)

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "23b9d68f-9ca0-45c1-bd49-54bb927848e0",
    "message": "Category deleted successfully"
  }
}
```

---

## 📦 Product Endpoints (`/api/v1/products`)

### 1. List Products (Storefront & Admin)
- **Method:** `GET`
- **URL:** `/api/v1/products`
- **Auth:** Optional (`Bearer <accessToken>`)
- **Headers:**
  - `x-country-code`: `IN` | `US` | `GB` (for localized currency price resolution)
  - `x-currency-code`: `USD` | `USD` | `GBP`
- **Query Parameters:**
  - `page` (integer, default: `1`)
  - `limit` (integer, default: `20`)
  - `search` (string, optional) - Searches SKU, Title, and Description
  - `categoryId` (UUID, optional) - Filter by category
  - `brandId` (UUID, optional) - Filter by brand
  - `isFeatured` (boolean, optional)
  - `isBestSeller` (boolean, optional)

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "908287f5-4f3c-456a-a815-3c13190125ff",
        "sku": "SOIL-PREM-BASE",
        "name": "Premium Garden Soil",
        "slug": "premium-garden-soil",
        "description": "Organic nutrient-rich garden soil suitable for commercial nurseries.",
        "status": "ACTIVE",
        "isFeatured": true,
        "isBestSeller": true,
        "brand": {
          "id": "45c663b8-7b9f-44dd-b28e-8d1861145583",
          "name": "Vanom Commercial",
          "slug": "vanom-commercial"
        },
        "categories": [
          {
            "categoryId": "d7331d00-49c6-4019-b9ee-a42653757685",
            "category": {
              "name": "Gardening Supplies",
              "slug": "gardening-supplies"
            }
          }
        ],
        "images": [
          {
            "id": "img-01",
            "file": {
              "url": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
            }
          }
        ],
        "variants": [
          {
            "id": "var-01",
            "sku": "SOIL-PREM-50KG",
            "name": "50 KG Industrial Sack",
            "weight": 50.0,
            "packaging": [
              {
                "unit": { "name": "Sack" },
                "pallet": { "packagesPerPallet": 40 }
              }
            ]
          }
        ]
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 48,
      "totalPages": 3
    }
  }
}
```

---

### 2. Get Featured Products
- **Method:** `GET`
- **URL:** `/api/v1/products/featured?limit=8`
- **Auth:** Public

---

### 3. Get Best Sellers
- **Method:** `GET`
- **URL:** `/api/v1/products/best-sellers?limit=8`
- **Auth:** Public

---

### 4. Get Product Details by ID or Slug
- **Method:** `GET`
- **URL:** `/api/v1/products/:slug`
- **Auth:** Optional (`Bearer <accessToken>`)
- **Headers:** `x-country-code`, `x-currency-code`

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "908287f5-4f3c-456a-a815-3c13190125ff",
    "sku": "SOIL-PREM-BASE",
    "name": "Premium Garden Soil",
    "slug": "premium-garden-soil",
    "description": "Organic nutrient-rich garden soil suitable for commercial nurseries.",
    "status": "ACTIVE",
    "resolvedPrice": {
      "unitPrice": 45.00,
      "currency": "USD",
      "symbol": "$",
      "tier": "RETAIL"
    },
    "variants": [],
    "reviews": []
  }
}
```

---

### 5. Create Product
- **Method:** `POST`
- **URL:** `/api/v1/products`
- **Auth:** `Bearer <accessToken>` (Admin with `catalog.create` permission)
- **Headers:** `Content-Type: application/json`

#### Request Payload:
```json
{
  "name": "3500W High-Capacity Commercial Induction Cooktop",
  "sku": "KIT-IND-3500W",
  "slug": "3500w-commercial-induction-cooktop",
  "description": "Heavy stainless-steel construction with digital timer and rapid induction heat.",
  "status": "ACTIVE",
  "isFeatured": true,
  "isBestSeller": false,
  "brandId": "45c663b8-7b9f-44dd-b28e-8d1861145583"
}
```

#### Response (`201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "prod-1092837",
    "sku": "KIT-IND-3500W",
    "name": "3500W High-Capacity Commercial Induction Cooktop",
    "slug": "3500w-commercial-induction-cooktop",
    "status": "ACTIVE",
    "createdAt": "2026-09-07T12:00:00.000Z",
    "updatedAt": "2026-09-07T12:00:00.000Z"
  }
}
```

---

### 6. Update Product
- **Method:** `PUT` or `PATCH`
- **URL:** `/api/v1/products/:id`
- **Auth:** `Bearer <accessToken>` (Admin with `catalog.update` permission)

#### Request Payload:
```json
{
  "name": "3500W Commercial Induction Cooktop (Updated Series)",
  "status": "ACTIVE",
  "isFeatured": true
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "prod-1092837",
    "name": "3500W Commercial Induction Cooktop (Updated Series)",
    "status": "ACTIVE"
  }
}
```

---

### 7. Delete / Archive Product
- **Method:** `DELETE`
- **URL:** `/api/v1/products/:id`
- **Auth:** `Bearer <accessToken>` (Admin with `catalog.delete` permission)

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "prod-1092837",
    "status": "ARCHIVED"
  }
}
```
