# Elite Performer - 180-Day Transformation Tracker

A full-stack application for tracking personal development across coding, fitness, trading, and project management. Built with Next.js, Prisma, tRPC, and NextAuth.js following Cal.com's architecture.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **API Layer**: tRPC v11 (end-to-end type safety)
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Validation**: Zod
- **State Management**: TanStack React Query v5
- **Styling**: Tailwind CSS
- **Language**: TypeScript (strict mode, no `any` types)
- **UI Libraries**:
  - `@dnd-kit` for drag & drop functionality
  - `recharts` for data visualization
  - `papaparse` for CSV import/export
- **Deployment**: Netlify

## ✨ Features

### Authentication & Authorization
- Email/password authentication with bcrypt
- OAuth integration (Google, GitHub)
- Protected routes
- Multi-user support with data isolation

### Core Modules
- **Coding Tracker**: Manage courses and modules with progress tracking, drag & drop reordering, and CSV import
- **Fitness Logger**: Track weight, body fat, workouts, and calories with statistics
- **Trading Journal**: Log trades with P&L statistics, analytics, and performance metrics
- **Task Manager**: Schedule and track tasks across different categories with calendar view
- **Project Management**: Organize projects with linked tasks and progress tracking
- **Weekly Reviews**: Reflect on wins, mistakes, and goals integrated with task management
- **Settings**: Customizable user preferences and transformation date configuration

### Dashboard
- 180-day transformation progress tracking
- Overview of all modules
- Today's tasks
- Weekly activity summary

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 20+
- PostgreSQL database (local or cloud)
- npm or yarn

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd elite-performer
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/elite_performer"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
```

Optional OAuth providers:
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
elite-performer/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # NextAuth routes
│   │   │   ├── register/     # User registration
│   │   │   └── trpc/         # tRPC handler
│   │   ├── auth/             # Auth pages (login, signup)
│   │   ├── coding/           # Coding tracker pages
│   │   ├── fitness/          # Fitness logger pages
│   │   ├── projects/         # Project management pages
│   │   ├── tasks/            # Task manager pages
│   │   ├── trading/          # Trading journal pages
│   │   ├── review/           # Weekly review pages
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Dashboard
│   │   └── providers.tsx     # Client providers
│   ├── components/           # Reusable components
│   ├── lib/                  # Utilities
│   │   ├── prisma.ts        # Prisma client
│   │   ├── auth.ts          # NextAuth configuration
│   │   ├── auth-utils.ts    # Auth helpers
│   │   ├── trpc-client.ts   # tRPC client
│   │   └── validations/     # Zod schemas
│   ├── server/              # Server-side code
│   │   ├── trpc.ts         # tRPC setup
│   │   ├── context.ts      # tRPC context
│   │   └── routers/        # tRPC routers
│   ├── types/              # TypeScript types
│   └── utils/              # Helper functions
├── .env.example            # Environment variables template
├── netlify.toml           # Netlify configuration
├── MIGRATION_STATUS.md    # Migration progress
└── package.json
```

## 🔄 API Routes (tRPC)

All API routes are type-safe through tRPC:

- `codingCourses.*` - Course management
- `courseModules.*` - Module management
- `projects.*` - Project CRUD
- `tasks.*` - Task management
- `fitness.*` - Fitness logging with stats
- `trades.*` - Trading journal with P&L
- `reviews.*` - Weekly reviews
- `settings.*` - User settings

Example usage:
```typescript
const { data: courses } = trpc.codingCourses.getAll.useQuery()
const createMutation = trpc.codingCourses.create.useMutation()
```

## 🔐 Authentication

### Sign Up
Navigate to `/auth/signup` to create an account with:
- Name
- Email
- Password (minimum 8 characters)

Or use OAuth providers (Google/GitHub if configured).

### Sign In
Navigate to `/auth/login` to authenticate with:
- Email and password
- Or OAuth providers

## 🚢 Deployment

### Prerequisites

Before deploying, ensure you have:
1. ✅ All environment variables configured (see Setup Instructions)
2. ✅ PostgreSQL database set up and accessible
3. ✅ Database migrations run: `npx prisma migrate deploy`
4. ✅ Prisma client generated: `npx prisma generate`

### Netlify

1. Connect your repository to Netlify
2. Configure build settings:
   - Build command: `npm run build` (includes Prisma generate)
   - Publish directory: `.next`
   - Node version: 20.x or higher
3. Add environment variables in Netlify dashboard:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_URL` - Your production URL
   - `NEXTAUTH_SECRET` - Random secret (generate with `openssl rand -base64 32`)
   - OAuth provider credentials (if using)
4. Configure PostgreSQL database (Neon, Supabase, or Railway)
5. Run migrations: `npx prisma migrate deploy`
6. Deploy!

### Database Providers

**Recommended options:**
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Railway](https://railway.app) - Infrastructure platform

## 📝 Development

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

### Format Code
```bash
npx prettier --write .
```

### Database Management
```bash
# Create a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# View database in browser
npx prisma studio

# Seed database (optional)
npm run seed
```

## ✅ Current Status

The project is **fully migrated and production-ready**:

### Backend Infrastructure (100% Complete)
- ✅ Full authentication system with NextAuth v5
- ✅ All 8 tRPC routers implemented with end-to-end type safety
- ✅ Prisma schema with all models and relations
- ✅ Type-safe API layer with Zod validation
- ✅ Protected procedures with session-based authorization

### Frontend Pages (100% Complete)
All pages have been successfully migrated from client-side Dexie to server-side tRPC:
- ✅ **Dashboard** (`/`) - Overview with 180-day progress tracking
- ✅ **Coding Courses** (`/coding`) - Course management with drag & drop module reordering
- ✅ **Course Detail** (`/coding/[id]`) - Module management with CSV import
- ✅ **Fitness Tracker** (`/fitness`) - Weight, body fat, workouts, and calories logging
- ✅ **Trading Journal** (`/trading`) - Trade logging with P&L statistics and analytics
- ✅ **Task Manager** (`/tasks`) - Calendar view with weekly review integration
- ✅ **Projects** (`/projects`) - Project management with linked tasks
- ✅ **Weekly Reviews** (`/review`) - Reflection and goal tracking

### Additional Features
- ✅ Drag & drop module reordering using `@dnd-kit`
- ✅ CSV import functionality for bulk data entry
- ✅ Protected routes with authentication checks
- ✅ Responsive UI with Tailwind CSS
- ✅ Full type safety (no `any` types)
- ✅ Date handling with proper serialization
- ✅ Real-time data updates with React Query

See [MIGRATION_STATUS.md](./MIGRATION_STATUS.md) for detailed migration information.

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your own use.

## 📄 License

MIT

## 🙏 Acknowledgments

Built following the architecture of [Cal.com](https://github.com/calcom/cal.com), one of the best open-source Next.js applications.
