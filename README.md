# Vanom Ecommerce - B2C Retail & B2B Wholesale Platform

An enterprise-grade ecommerce platform supporting both **B2C retail customers** and **B2B wholesale/bulk buyers** across **India**, the **United States**, and the **United Kingdom**.

---

## 📂 Repository Structure

- `backend/`: Enterprise Fastify, Node.js, Prisma ORM, PostgreSQL backend API with multi-tier pricing, MOQ, multi-warehouse inventory, business verification, quotes, tax, payments, and outbox pattern.
- `frontend/`: UI frontend client for B2C retail shopping and B2B wholesale portal.

---

## 🚀 Quickstart

### Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run seed
npm test
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
