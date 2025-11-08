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
- **Deployment**: Netlify

## ✨ Features

### Authentication & Authorization
- Email/password authentication with bcrypt
- OAuth integration (Google, GitHub)
- Protected routes
- Multi-user support with data isolation

### Core Modules
- **Coding Tracker**: Manage courses and modules with progress tracking
- **Fitness Logger**: Track weight, body fat, workouts, and calories
- **Trading Journal**: Log trades with P&L statistics and analytics
- **Task Manager**: Schedule and track tasks across different categories
- **Project Management**: Organize projects with linked tasks
- **Weekly Reviews**: Reflect on wins, mistakes, and goals
- **Settings**: Customizable user preferences

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

### Netlify

1. Connect your repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Add environment variables in Netlify dashboard
4. Configure PostgreSQL database (Neon, Supabase, or Railway)
5. Deploy!

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

# Reset database
npx prisma migrate reset

# View database in browser
npx prisma studio
```

## ⚠️ Current Status

The backend infrastructure is **100% complete** with:
- ✅ Full authentication system
- ✅ All 8 tRPC routers implemented
- ✅ Prisma schema with all models
- ✅ Type-safe API layer
- ✅ Validation schemas

**Frontend pages need migration** from client-side Dexie to server-side tRPC. See [MIGRATION_STATUS.md](./MIGRATION_STATUS.md) for details and migration guide.

The **Dashboard page** has been successfully migrated and serves as a reference implementation.

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your own use.

## 📄 License

MIT

## 🙏 Acknowledgments

Built following the architecture of [Cal.com](https://github.com/calcom/cal.com), one of the best open-source Next.js applications.
