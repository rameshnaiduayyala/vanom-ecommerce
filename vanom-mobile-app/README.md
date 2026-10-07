# Vanom Mobile Starter

Enterprise-style React Native + Expo starter for the Vanom ecommerce app.

## Stack

- React Native
- Expo
- Expo Router
- TypeScript
- TanStack Query
- Zustand
- Expo Secure Store
- Centralized Vanom theme

## Run

1. Install Node.js LTS.
2. Copy `.env.example` to `.env`.
3. Set your existing ecommerce API URL.
4. Install dependencies:

```bash
npm install
```

5. Start:

```bash
npx expo start
```

Then press `a` for Android or scan the QR code with Expo Go.

## API expectation

The sample home screen expects:

`GET /products?page=1&pageSize=10`

Example response:

```json
{
  "items": [
    {
      "id": "1",
      "name": "Example Product",
      "price": 1299,
      "compareAtPrice": 1599,
      "imageUrl": "https://example.com/product.webp",
      "category": "Digital",
      "rating": 4.5
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10
}
```

Change `src/features/products/api.ts` to match your existing API response shape.

## Important

This is a production-oriented starter, not the complete Vanom app. Add authentication, refresh-token handling, secure storage, checkout/payment, orders, push notifications, analytics, error reporting and your actual API contracts before production.
