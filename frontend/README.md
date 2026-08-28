# Enterprise Ecommerce Frontend

One React + Vite + JavaScript project with three isolated application areas:

- Storefront: public B2C shopping
- B2B: approved company wholesale portal
- Admin: operational back office

## UI stack

- Tailwind CSS
- Lucide React
- TanStack Query
- Axios
- React Hook Form
- Zod
- Zustand

No MUI is used.

## Isolation

Routes and layouts are separated:

- `/` and `/products` -> StorefrontLayout
- `/b2b/*` -> B2BLayout
- `/admin/*` -> AdminLayout

The sample guards are placeholders. Production guards must validate authentication, company approval, roles and permissions using backend-issued claims and server authorization.

## Run

npm install
npm run dev
