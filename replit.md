# UniFlow - Academic Degree Planner

## Overview

UniFlow is a mobile-first academic degree planning application built with Expo (React Native) and an Express.js backend. It helps university students (specifically Computer Engineering students) track their degree progress, visualize course prerequisite chains, plan semesters, and calculate GPA. The app features a dark-themed UI with four main tabs: Dashboard, Prerequisite Map, Semester Planner, and GPA Tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, using the new architecture (`newArchEnabled: true`)
- **Routing**: File-based routing via `expo-router` v6 with typed routes. The app directory contains:
  - `app/(tabs)/` — Four tab screens: `index.tsx` (Dashboard), `map.tsx` (Prerequisite Map), `planner.tsx` (Semester Planner), `tools.tsx` (GPA/Grade Tools)
  - `app/course/[id].tsx` — Dynamic course detail screen
  - `app/_layout.tsx` — Root layout with providers (QueryClient, AcademicProvider, GestureHandler, KeyboardProvider)
- **State Management**: 
  - `@tanstack/react-query` for server data fetching (courses, offerings)
  - React Context (`AcademicProvider` in `lib/academic-context.tsx`) for local user profile state (completed courses, grades, semester plans)
  - `AsyncStorage` for persisting user profile data locally on device
- **Styling**: Dark theme by default using a centralized color palette (`constants/colors.ts`). No CSS-in-JS library — uses React Native `StyleSheet.create()` throughout.
- **Key UI Libraries**: `react-native-svg` (prerequisite graph/progress rings), `expo-linear-gradient`, `expo-blur`/`expo-glass-effect`, `expo-haptics` for tactile feedback
- **Fonts**: Inter font family (400, 500, 600, 700 weights) via `@expo-google-fonts/inter`

### Backend (Express.js)

- **Runtime**: Node.js with TypeScript (compiled via `tsx` in dev, `esbuild` for production)
- **Server file**: `server/index.ts` — Express app with CORS handling for Replit domains and localhost
- **API Routes** (`server/routes.ts`):
  - `GET /api/courses` — All courses with prerequisites
  - `GET /api/courses/:id` — Single course with prerequisites, unlocks, and offerings
  - `GET /api/offerings` — All course offerings (schedule data)
- **Data Seeding**: `server/seed-data.ts` contains hardcoded course catalog data for a Computer Engineering program, seeded into the database on server start via `storage.seedData()`
- **Storage Layer**: `server/storage.ts` — `DatabaseStorage` class implementing `IStorage` interface, using Drizzle ORM with PostgreSQL

### Shared Code

- `shared/schema.ts` — Drizzle ORM schema definitions and Zod validation schemas shared between frontend and backend
- Path alias `@shared/*` maps to `./shared/*` for cross-platform imports

### Database (PostgreSQL + Drizzle ORM)

- **ORM**: Drizzle ORM with `drizzle-zod` for schema validation
- **Config**: `drizzle.config.ts` points to PostgreSQL via `DATABASE_URL` environment variable
- **Tables**:
  - `users` — id (UUID), username, password
  - `courses` — id, code, title, credits, description, category, year, semester
  - `prerequisites` — id, courseId (FK → courses), requiresCourseId (FK → courses)
  - `offerings` — id, courseId (FK → courses), semester, campus, instructor, dayOfWeek, startTime, endTime, room
- **Migrations**: Output to `./migrations/` directory. Use `npm run db:push` (drizzle-kit push) to sync schema

### Build & Deployment

- **Dev mode**: Two processes needed — `npm run expo:dev` (Expo Metro bundler) and `npm run server:dev` (Express API)
- **Production build**: `npm run expo:static:build` builds the Expo web bundle, `npm run server:build` bundles the Express server with esbuild, `npm run server:prod` serves the production app
- **Environment**: Relies on Replit environment variables (`REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, `DATABASE_URL`, `EXPO_PUBLIC_DOMAIN`)
- **Port**: The Express server runs on port 5000 (standard Replit configuration)

### Key Design Decisions

1. **Local-first user data**: User progress (completed courses, grades, semester plans) is stored in AsyncStorage on the device rather than in the database. This simplifies the app by not requiring authentication for basic functionality, though it means data doesn't sync across devices.

2. **Shared schema**: The Drizzle schema in `shared/schema.ts` is used by both the server (for database operations) and the client (for TypeScript types), ensuring type consistency.

3. **Prerequisite graph visualization**: The Map tab renders an SVG-based directed graph of course prerequisites using `react-native-svg`, with courses positioned by year/semester and color-coded by completion status.

4. **Seed-based course catalog**: The course catalog uses the official CENG (Bachelor of Science in Computer Engineering) plan of study with 49 courses across foundation year (Year 0), three academic years, and electives. Data includes 8 foundation courses, 13 Year 1 courses, 14 Year 2 courses, 12 Year 3 courses, and 2 electives, plus 79 prerequisite relationships and 54 course offerings.

## External Dependencies

- **PostgreSQL Database**: Required. Connected via `DATABASE_URL` environment variable. Used for storing course catalog, prerequisites, and offerings data.
- **Expo SDK 54**: Core mobile framework. Provides native module access (haptics, image picker, location, etc.)
- **Replit Environment**: The app is designed to run on Replit, using Replit-specific environment variables for domain configuration and CORS.
- **Google Fonts (Inter)**: Loaded at runtime via `@expo-google-fonts/inter`.
- **No external auth service**: Users table exists in schema but authentication is not currently implemented.
- **No external APIs**: All data is self-contained in the PostgreSQL database.