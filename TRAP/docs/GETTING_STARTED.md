# Getting Started with TRAP

## Quick Start (5 minutes)

### Prerequisites
```bash
# Check Node.js version (need 18+)
node --version

# Install Expo CLI globally
npm install -g expo-cli

# Install PostgreSQL or sign up for Supabase
```

### 1. Clone and Install

```bash
# Navigate to project
cd TRAP

# Install backend dependencies
cd backend
npm install

# Install mobile dependencies
cd ../mobile
npm install

# Install shared dependencies
cd ../shared
npm install
```

### 2. Set Up Database

#### Option A: Supabase (Recommended - Free)
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project (takes ~2 minutes)
3. Go to Settings > Database > Connection String
4. Copy the URI and update `backend/.env`:

```bash
cd backend
cp .env.example .env
# Edit .env and paste your DATABASE_URL
```

#### Option B: Local PostgreSQL
```bash
# Start PostgreSQL
brew services start postgresql@16

# Create database
createdb trap_db

# Update backend/.env
DATABASE_URL="postgresql://localhost:5432/trap_db?schema=public"
```

### 3. Run Database Migrations

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
You should see: `🚀 Server running on port 3000`

**Terminal 2 - Mobile:**
```bash
cd mobile
npm start
```

Scan QR code with:
- **iOS**: Camera app
- **Android**: Expo Go app

## Project Structure Overview

```
TRAP/
├── mobile/              # React Native Expo app
│   ├── src/
│   │   ├── screens/    # App screens
│   │   ├── components/ # Reusable components
│   │   ├── navigation/ # Navigation setup
│   │   ├── services/   # API calls
│   │   ├── hooks/      # Custom hooks
│   │   ├── contexts/   # React Context
│   │   └── utils/      # BPH calculations
│   └── package.json
│
├── backend/            # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── shared/            # Shared TypeScript types
│   └── types/
│
└── docs/             # Documentation
    ├── ARCHITECTURE.md
    ├── DEVELOPMENT.md
    ├── TECH_STACK.md
    └── GETTING_STARTED.md
```

## Next Steps

### Phase 1: Authentication (First Feature)
1. Set up JWT authentication
2. Create login/register screens
3. Implement protected routes

### Phase 2: Core Drinking Feature
1. Camera screen for taking drink photos
2. Drink type selection
3. Session management
4. BPH calculation

### Phase 3: Social Features
1. User profiles
2. Friends system
3. Groups
4. Home feed

### Phase 4: Discovery & Analytics
1. Global discover page
2. Statistics dashboard
3. Leaderboards

## Development Commands

### Backend
```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open database GUI
```

### Mobile
```bash
# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## Environment Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Expo CLI installed globally
- [ ] Database setup (Supabase or local PostgreSQL)
- [ ] Backend `.env` file created with DATABASE_URL
- [ ] Backend dependencies installed
- [ ] Mobile dependencies installed
- [ ] Prisma client generated
- [ ] Database migrations run
- [ ] Backend server starts successfully
- [ ] Mobile app runs in Expo Go

## Testing Your Setup

### Test Backend
```bash
# Should return: {"status":"ok","message":"TRAP API is running"}
curl http://localhost:3000/health
```

### Test Database
```bash
cd backend
npm run prisma:studio
# Opens GUI at http://localhost:5555
```

### Test Mobile
1. Open Expo Go app on phone
2. Scan QR code from terminal
3. App should load (currently shows blank template)

## Common Setup Issues

### Backend won't start
```bash
# Check if port 3000 is in use
lsof -ti:3000 | xargs kill -9

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Prisma errors
```bash
# Regenerate Prisma client
npm run prisma:generate

# Reset database (WARNING: deletes all data)
npm run prisma:migrate reset
```

### Mobile app won't load
```bash
# Clear Expo cache
expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

## Recommended VS Code Extensions

- **Prisma** - Syntax highlighting for schema
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **React Native Tools** - React Native debugging
- **TypeScript Vue Plugin** - TypeScript support

## Learning Resources

### React Native
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)

### Backend
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Docs](https://www.prisma.io/docs/)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Getting Help

1. Check existing documentation in `docs/`
2. Search GitHub issues
3. Ask in team chat
4. Read error messages carefully - they usually point to the solution

## Ready to Code?

Start with these files:

1. **Mobile**: `mobile/App.tsx` - Main app component
2. **Backend**: `backend/src/index.ts` - Server entry point
3. **Database**: `backend/prisma/schema.prisma` - Database models
4. **Types**: `shared/types/index.ts` - Shared TypeScript types

### First Task Recommendation

Create the authentication system:
1. Add JWT middleware to backend
2. Create register/login endpoints
3. Build auth screens in mobile app
4. Test end-to-end authentication flow

Check `docs/DEVELOPMENT.md` for detailed development workflow!
