# RUSH — Premium Streetwear Ecommerce

Production-grade scalable ecommerce platform built with Next.js 15, Express, and MongoDB.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn-style UI, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + Refresh Tokens + HTTP-only Cookies |
| State | Zustand |
| Validation | Zod |
| Forms | React Hook Form |
| Payments | Stripe + Razorpay (structure ready) |
| Uploads | Cloudinary (structure ready) |

## Monorepo Structure

```
rush/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   └── api/          # Express REST API
├── packages/
│   └── shared/       # Shared TypeScript types & constants
├── docs/
│   └── ARCHITECTURE.md
└── package.json      # npm workspaces
```

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Install dependencies

```bash
npm install
npm run build --workspace=@rush/shared
```

### 2. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 3. Seed database

```bash
npm run seed --workspace=@rush/api
```

**Demo accounts:**
- Admin: `admin@rush.com` / `Admin@123`
- User: `user@rush.com` / `User@1234`

### 4. Run development

```bash
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:5000/api/v1/health

## Features

- JWT auth with refresh tokens, forgot/reset password, email verification structure
- Role-based access (user / admin)
- Product listing with debounced search, filters, sort, pagination
- Product detail with variants (size, color), cart, wishlist
- Checkout with tax, shipping, coupons
- Order tracking timeline
- Admin dashboard (stats, products, orders, users)
- Dark / light theme
- Mock data fallback when API is offline

## Deployment

| Service | Platform | App |
|---------|----------|-----|
| Frontend | [Vercel](https://vercel.com) | `apps/web` |
| API | [Render](https://render.com) | `apps/api` |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) | — |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full architecture, API reference, and scaling guide.

## License

Private — RUSH © 2026
