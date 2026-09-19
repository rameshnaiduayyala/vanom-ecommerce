# Fastify + Prisma Ecommerce API

JavaScript, Fastify 5, Prisma 6 and PostgreSQL.

## Architecture

- routes -> HTTP endpoints
- controllers -> request/response handling
- services -> business logic
- Prisma -> database access
- common/errors -> centralized errors
- common/response -> consistent API responses
- constants -> shared values

## Included

- Users
- Countries
- Currencies
- Categories
- Brands
- Products
- Product variants
- Product country availability
- Cart
- Orders
- Coupons
- Banners
- Files

The first complete CRUD is **Products**.

Users also have CRUD endpoints. Passwords are accepted as `password`, stored as a
derived hash, and are never included in API responses.

## Setup

1. Copy `.env.example` to `.env`
2. Create a PostgreSQL database named `ecommerce`
3. Install packages:

```bash
npm install
```

4. Generate Prisma client:

```bash
npm run prisma:generate
```

5. Create database migration:

```bash
npm run prisma:migrate -- --name init
```

6. Seed sample data:

```bash
npm run db:seed
```

7. Start:

```bash
npm run dev
```

API:

`http://localhost:3000`

Health:

`GET /health`

## Product CRUD

Create:

POST `/api/v1/products`

```json
{
  "name": "Premium T-Shirt",
  "slug": "premium-t-shirt",
  "description": "Cotton t-shirt",
  "type": "VARIABLE",
  "brandId": "brand-id",
  "categoryId": "category-id",
  "isActive": true
}
```

For a simple product, use `type: "SIMPLE"`, `basePrice`, `sku`, and `stock`.
For a variable product, use `type: "VARIABLE"` and add variants inline:

```json
{
  "name": "Premium T-Shirt",
  "slug": "premium-t-shirt",
  "type": "VARIABLE",
  "variants": [
    {
      "sku": "TSHIRT-RED-M",
      "name": "Red / Medium",
      "attributes": { "color": "Red", "size": "M" },
      "stock": 25,
      "countries": [{ "countryId": "country-id", "price": 29.99 }]
    }
  ]
}
```

Variant endpoints:

- `GET /api/v1/products/:productId/variants`
- `POST /api/v1/products/:productId/variants`
- `GET /api/v1/products/:productId/variants/:id`
- `PUT /api/v1/products/:productId/variants/:id`
- `DELETE /api/v1/products/:productId/variants/:id`

Get all:

GET `/api/v1/products?page=1&limit=20&search=shirt`

Get one:

GET `/api/v1/products/:id`

Update:

PUT `/api/v1/products/:id`

Delete:

DELETE `/api/v1/products/:id`

## User CRUD

Create:

POST `/api/v1/users`

```json
{
  "email": "customer@example.com",
  "password": "StrongPass123",
  "firstName": "Jane",
  "lastName": "Doe",
  "countryId": "country-id",
  "isActive": true
}
```

Get all:

GET `/api/v1/users?page=1&limit=20&search=jane&isActive=true&countryId=country-id`

Get one:

GET `/api/v1/users/:id`

Update:

PUT `/api/v1/users/:id`

Delete:

DELETE `/api/v1/users/:id`

For user images, send `multipart/form-data` with an `image` file field. Normal
user fields can be sent directly, or grouped inside a `data` JSON field. The
file is stored in the `avatars` folder and its URL is saved to `User.imageUrl`:

```text
firstName: Jane
lastName: Doe
image: avatar.jpg
```

## Authentication

Register:

POST `/api/v1/auth/register`

Login:

POST `/api/v1/auth/login`

```json
{
  "email": "customer@example.com",
  "password": "StrongPass123"
}
```

The register and login responses include a JWT in `data.token`. Send it on
protected requests as `Authorization: Bearer <token>`.

Get the authenticated user:

GET `/api/v1/auth/me`

Password reset emails use the reusable email utility in
`src/common/utils/email.js`. Development uses `EMAIL_PROVIDER=console` and
prints the reset link to the server log. For production, use Resend:

```env
EMAIL_PROVIDER=resend
EMAIL_FROM="Vanom <noreply@your-domain.com>"
RESEND_API_KEY=your-resend-api-key
APP_URL=https://your-frontend.example.com
```

Email templates use React Email and live under `src/emails`. Supported email providers are `resend`, `ses` (AWS SES), `smtp` (Nodemailer),
and `console` for development. For Papercut SMTP locally, use:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=127.0.0.1
SMTP_PORT=25
SMTP_SECURE=false
```

AWS providers use the standard AWS SDK
credential chain. SMS is available through AWS SNS with `SMS_PROVIDER=sns`:

```js
import { sendEmail, sendSms } from "./src/common/utils/email.js";

await sendEmail({ to: "user@example.com", subject: "Hello", text: "Hello" });
await sendSms({ to: "+15551234567", message: "Your code is 123456" });
```

## File uploads

The upload plugin supports local disk and S3-compatible storage. Set
`UPLOAD_PROVIDER=local` or `UPLOAD_PROVIDER=s3` in the environment.

Use the decorated helper from any multipart route:

```js
fastify.post("/files", async (request) => {
  const part = await request.file();
  return fastify.uploadFile("products", part);
});
```

The helper can be called from any service with a folder name and multipart
file. It returns the persisted file record, including `id`, `storageKey`,
`mimeType`, and `size`. Only the relative `storageKey` is stored in the
database; construct local URLs as `/static/<storageKey>` so host and port
changes do not require database updates.

Local files are served from `/static/<storageKey>`. For S3, configure
`S3_BUCKET`, `S3_REGION`, credentials supported by the AWS SDK, and optionally
`S3_ENDPOINT` for S3-compatible providers.

To create a product with uploaded images, send `multipart/form-data` with a
`data` field containing the normal product JSON and one or more `images` file
fields:

```text
data: {"name":"Premium T-Shirt","slug":"premium-t-shirt","type":"VARIABLE"}
images: tshirt-front.jpg
images: tshirt-back.jpg
```

Each uploaded image is stored in `File`, and its `fileId` and returned `url`
are saved in `ProductImage`.

## Response format

Success:

```json
{
  "success": true,
  "message": "Product fetched successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Product not found",
  "error": {
    "code": "PRODUCT_NOT_FOUND"
  }
}
```
