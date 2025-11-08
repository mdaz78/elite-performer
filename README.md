# Elite Performer

A comprehensive personal productivity and transformation tracking application designed to help you track your progress across multiple areas of personal and professional development during a 180-day transformation journey.

## Features

### 📊 Dashboard
- Overview of all your progress metrics in one place
- 180-day transformation progress tracker
- Quick access to all major sections

### 💻 Coding & Learning
- **Coding Courses**: Track your progress through coding courses with modules

### 💪 Fitness Tracking
- Log your weight, body fat percentage, and measurements
- Track workout types and calories
- Add notes for each fitness session
- View weekly fitness activity summaries

### 📈 Trading Journal
- Record trades with entry/exit prices
- Track P&L (Profit & Loss)
- Monitor win rate and trading statistics
- Log emotions and notes for each trade

### ✅ Task Management
- Daily task scheduling and tracking
- Task types: Deep Work, Gym, Trading Practice, Coding, Review, Other
- Link tasks to projects
- Mark tasks as completed

### 🚀 Projects
- Track active, completed, and paused projects
- Set start and target dates
- Link tasks to projects

### 📝 Weekly Reviews
- Reflect on wins and mistakes
- Set goals for the next week
- Track weekly metrics

### 📥 Data Management
- Import data from CSV files
- Export your data for backup
- All data stored locally in your browser (IndexedDB)

## Tech Stack

- **Framework**: Next.js 15 with React 19 and TypeScript
- **Routing**: Next.js App Router (file-based routing)
- **Database**: Dexie (IndexedDB wrapper for client-side storage)
- **Styling**: Tailwind CSS v3
- **Charts**: Recharts
- **Date Handling**: Day.js
- **CSV Processing**: PapaParse
- **File Export**: File-saver

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd elite-performer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal)

### Building for Production

```bash
npm run build
```

The production build will be in the `.next` directory. You can start the production server with:

```bash
npm start
```

## Available Scripts

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
elite-performer/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Dashboard (home page)
│   │   ├── coding/          # Coding pages
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── fitness/
│   │   ├── trading/
│   │   ├── tasks/
│   │   ├── projects/
│   │   └── review/
│   ├── components/          # Reusable UI components
│   │   ├── Card.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── CsvImporter.tsx
│   │   ├── Header.tsx
│   │   ├── ProgressBar.tsx
│   │   └── index.ts
│   ├── db/                  # Database configuration
│   │   ├── index.ts         # Dexie database setup
│   │   └── seed.ts          # Seed data
│   ├── pages/               # Legacy page components (can be removed)
│   ├── types/               # TypeScript type definitions
│   │   └── index.d.ts
│   ├── utils/               # Utility functions
│   │   ├── date.ts
│   │   └── export.ts
│   └── index.css            # Global styles
├── public/                  # Static assets
├── package.json
├── tsconfig.json            # TypeScript configuration
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── postcss.config.js        # PostCSS configuration
```

## Data Storage

All data is stored locally in your browser using IndexedDB (via Dexie). This means:
- Your data stays private and never leaves your device
- No account or login required
- Data persists across browser sessions
- You can export your data for backup

## Development

### Code Style

The project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

### Adding New Features

1. Define types in `src/types/index.d.ts`
2. Add database tables in `src/db/index.ts` if needed
3. Create page components in `src/app/` (Next.js App Router)
4. Routes are automatically created based on file structure
5. Update the Header navigation if needed

## License

This project is private and for personal use.

## Contributing

This is a personal project. If you'd like to use it as a template for your own transformation tracking app, feel free to fork and customize it to your needs!
