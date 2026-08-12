# StoreHub — Smart Store Rating, Discovery & Analytics Platform

StoreHub is a full-stack SaaS web platform for discovering stores, managing customer rating feedback (1–5 stars), and viewing real-time analytics across platform roles (**Administrator**, **Store Owner**, **Customer**).

---

## 🚀 Key Features & Capabilities

### 🔐 Authentication & Single-Login System
- **Unified Login**: Common `/login` page supporting single-sign-on role detection for Admin (`/admin/dashboard`), Store Owner (`/owner/dashboard`), and Customer (`/user/dashboard`).
- **Security**: JWT authentication with Bearer tokens, bcrypt password hashing, input validation via Zod, Helmet HTTP security headers, CORS protection, and Express rate-limiting.
- **Validation Rules**:
  - Name: 20–60 characters.
  - Password: 8–16 characters with at least 1 uppercase letter and 1 special character.
  - Address: Maximum 400 characters.

### 🛡️ System Administrator Dashboard (`/admin/*`)
- **Real-Time Analytics**: Animated KPI metric cards (Total Users, Total Stores, Store Owners, Total Ratings, Platform Average Rating) and interactive Recharts graphs with time-range filtering (`7d`, `30d`, `90d`, `1y`).
- **Rating Breakdown & Trends**: Visualizes 1–5 star distribution, ratings over time, user role pie chart composition, top-rated stores, and most-reviewed stores.
- **User Management**: Add new users (Customer, Store Owner, Admin), edit profile information, toggle active/disabled status, delete accounts with modal confirmation, search, filter, and server-side pagination.
- **Store Management**: Create stores, assign store owners, update store details, toggle store status, delete listings.
- **Platform Rating Moderation**: Inspect customer review comments and delete inappropriate ratings with automatic store average recalculation.
- **Audit Activity Log**: Searchable and filterable history of all platform actions.
- **Data Export**: One-click CSV export downloads for Users, Stores, and Ratings.

### 👤 Customer Experience (`/user/*`)
- **Public Landing Page (`/`)**: Animated hero section, community top-rated stores showcase, platform stats, and features highlights.
- **Store Discovery Grid & List (`/user/stores`)**: Real-time store search by name, category, or address. Filter by rating minimum, location, and categories. Sort by A–Z, Z–A, highest rating, lowest rating, most rated, newest, or oldest.
- **1–5 Star Interactive Rating System**: Hover preview, star selection animations, review comment submission, edit existing rating capability. Enforces unique rating constraint per store in PostgreSQL (`userId + storeId`).
- **Store Details View (`/stores/:id`)**: High-res image header, store info, overall rating summary, 5-to-1 star percentage distribution bars, and customer review feed.
- **Favorites (`/user/favorites`)**: Heart toggle bookmarking stores saved in PostgreSQL database.
- **Rating History (`/user/ratings`)**: Full history of submitted ratings with quick edit and delete options.

### 🏪 Store Owner Dashboard (`/owner/*`)
- **Store Metrics**: Average store rating, total rating count, 5-star count, 1-star count, ratings this month.
- **Performance Summary**: Automatically calculates percentage improvement comparing this month's average rating vs last month.
- **Owner Analytics**: Donut chart for rating distribution and 6-month historical rating trend bar graph.
- **Customer Feedback Table (`/owner/customers`)**: View customer names, email addresses, star ratings, and review comments submitted specifically for their store.
- **Profile Management (`/owner/store`)**: Update storefront image URL, description, phone, website, address, and category.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Recharts, Framer Motion, Lucide React, Sonner, Axios |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM, JWT, bcryptjs, Zod, Helmet, CORS, Rate Limit, Jest, Supertest |
| **Database** | PostgreSQL |

---

## 📁 Directory Structure

```text
storehub/
├── client/
│   ├── src/
│   │   ├── components/common/ (Navbar, Sidebar, StatCard, RatingStars, Modal, ConfirmDialog, Pagination)
│   │   ├── context/          (AuthContext, ThemeContext)
│   │   ├── pages/            (LandingPage, LoginPage, RegisterPage)
│   │   ├── pages/admin/      (AdminDashboard, AdminUsersPage, AdminStoresPage, AdminRatingsPage, AdminActivityPage)
│   │   ├── pages/user/       (UserDashboard, StoreDiscoveryPage, StoreDetailsPage, UserFavoritesPage, UserRatingsPage)
│   │   ├── pages/owner/      (OwnerDashboard, OwnerStorePage, OwnerCustomersPage)
│   │   ├── services/         (api.ts)
│   │   ├── types/            (index.ts)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma     (User, Store, Rating, Favorite, ActivityLog)
│   │   └── seed.ts           (Seed 1 Admin, 3 Owners, 10 Users, 12 Stores, 70+ Ratings)
│   ├── src/
│   │   ├── config/           (index.ts)
│   │   ├── controllers/      (auth, user, store, rating, favorite, analytics, activity)
│   │   ├── middleware/       (auth, error)
│   │   ├── routes/           (auth, user, store, rating, favorite, analytics, activity)
│   │   ├── validators/       (Zod schemas)
│   │   ├── app.ts
│   │   └── server.ts
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example
├── README.md
└── package.json
```

---

## 🗝️ Demo Account Credentials

Default Demo Password for all seeded accounts: **`Password123!`**

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **System Administrator** | `admin@storehub.com` | `Password123!` |
| **Store Owner 1** | `owner1@storehub.com` | `Password123!` |
| **Store Owner 2** | `owner2@storehub.com` | `Password123!` |
| **Store Owner 3** | `owner3@storehub.com` | `Password123!` |
| **Customer 1** | `user1@storehub.com` | `Password123!` |
| **Customer 2** | `user2@storehub.com` | `Password123!` |

*(Note: The login page includes 1-click fill buttons for these accounts).*

---

## ⚡ Quick Start & Setup Instructions

### 1. Environment Configuration
Copy `.env.example` to `server/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/storehub_db?schema=public"
JWT_SECRET="storehub_super_secret_jwt_key_2026_change_in_production"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
```

### 2. Database Sync & Seeding
From the project root:
```bash
# Push Prisma schema to PostgreSQL
npm run db:migrate

# Seed database with realistic users, stores, ratings & activity history
npm run db:seed
```

### 3. Run Development Server
```bash
# Start both client and server concurrently
npm run dev
```
- Client running at: `http://localhost:5173`
- Backend API running at: `http://localhost:5000`

---

## 🧪 Testing

Run backend integration tests:
```bash
npm run test
```

---

## 📜 License
MIT License. Developed for StoreHub Platform.
