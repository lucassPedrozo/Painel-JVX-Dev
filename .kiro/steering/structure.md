# Project Structure & Organization

## Root Directory Layout
```
jvx-dev-v1/
├── src/                    # Frontend source code
├── public/                 # Static assets
├── server.js              # Express.js backend entry point
├── database-init-clean.sql # Database initialization script
├── *.js                   # Utility scripts (import, test, verify)
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite build configuration
├── tsconfig.*.json        # TypeScript configurations
└── .env.example           # Environment variables template
```

## Frontend Structure (`src/`)
```
src/
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (Radix UI + custom)
│   ├── dashboard/        # Dashboard-specific components
│   ├── skeletons/        # Loading skeleton components
│   ├── Header.tsx        # Main navigation header
│   ├── WorksTable.tsx    # Projects data table
│   ├── *Dialog.tsx       # Modal dialogs for CRUD operations
│   └── *.tsx             # Other feature components
├── contexts/             # React Context providers
│   ├── AuthContext.tsx   # Authentication state
│   ├── WorksContext.tsx  # Projects data state
│   └── NotificationsContext.tsx # Toast notifications
├── hooks/                # Custom React hooks
│   └── useWorks.ts       # Projects data management hook
├── lib/                  # Utility libraries
│   ├── api.ts           # API client functions
│   ├── utils.ts         # General utility functions
│   ├── constants.ts     # Application constants
│   └── pdf-export.ts    # PDF generation utilities
├── pages/               # Route components (page-level)
│   ├── Home.tsx         # Dashboard page
│   ├── Sites.tsx        # Projects management page
│   ├── Login.tsx        # Authentication page
│   └── *.tsx            # Other application pages
├── assets/              # Images, fonts, static files
├── App.tsx              # Root application component
├── main.tsx             # Application entry point
└── index.css            # Global styles and Tailwind imports
```

## Backend Structure
- **Single File Architecture**: `server.js` contains all backend logic
- **Modular Sections**: Authentication, CRUD routes, middleware, database connection
- **Utility Scripts**: Separate `.js` files for data import, testing, and verification

## Database Scripts
- `database-init-clean.sql` - Creates database schema and default admin user
- `importar-csv-direto.js` - Bulk CSV import utility
- `testar-*.js` - Various testing and verification scripts
- `verificar-*.js` - Data validation and structure checking scripts

## Configuration Files
- `vite.config.ts` - Frontend build configuration with path aliases and optimization
- `tsconfig.json` - TypeScript project references
- `tsconfig.app.json` - Frontend TypeScript configuration
- `tsconfig.node.json` - Node.js TypeScript configuration
- `eslint.config.js` - Code linting rules
- `components.json` - Shadcn/ui component configuration

## Naming Conventions
- **Components**: PascalCase (e.g., `WorksTable.tsx`, `EditWorkDialog.tsx`)
- **Pages**: PascalCase matching route names (e.g., `Sites.tsx`, `Analises.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useWorks.ts`)
- **Utilities**: camelCase (e.g., `api.ts`, `utils.ts`)
- **Constants**: UPPER_SNAKE_CASE in `constants.ts`
- **Database Scripts**: kebab-case with descriptive names

## Import Patterns
- Use `@/` alias for src imports: `import { api } from '@/lib/api'`
- Relative imports for same-directory files
- Group imports: external libraries, internal modules, relative imports
- Use named exports for utilities, default exports for components/pages

## File Organization Principles
- **Feature-based grouping**: Related components in same directory
- **Separation of concerns**: UI components, business logic, and utilities in separate directories
- **Single responsibility**: Each file has one primary purpose
- **Consistent naming**: Predictable file names based on functionality