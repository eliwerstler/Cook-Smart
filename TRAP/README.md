# TRAP - Social Drinking Tracker

A mobile application that gamifies social drinking by tracking "Beers Per Hour" (BPH) amongst friends and groups.

## Project Overview

TRAP is a social mobile app that helps users track their drinking sessions with friends. Users can:
- Take photos with their drinks and track alcohol consumption
- Calculate live BPH (Beers Per Hour) based on drink types and timestamps
- Share sessions with friends and groups
- View global drinking activity on a discover page
- Track lifetime statistics and achievements

## Tech Stack

### Frontend (Mobile)
- **React Native** with **Expo** - Cross-platform mobile development
- **TypeScript** - Type safety
- **React Navigation** - Navigation between screens
- **expo-camera** - Photo capture
- **expo-location** - Location services

### Backend
- **Node.js** with **Express** - REST API
- **TypeScript** - Type safety
- **Socket.io** - Real-time features
- **Prisma** - ORM for database management
- **PostgreSQL** - Primary database

### Infrastructure (Free Tier Services)
- **Supabase** or **Railway** - PostgreSQL hosting
- **Cloudinary** or **Supabase Storage** - Image storage
- **Railway** or **Render** - Backend hosting
- **Firebase Auth** - Authentication (optional)

## Project Structure

```
TRAP/
├── mobile/                 # React Native Expo app
│   ├── src/
│   │   ├── screens/       # App screens (Home, Profile, Groups, Discover)
│   │   ├── components/    # Reusable components
│   │   ├── navigation/    # Navigation configuration
│   │   ├── services/      # API calls
│   │   ├── hooks/         # Custom hooks
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Utility functions (BPH calculations)
│   └── package.json
│
├── backend/               # Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # Prisma models
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth, validation
│   │   ├── routes/       # API routes
│   │   ├── sockets/      # WebSocket handlers
│   │   └── utils/        # Helpers
│   ├── prisma/           # Database schema
│   └── package.json
│
├── shared/               # Shared TypeScript types
│   └── types/
│
└── docs/                 # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL (or use Supabase free tier)
- Expo CLI: `npm install -g expo-cli`

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd TRAP
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install

   # Copy environment variables
   cp .env.example .env
   # Edit .env with your database credentials

   # Generate Prisma client
   npm run prisma:generate

   # Run migrations (when database is ready)
   npm run prisma:migrate

   # Start development server
   npm run dev
   ```

3. **Mobile Setup**
   ```bash
   cd mobile
   npm install

   # Start Expo development server
   npm start

   # Run on iOS
   npm run ios

   # Run on Android
   npm run android
   ```

## Database Schema

### Core Models
- **User** - User accounts with statistics
- **Session** - Drinking sessions (start/end times, BPH)
- **Drink** - Individual drink posts with photos
- **Group** - Friend groups
- **Friendship** - User friendships
- **Like/Comment** - Social interactions

See `backend/prisma/schema.prisma` for full schema.

## Features

### Phase 1 - MVP
- [ ] User authentication
- [ ] Photo capture and drink logging
- [ ] BPH calculation
- [ ] Session management (auto-start/end)
- [ ] Basic profile

### Phase 2 - Social
- [ ] Friends and groups
- [ ] Home feed
- [ ] Likes and comments
- [ ] Group BPH leaderboards

### Phase 3 - Discovery
- [ ] Discover page (global activity)
- [ ] Location tagging
- [ ] Statistics dashboard

### Phase 4 - Polish
- [ ] Real-time updates
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Performance optimization

## BPH Calculation

BPH (Beers Per Hour) is calculated as:
```
BPH = Total Standard Drinks / Duration in Hours
```

- Live BPH uses current time vs session start
- Final session BPH uses first drink to last drink time
- Different drink types have different alcohol content values:
  - Beer: 1.0 standard
  - Wine: 1.5 standards
  - Spirits: 2.0 standards

## API Documentation

### Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/users/:id` - Get user profile
- `POST /api/drinks` - Create drink post
- `GET /api/feed` - Get home feed
- `GET /api/groups/:id` - Get group details

See full API documentation in `docs/API.md` (to be created).

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT
