# StoreHub

### Smart Store Discovery, Ratings & Analytics Platform

StoreHub is a full-stack platform that connects customers with trusted local businesses through transparent ratings, reviews, store discovery, and actionable analytics.

The platform provides a unified ecosystem for three user roles:

- **Customers** — discover stores, rate experiences, write reviews, and save favorites.
- **Store Owners** — monitor customer feedback, understand rating trends, and manage their store presence.
- **Administrators** — manage users, stores, ratings, platform activity, and business analytics.

---

## Overview

StoreHub is designed to make local business discovery more transparent and data-driven.

Customers can discover businesses, explore ratings and reviews, and share their experiences.

Store owners can understand how customers perceive their business through real-time rating analytics and feedback.

Administrators can manage the complete platform through a centralized management dashboard.

### Core Flow

```text
Customer
   │
   ├── Discover Store
   │
   ├── View Ratings & Reviews
   │
   ├── Rate Store
   │
   ├── Write Review
   │
   └── Save Favorite
          │
          ▼
      StoreHub
          │
          ├── Rating Analytics
          ├── Store Performance
          ├── Customer Feedback
          └── Platform Analytics
                    │
                    ▼
              Store Owner / Admin
Product Highlights
Customer Experience

Customers get a modern store discovery experience with:

Store search
Category-based discovery
Location-based filtering
Rating-based filtering
Sorting and pagination
Store details
Rating distribution
Customer reviews
Interactive 1–5 star rating
Review submission
Rating updates
Favorite stores
Rating history
Personalized dashboard
Rating Experience

Customers can:

Select Rating
      ↓
Write Review
      ↓
Submit Feedback
      ↓
Store Rating Updated
      ↓
Analytics Updated
      ↓
Store Owner Notified Through Dashboard

Each customer can maintain a single rating per store, with the ability to update their existing rating.

Store Owner Experience

Store owners receive a dedicated analytics workspace for understanding customer feedback.

Dashboard Metrics
Average rating
Total ratings
Five-star ratings
One-star ratings
Monthly ratings
Rating trends
Rating distribution
Customer feedback
Performance Analytics

Store owners can visualize:

Rating distribution
Historical rating trends
Monthly performance
Customer feedback
Store profile information

This allows businesses to identify strengths and areas that may require improvement.

Administrator Experience

Administrators have complete control over the platform.

User Management

Administrators can:

Create users
Edit users
Delete users
Activate/deactivate accounts
Search users
Filter by role
Filter by account status
Assign roles
View user information

Supported roles:

ADMIN
STORE_OWNER
USER
Store Management

Administrators can:

Create stores
Edit stores
Delete stores
Activate/deactivate stores
Assign store owners
Manage store categories
Manage store contact information
Manage store descriptions
Manage store images
Rating Management

Administrators can:

View customer ratings
Review submitted comments
Moderate inappropriate reviews
Delete ratings
Monitor rating trends
View platform-wide rating statistics

Store averages are automatically recalculated whenever ratings are created, updated, or removed.

Platform Analytics

The administrator dashboard provides interactive analytics including:

Total users
Total stores
Total ratings
Store owners
Platform average rating
Rating distribution
Rating trends
User growth
Store growth
Role distribution
Top-rated stores
Most-reviewed stores

Supported analytics ranges:

7 Days
30 Days
90 Days
1 Year
All Time
Security

StoreHub is designed with a security-focused backend architecture.

Authentication
JWT-based authentication
Bearer token authorization
bcrypt password hashing
Role-based access control
Protected API routes
Session validation
API Security
Helmet security headers
CORS protection
Express rate limiting
Zod request validation
Centralized error handling
Input sanitization
Protected administrative endpoints
Authorization

Every protected request is validated against the authenticated user's role.

ADMIN
 ├── User Management
 ├── Store Management
 ├── Rating Moderation
 ├── Analytics
 └── Activity Logs

STORE_OWNER
 ├── Store Analytics
 ├── Customer Feedback
 └── Store Profile

USER
 ├── Store Discovery
 ├── Ratings
 ├── Reviews
 ├── Favorites
 └── Rating History
Technology Stack
Frontend
Technology	Purpose
React	User interface
TypeScript	Type safety
Vite	Frontend tooling
Tailwind CSS	UI styling
Framer Motion	Animations
Recharts	Analytics & charts
Lucide React	Interface icons
Axios	API communication
Sonner	Notifications
Backend
Technology	Purpose
Node.js	Runtime
Express.js	REST API
TypeScript	Type safety
Prisma	ORM
JWT	Authentication
bcryptjs	Password hashing
Zod	Request validation
Helmet	HTTP security
CORS	Cross-origin protection
Express Rate Limit	API protection
Jest	Testing
Supertest	API testing
Database

PostgreSQL

Core entities:

User
Store
Rating
Favorite
ActivityLog
System Architecture
┌─────────────────────────────────────┐
│             StoreHub UI             │
│          React + TypeScript         │
│         Vite + Tailwind CSS         │
└──────────────────┬──────────────────┘
                   │
                   │ REST API / HTTPS
                   ▼
┌─────────────────────────────────────┐
│          StoreHub Backend            │
│       Node.js + Express + TS        │
├─────────────────────────────────────┤
│ Authentication & Authorization      │
│ User Management                     │
│ Store Management                    │
│ Rating Management                   │
│ Favorites                           │
│ Analytics                           │
│ Activity Logs                       │
└──────────────────┬──────────────────┘
                   │
                   │ Prisma ORM
                   ▼
┌─────────────────────────────────────┐
│           PostgreSQL                │
├─────────────────────────────────────┤
│ Users                               │
│ Stores                              │
│ Ratings                             │
│ Favorites                           │
│ Activity Logs                       │
└─────────────────────────────────────┘
Database Design
User

Stores authentication and account information.

User
├── id
├── name
├── email
├── password
├── role
├── address
├── status
└── createdAt
Store

Stores business information.

Store
├── id
├── name
├── category
├── address
├── description
├── phone
├── website
├── image
├── ownerId
└── status
Rating

Stores customer feedback.

Rating
├── id
├── userId
├── storeId
├── rating
├── review
├── createdAt
└── updatedAt

A unique constraint prevents duplicate ratings:

(userId + storeId)
Favorite

Stores customer bookmarks.

Favorite
├── id
├── userId
├── storeId
└── createdAt
ActivityLog

Tracks important platform actions.

ActivityLog
├── id
├── userId
├── action
├── metadata
└── createdAt
Project Structure
storehub/
│
├── client/
│   ├── public/
│   │
│   └── src/
│       ├── components/
│       │   └── common/
│       │
│       ├── context/
│       │   ├── AuthContext
│       │   └── ThemeContext
│       │
│       ├── pages/
│       │   ├── LandingPage
│       │   ├── LoginPage
│       │   └── RegisterPage
│       │
│       ├── pages/admin/
│       ├── pages/user/
│       ├── pages/owner/
│       │
│       ├── services/
│       │
│       ├── types/
│       │
│       ├── App.tsx
│       └── main.tsx
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── validators/
│       ├── app.ts
│       └── server.ts
│
├── .gitignore
├── .env.example
├── package.json
└── README.md
Getting Started
Prerequisites

Install:

Node.js 18+
npm
PostgreSQL
Git

Verify:

node --version
npm --version
psql --version
Installation

Clone the repository:

git clone https://github.com/ShreyashMehta179/STORE-RATING-PLATFORM.git

Navigate into the project:

cd STORE-RATING-PLATFORM

Install dependencies:

npm install

Install client dependencies:

cd client
npm install
cd ..

Install server dependencies:

cd server
npm install
cd ..
Environment Configuration

Create:

server/.env

Example:

PORT=5000
NODE_ENV=development

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/storehub_db?schema=public"

JWT_SECRET="YOUR_SECRET_KEY"
JWT_EXPIRES_IN="7d"

CLIENT_URL="http://localhost:5173"

Never commit .env to Git.

Use .env.example for sharing configuration structure.

Database Setup

Create the PostgreSQL database:

CREATE DATABASE storehub_db;

Run Prisma migrations:

npx prisma migrate dev

Generate Prisma Client:

npx prisma generate

Seed development data:

npm run db:seed
Running the Application

Start the development environment:

npm run dev

Frontend:

http://localhost:5173

Backend:

http://localhost:5000

Health check:

http://localhost:5000/health
Testing

Run backend tests:

npm run test

Build the frontend:

cd client
npm run build

Build the backend:

cd server
npm run build
Production Deployment

StoreHub can be deployed using:

Frontend
   ↓
Vercel

Backend
   ↓
Render

Database
   ↓
PostgreSQL
Production Architecture
Customer
    │
    ▼
Vercel
React + Vite
    │
    │ HTTPS
    ▼
Render
Express + Node.js
    │
    │ Prisma
    ▼
PostgreSQL

For production database migrations:

npx prisma migrate deploy

Production environment variables should be configured directly through the hosting provider.

API Modules

The backend is organized into REST API modules.

/api/auth
/api/users
/api/stores
/api/ratings
/api/favorites
/api/analytics
/api/activity
Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
Stores
GET    /api/stores
GET    /api/stores/:id
POST   /api/stores
PUT    /api/stores/:id
DELETE /api/stores/:id
Ratings
GET    /api/ratings
POST   /api/ratings
PUT    /api/ratings/:id
DELETE /api/ratings/:id
Favorites
GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/:storeId

Actual routes may vary based on the current implementation.

User Roles
Administrator

Responsible for:

Platform management
User management
Store management
Rating moderation
Analytics
Activity monitoring
Data exports
Store Owner

Responsible for:

Store profile
Customer feedback
Rating analytics
Performance monitoring
Customer

Responsible for:

Store discovery
Ratings
Reviews
Favorites
Personal rating history
Design System

StoreHub follows a clean, modern visual system designed around trust and local commerce.

Primary Visual Language
StoreHub Green
White
Soft neutral backgrounds
Gold rating stars
Subtle shadows
Rounded cards
Smooth transitions
Responsive layouts
Interaction Design

The interface uses:

Framer Motion animations
Hover states
Animated rating stars
Interactive charts
Toast notifications
Modal interactions
Smooth page transitions
Responsive navigation

Animations are intentionally subtle to maintain a professional SaaS experience.

Data & Analytics

StoreHub calculates platform metrics from actual PostgreSQL data.

Examples:

Average Store Rating
Total Ratings
Rating Distribution
Monthly Rating Growth
User Growth
Store Growth
Most Reviewed Stores
Top Rated Stores

Analytics are not hardcoded and are generated from database records.

Security Considerations

The following must never be committed:

.env
DATABASE_URL
JWT_SECRET
Database passwords
API keys
Production credentials

For production:

Use HTTPS
Use a strong JWT secret
Configure CORS to the production frontend
Use secure database credentials
Enable database backups
Use environment variables for secrets
Keep dependencies updated
Roadmap

Future StoreHub improvements may include:

Google authentication
Email verification
Password reset through email
Store owner registration approval
Location-based discovery
Maps integration
Advanced recommendation engine
AI-powered review summarization
Sentiment analysis
Business insights
Notifications
Review helpfulness voting
Image uploads for reviews
Store claim verification
Advanced admin reporting
PWA/mobile experience
Project Status

Status: Active Development

StoreHub currently provides a complete foundation for:

Authentication
        +
Role-Based Access Control
        +
Store Discovery
        +
Ratings & Reviews
        +
Favorites
        +
Store Owner Analytics
        +
Admin Management
        +
Platform Analytics
License

This project is licensed under the MIT License.

Author

Shreyash Mehta

Computer Science & Engineering

Full-Stack Developer | AI/ML | Software Development

StoreHub

Discover better. Share experiences. Build trust.


### One thing I strongly recommend changing

Your current README says:

> **Default Demo Password for all seeded accounts: `Password123!`**

and lists the admin credentials publicly.

For a **company/public GitHub repository**, I would remove that entire credentials table.

Instead put:

```markdown
## Development Demo Accounts

Demo credentials are available in the local development seed configuration.

Do not use development credentials in production.
