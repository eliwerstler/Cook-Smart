# TRAP Project Summary

## Overview
TRAP is a social drinking tracking mobile app that gamifies drinking with friends through "Beers Per Hour" (BPH) tracking.

## Tech Stack (All Free & Industry Standard)

### Frontend
- **React Native (Expo)** - Cross-platform mobile
- **TypeScript** - Type safety
- **React Navigation** - Navigation
- **expo-camera** - Photo capture

### Backend
- **Node.js + Express** - REST API
- **TypeScript** - Type safety
- **Socket.io** - Real-time features
- **Prisma** - Database ORM

### Database
- **PostgreSQL** - Primary database
- **Supabase** (recommended) or Railway - Hosting

### Storage
- **Cloudinary** - Image storage (25GB free)

### Hosting
- **Railway** - Backend hosting ($5 free credit/month)
- **Expo EAS** - Mobile app builds

## Project Structure

```
TRAP/
├── mobile/         # React Native app (4 screens)
├── backend/        # Express API + WebSockets
├── shared/         # Shared TypeScript types
└── docs/           # Comprehensive documentation
```

## Key Features

1. **Drink Tracking**
   - Photo capture with each drink
   - Track drink type and alcohol content
   - Auto session management

2. **BPH Calculation**
   - Live BPH based on current time
   - Session BPH (first to last drink)
   - Lifetime statistics

3. **Social**
   - Friends system
   - Groups (like close friends)
   - Home feed with likes/comments
   - Global discover page

4. **Four Main Screens**
   - Home (feed)
   - Groups (group leaderboards)
   - Drink Button (center, camera)
   - Discover (global activity)
   - Profile (stats, session grid)

## Database Models

- **User** - Accounts and lifetime stats
- **Session** - Drinking sessions with BPH
- **Drink** - Individual drink posts
- **Group** - Friend groups
- **Friendship** - User connections
- **Like/Comment** - Social interactions

## Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Add DATABASE_URL to .env
npm run prisma:generate
npm run prisma:migrate
npm run dev

# Mobile
cd mobile
npm install
npm start
```

## Documentation

- **README.md** - Project overview
- **docs/GETTING_STARTED.md** - Setup guide
- **docs/ARCHITECTURE.md** - System architecture
- **docs/TECH_STACK.md** - Complete tech breakdown
- **docs/DEVELOPMENT.md** - Development workflow
- **PLAN.md** - Original requirements

## Current Status

✅ Project initialized
✅ Directory structure created
✅ Mobile app (React Native + Expo) set up
✅ Backend (Express + TypeScript) set up
✅ Database schema designed (Prisma)
✅ Shared types configured
✅ Documentation complete

## Next Steps (Development Phases)

### Phase 1: Authentication (~1-2 days)
- [ ] JWT middleware
- [ ] Login/register endpoints
- [ ] Auth screens (mobile)
- [ ] Protected routes

### Phase 2: Core Features (~3-5 days)
- [ ] Camera integration
- [ ] Drink posting
- [ ] Session management
- [ ] BPH calculation

### Phase 3: Social (~3-4 days)
- [ ] Friends system
- [ ] Groups
- [ ] Home feed
- [ ] Likes/comments

### Phase 4: Discovery & Polish (~2-3 days)
- [ ] Discover page
- [ ] Statistics dashboard
- [ ] Real-time updates
- [ ] Performance optimization

## Free Services Being Used

| Service | Free Tier | Usage |
|---------|-----------|-------|
| Supabase | 500MB DB, 1GB storage | Database + Files |
| Railway | $5/month credit | Backend hosting |
| Cloudinary | 25GB storage/bandwidth | Images |
| Expo | 30 builds/month | Mobile builds |

**Total: $0/month** until you have users!

## Key Files to Start With

1. `mobile/App.tsx` - Main mobile app
2. `backend/src/index.ts` - API server
3. `backend/prisma/schema.prisma` - Database models
4. `shared/types/index.ts` - Shared types

## Development Commands

```bash
# Backend
npm run dev              # Development server
npm run prisma:studio    # Database GUI
npm run prisma:migrate   # Run migrations

# Mobile
npm start               # Start Expo
npm run ios            # Run on iOS
npm run android        # Run on Android
```

## Goals

- **Lightweight** - Keep bundle size minimal
- **Fast** - Optimize for performance
- **Free** - Use only free-tier services
- **Clean** - Instagram-style UI
- **Smooth** - 60 FPS animations

## Contact & Support

- Check documentation in `docs/`
- Review code comments
- Test incrementally
- Keep it simple!
