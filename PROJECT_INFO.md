# Portfolio 404 — Project Documentation

> **New Version** (portfolio404new)  
> Old version at `portfolio.site` must NOT be touched.

---

## 🚀 Deployment & Hosting

| Service | Project Name | URL |
|---------|--------------|-----|
| **Vercel** | `portfolio404new` | https://portfolio404new.vercel.app |
| **GitHub** | `Te4c4h/portfolio404new` | https://github.com/Te4c4h/portfolio404new |

---

## 🗄️ Database

| Service | Project Name | Provider |
|---------|--------------|----------|
| **Neon** | `Portfolio404New` | PostgreSQL on AWS (eu-central-1) |

**Database URL:**
```
postgresql://neondb_owner:npg_yXmbTN3hA1Go@ep-dawn-mud-alwp2byf-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## 👤 User Accounts

### Admin User
| Field | Value |
|-------|-------|
| Username | `admin` |
| Email | `te4c4h@gmail.com` |
| Password | `Admin@2024!Portfolio` |
| Admin URL | https://portfolio404new.vercel.app/admin |

### Test User
| Field | Value |
|-------|-------|
| Username | `testuser` |
| Email | `test@example.com` |
| Password | `Test@2024!User` |
| Portfolio URL | https://portfolio404new.vercel.app/u/testuser |

### Home User (Landing Page)
| Field | Value |
|-------|-------|
| Username | `__home__` |
| Purpose | Powers the landing page content |

---

## 🔧 API Routes

| Endpoint | Purpose |
|----------|---------|
| `/api/seed` | Creates admin, test user, and home user. Call after fresh deploy. |
| `/api/debug-users` | Check what users exist in database |

---

## 📝 Environment Variables (Vercel)

Required variables in Vercel → Project Settings → Environment Variables:

```env
# Database
DATABASE_URL=postgresql://neondb_owner:npg_yXmbTN3hA1Go@ep-dawn-mud-alwp2byf-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# NextAuth.js (REQUIRED for login to work)
NEXTAUTH_SECRET=            # ← MUST be set! Generate with: openssl rand -base64 32
NEXTAUTH_URL=https://portfolio404new.vercel.app

# Admin
ADMIN_EMAIL=te4c4h@gmail.com
ADMIN_PASSWORD=Admin@2024!Portfolio

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (Optional - for verification emails)
RESEND_API_KEY=

# Payments (Optional)
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
```

---

## 🚨 Important Setup Steps

### First Time Deploy

1. **Deploy to Vercel** (auto from GitHub push)
2. **Set Environment Variables** in Vercel dashboard
3. **Seed Database** — visit: https://portfolio404new.vercel.app/api/seed
4. **Test Login** — go to `/login` and use admin credentials

### Build Command
```bash
prisma migrate deploy && prisma generate && next build
```

---

## 🔗 Quick Links

| Page | URL |
|------|-----|
| Home | https://portfolio404new.vercel.app/ |
| Login | https://portfolio404new.vercel.app/login |
| Register | https://portfolio404new.vercel.app/register |
| Admin Dashboard | https://portfolio404new.vercel.app/admin |
| Portfolio Catalog | https://portfolio404new.vercel.app/catalog |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin panel
│   ├── u/[username]/      # User portfolios
│   └── ...
├── components/            # React components
├── lib/                   # Utilities (auth, prisma, etc.)
└── ...

prisma/
├── schema.prisma          # Database schema
└── seed.js               # Database seeding script
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Auth:** NextAuth.js v5
- **Styling:** Tailwind CSS
- **UI:** shadcn/ui
- **Icons:** Lucide React
- **Images:** Cloudinary (optional)

---

## ⚠️ Critical Notes

1. **NEVER touch the old project** at `portfolio.site` — this is a completely separate deployment
2. **NEXTAUTH_SECRET must be set** — login will fail without it
3. **Call `/api/seed` after fresh database** — creates the admin and home users
4. **Build command includes Prisma migrate** — runs automatically on Vercel

---

Last updated: 2024
