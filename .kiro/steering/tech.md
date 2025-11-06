# Technology Stack & Build System

## Architecture
- **Type**: Full-stack web application (SPA + REST API)
- **Pattern**: Single Page Application with Express.js backend
- **Module System**: ES Modules (ESM)

## Frontend Stack
- **Framework**: React 19.1.1 with TypeScript 5.8.3
- **Build Tool**: Vite 7.1.2 (fast HMR, optimized builds)
- **Routing**: React Router DOM 7.8.2
- **State Management**: TanStack Query 5.90.5 (server state) + React Context (client state)
- **Styling**: TailwindCSS 4.1.12 with Radix UI components
- **Icons**: Lucide React + Tabler Icons
- **Charts**: Recharts 2.15.4
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner toast library

## Backend Stack
- **Runtime**: Node.js >=16.0.0
- **Framework**: Express.js 5.1.0
- **Database**: MySQL/MariaDB with mysql2 driver
- **Authentication**: JWT (jsonwebtoken) + bcrypt for password hashing
- **Security**: CORS enabled, 50MB payload limit for CSV imports
- **File Upload**: Multer middleware

## Development Tools
- **Linting**: ESLint 9.33.0 with TypeScript support
- **Type Checking**: TypeScript with strict mode
- **Path Aliases**: `@/*` maps to `./src/*`
- **Hot Reload**: Vite HMR with overlay disabled

## Common Commands

### Development
```bash
npm run dev          # Start frontend dev server (port 5173)
npm run server       # Start backend server (port 3001)
npm start            # Start both frontend and backend concurrently
```

### Build & Deploy
```bash
npm run build        # TypeScript compilation + Vite production build
npm run preview      # Preview production build locally
npm run lint         # Run ESLint code quality checks
```

### Database & Utilities
```bash
npm run import       # Import CSV data directly to database
npm run test-csv     # Validate CSV file format before import
npm run verify       # Verify database data integrity
npm run test-db      # Test database connection
```

## Environment Configuration
Required `.env` variables:
- `PORT=3001` - Backend server port
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - MySQL connection
- `JWT_SECRET` - JWT token signing key
- `CORS_ORIGIN` - Frontend URL for CORS (default: *)

## Build Optimizations
- **Code Splitting**: Manual chunks for react-vendor, ui-vendor, chart-vendor, utils-vendor
- **Bundle Analysis**: 1000kb chunk size warning limit
- **Minification**: esbuild for fast builds
- **Pre-bundling**: React, React DOM, React Router DOM, Lucide React, Recharts