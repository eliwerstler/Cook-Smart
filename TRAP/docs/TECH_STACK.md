# TRAP Technology Stack

## Complete Technology Breakdown

### Frontend (Mobile Application)

#### Core Framework
- **React Native 0.74+**
  - Cross-platform mobile development
  - Native performance
  - Single JavaScript codebase

- **Expo SDK 54+**
  - Managed workflow
  - Built-in native modules
  - Easy deployment and OTA updates
  - Free tier available

#### Language
- **TypeScript 5.9+**
  - Static typing
  - Better IDE support
  - Fewer runtime errors

#### Navigation
- **React Navigation v6**
  - @react-navigation/native
  - @react-navigation/bottom-tabs (4 main screens)
  - @react-navigation/stack (modals, details)

#### Native Features
- **expo-camera** - Photo capture
- **expo-image-picker** - Photo selection
- **expo-location** - GPS coordinates
- **expo-image** - Optimized image rendering
- **expo-secure-store** - Secure token storage

#### State Management
- **React Context API**
  - AuthContext (user session)
  - SessionContext (active drinking session)
  - SocketContext (WebSocket connection)

#### HTTP Client
- **Axios** or **fetch API**
  - REST API calls
  - Request/response interceptors
  - Token management

#### Real-Time
- **Socket.io Client**
  - WebSocket connection
  - Real-time updates
  - Event handling

#### Styling
- **React Native StyleSheet**
- **NativeWind** (optional - Tailwind for RN)

---

### Backend (API Server)

#### Runtime & Framework
- **Node.js 18+ LTS**
  - JavaScript runtime
  - Event-driven, non-blocking I/O

- **Express.js 5.x**
  - Minimalist web framework
  - Middleware support
  - REST API routing

#### Language
- **TypeScript 5.9+**
  - Type safety across backend
  - Better maintainability

#### Database ORM
- **Prisma 6.x**
  - Type-safe database client
  - Schema migrations
  - Query builder
  - Connection pooling

#### Database
- **PostgreSQL 16+**
  - Relational database
  - ACID compliance
  - Complex queries for analytics
  - JSON support (JSONB)

#### Real-Time Communication
- **Socket.io 4.x**
  - WebSocket server
  - Room-based messaging
  - Automatic reconnection
  - Fallback to long-polling

#### Authentication
- **jsonwebtoken (JWT)**
  - Stateless authentication
  - Access & refresh tokens

- **bcryptjs**
  - Password hashing
  - Salt generation

#### Middleware & Utilities
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **express-validator** - Request validation
- **helmet** (optional) - Security headers
- **morgan** (optional) - HTTP request logger

---

### Shared Code

#### Types
- **TypeScript Definitions**
  - Shared interfaces between frontend/backend
  - API request/response types
  - Domain models

---

### Database & Storage

#### Primary Database
**PostgreSQL** (choose one provider):

1. **Supabase** (Recommended)
   - 500MB database (free)
   - 1GB file storage (free)
   - 2GB bandwidth (free)
   - Built-in authentication
   - REST API auto-generated
   - Real-time subscriptions

2. **Railway**
   - $5 free credit/month
   - ~500MB database
   - Easy deployment

3. **Neon**
   - 10GB storage (free)
   - Serverless PostgreSQL
   - Auto-scaling

#### Caching (Future)
- **Redis** (Upstash free tier)
  - Session caching
  - Real-time leaderboards
  - Rate limiting

#### File Storage
**Image Storage** (choose one):

1. **Cloudinary** (Recommended)
   - 25GB storage (free)
   - 25GB bandwidth (free)
   - Image transformations
   - CDN included

2. **Supabase Storage**
   - 1GB storage (free)
   - Integrated with Supabase DB
   - CDN included

3. **AWS S3 + CloudFront**
   - 5GB storage (12 months free)
   - 20,000 GET requests (free tier)

---

### Deployment & Hosting

#### Backend Hosting
**Railway** (Recommended)
- $5 free credit/month
- GitHub integration
- Automatic deployments
- Environment variables
- Logs and metrics

**Alternatives:**
- **Render** - 750 hours/month free
- **Fly.io** - 3 shared VMs free
- **Heroku** - Limited free tier

#### Mobile Deployment
**Expo Application Services (EAS)**
- Build service for iOS/Android
- Free tier: 30 builds/month (priority)
- Over-the-air updates
- App Store/Play Store submission

---

### Development Tools

#### Code Quality
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit checks

#### Testing
- **Jest** - Unit testing
- **React Native Testing Library** - Component testing
- **Supertest** - API testing
- **Detox** (optional) - E2E testing

#### API Development
- **Postman** or **Insomnia** - API testing
- **Prisma Studio** - Database GUI

#### Debugging
- **React Native Debugger**
- **Flipper** - Mobile debugging
- **VS Code Debugger** - Backend debugging

---

### Monitoring & Analytics (Optional)

#### Error Tracking
- **Sentry** (Free tier)
  - Error monitoring
  - Performance tracking
  - Crash reports

#### Analytics
- **PostHog** (Free tier)
  - Product analytics
  - Feature flags
  - Session replay

#### Logs
- Railway/Render built-in logging
- **LogRocket** (optional)

---

### Additional Services

#### Push Notifications
- **Expo Push Notifications** (Free)
  - Built into Expo
  - No setup required
  - 600,000 notifications/month free

#### Maps (for location features)
- **Google Maps API** (Free tier: $200 credit/month)
- **Mapbox** (50,000 loads/month free)

---

## Complete Package Dependencies

### Mobile (`mobile/package.json`)
```json
{
  "dependencies": {
    "react": "18.3.1",
    "react-native": "0.74.0",
    "expo": "~54.0.0",
    "expo-camera": "~15.0.0",
    "expo-image-picker": "~15.0.0",
    "expo-location": "~17.0.0",
    "expo-image": "~1.15.0",
    "expo-secure-store": "~13.0.0",
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/bottom-tabs": "^7.0.0",
    "@react-navigation/stack": "^7.0.0",
    "react-native-screens": "~4.0.0",
    "react-native-safe-area-context": "4.14.0",
    "axios": "^1.7.0",
    "socket.io-client": "^4.8.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.3.0",
    "typescript": "~5.9.0"
  }
}
```

### Backend (`backend/package.json`)
```json
{
  "dependencies": {
    "express": "^5.1.0",
    "@prisma/client": "^6.17.0",
    "socket.io": "^4.8.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "typescript": "^5.9.0",
    "@types/node": "^24.7.0",
    "@types/express": "^5.0.0",
    "@types/cors": "^2.8.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/jsonwebtoken": "^9.0.0",
    "prisma": "^6.17.0",
    "ts-node": "^10.9.0",
    "nodemon": "^3.1.0"
  }
}
```

---

## Free Tier Summary

All services below can support the app at zero cost until you have users:

| Service | Free Tier | Purpose |
|---------|-----------|---------|
| **Supabase** | 500MB DB, 1GB storage | Database + File Storage |
| **Railway** | $5 credit/month | Backend Hosting |
| **Cloudinary** | 25GB storage/bandwidth | Image Storage + CDN |
| **Expo** | 30 builds/month | Mobile App Building |
| **Sentry** | 5K errors/month | Error Tracking |
| **PostHog** | 1M events/month | Analytics |
| **Expo Push** | 600K notifications/month | Push Notifications |

**Total Monthly Cost: $0** 🎉

---

## Scalability Path

As the app grows:

1. **100-1,000 users** - Current free tier stack
2. **1,000-10,000 users** - Add Redis, upgrade Railway
3. **10,000+ users** - Horizontal scaling, load balancer
4. **100,000+ users** - Microservices, dedicated infrastructure

---

## Industry Standards

All chosen technologies are:
- ✅ Industry-standard
- ✅ Production-proven
- ✅ Well-documented
- ✅ Large community
- ✅ Free to start
- ✅ TypeScript-first
- ✅ Performance-optimized

This stack is used by companies like:
- **React Native**: Facebook, Instagram, Airbnb, Tesla
- **Express + Node.js**: Netflix, Uber, PayPal
- **PostgreSQL**: Apple, Instagram, Spotify
- **Prisma**: Groww, Loft, Daily.dev
