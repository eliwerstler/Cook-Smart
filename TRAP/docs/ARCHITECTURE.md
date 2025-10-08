# TRAP Architecture Documentation

## System Overview

TRAP is a full-stack mobile application with a React Native frontend and Node.js backend, connected via REST API and WebSockets for real-time features.

## Technology Stack Rationale

### Frontend - React Native with Expo
**Why React Native?**
- Single codebase for iOS and Android
- Large community and ecosystem
- Native performance for camera/photo features
- Easy integration with social features

**Why Expo?**
- Simplified development workflow
- Built-in camera and image handling
- Over-the-air updates
- Easy deployment to app stores
- Free hosting for development

### Backend - Node.js with Express
**Why Node.js?**
- JavaScript/TypeScript consistency across stack
- Excellent for real-time features (Socket.io)
- Large ecosystem for social features
- Non-blocking I/O for handling multiple concurrent users

**Why Express?**
- Lightweight and flexible
- Industry standard
- Great middleware ecosystem
- Easy to extend

### Database - PostgreSQL with Prisma
**Why PostgreSQL?**
- Robust relational data model (users, sessions, friendships)
- ACID compliance for data integrity
- Excellent for complex queries (analytics, leaderboards)
- Free tier available (Supabase, Railway, Neon)

**Why Prisma?**
- Type-safe database access
- Automatic migrations
- Great developer experience
- Built-in connection pooling

### Real-Time - Socket.io
**Why Socket.io?**
- Easy WebSocket implementation
- Automatic fallback to long-polling
- Room-based messaging for groups
- Built-in reconnection logic

### File Storage
**Options (all have free tiers):**
1. **Supabase Storage** - 1GB free
2. **Cloudinary** - 25GB free
3. **AWS S3** with CloudFront - Free tier for 12 months

## Application Architecture

### Frontend Architecture

```
┌─────────────────────────────────────┐
│         React Native App            │
├─────────────────────────────────────┤
│  Navigation Layer                   │
│  ├── Tab Navigator                  │
│  │   ├── Home                       │
│  │   ├── Groups                     │
│  │   ├── Drink Button               │
│  │   ├── Discover                   │
│  │   └── Profile                    │
│  └── Stack Navigator (modals)       │
├─────────────────────────────────────┤
│  State Management                   │
│  ├── Auth Context (user session)    │
│  ├── Session Context (active drink) │
│  └── Socket Context (real-time)     │
├─────────────────────────────────────┤
│  Services Layer                     │
│  ├── API Service (REST)             │
│  ├── Socket Service (WebSocket)     │
│  ├── Camera Service                 │
│  ├── Location Service               │
│  └── Storage Service (cache)        │
├─────────────────────────────────────┤
│  Utils                              │
│  ├── BPH Calculator                 │
│  ├── Time Utils                     │
│  └── Image Utils                    │
└─────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────┐
│      Express.js Server              │
├─────────────────────────────────────┤
│  HTTP Layer                         │
│  ├── CORS Middleware                │
│  ├── Auth Middleware (JWT)          │
│  ├── Rate Limiting                  │
│  └── Error Handling                 │
├─────────────────────────────────────┤
│  Routes                             │
│  ├── /api/auth                      │
│  ├── /api/users                     │
│  ├── /api/drinks                    │
│  ├── /api/sessions                  │
│  ├── /api/groups                    │
│  ├── /api/friends                   │
│  └── /api/feed                      │
├─────────────────────────────────────┤
│  Controllers                        │
│  (Handle requests, validation)      │
├─────────────────────────────────────┤
│  Services                           │
│  (Business logic)                   │
│  ├── UserService                    │
│  ├── DrinkService                   │
│  ├── SessionService                 │
│  ├── BphService                     │
│  └── SocialService                  │
├─────────────────────────────────────┤
│  Data Layer                         │
│  ├── Prisma ORM                     │
│  └── PostgreSQL                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      WebSocket Server               │
├─────────────────────────────────────┤
│  Socket.io Rooms                    │
│  ├── User rooms (personal updates)  │
│  ├── Group rooms (group activity)   │
│  └── Global room (discover feed)    │
└─────────────────────────────────────┘
```

## Data Flow

### Posting a Drink

```
1. User taps "Drink" button
2. Camera opens (expo-camera)
3. User takes photo
4. User selects drink type
5. Mobile app:
   - Uploads image to storage
   - Calls POST /api/drinks with metadata
6. Backend:
   - Validates request
   - Creates/updates session
   - Calculates BPH
   - Saves to database
   - Emits WebSocket event
7. Real-time updates:
   - User's friends receive feed update
   - Group members see updated leaderboard
   - Global discover feed updates
```

### BPH Calculation Flow

```
1. User creates drink
2. Backend SessionService:
   - Gets session start time
   - Calculates duration (now - start)
   - Sums alcohol content of all drinks
   - BPH = total_standards / (duration_minutes / 60)
3. Updates user statistics:
   - Check if new peak BPH
   - Update average BPH
   - Increment total drinks
4. Broadcast to relevant rooms
```

## Database Design

### Entity Relationships

```
User ──┬─< Session ──< Drink >── Like
       │                        └── Comment
       ├─< GroupMember >── Group
       ├─< Friendship
       └─< (self-referential friends)
```

### Key Indexes
- `User.username` - Fast lookups
- `User.email` - Auth queries
- `Drink.timestamp` - Feed ordering
- `Session.userId + startTime` - User sessions
- `GroupMember.groupId` - Group queries

## Security Considerations

### Authentication
- JWT tokens for API authentication
- Tokens stored in secure storage (expo-secure-store)
- Refresh token mechanism
- Password hashing with bcrypt

### Authorization
- User can only modify their own data
- Group admins have elevated permissions
- Private sessions/groups

### Data Protection
- Environment variables for secrets
- SQL injection prevention (Prisma)
- Rate limiting on API endpoints
- Image upload validation

## Performance Optimizations

### Frontend
- Image caching with expo-image
- Lazy loading for feed
- Pagination for lists
- Optimistic UI updates

### Backend
- Database connection pooling (Prisma)
- Redis caching for:
  - Active sessions
  - Live BPH calculations
  - Leaderboards
- Index optimization
- Query optimization with Prisma

### Real-Time
- Socket.io rooms for targeted updates
- Debounced BPH recalculations
- Event batching for high-frequency updates

## Scalability Considerations

### Current Architecture (MVP)
- Single server deployment
- Direct database connection
- ~1000 concurrent users

### Future Scaling Path
1. **Horizontal Scaling**
   - Load balancer
   - Multiple app servers
   - Redis for session storage

2. **Database Scaling**
   - Read replicas
   - Connection pooling
   - Caching layer

3. **File Storage**
   - CDN for images
   - Image optimization pipeline

4. **WebSocket Scaling**
   - Socket.io Redis adapter
   - Sticky sessions

## Deployment Strategy

### Development
- Local PostgreSQL or Supabase
- Expo Go app for testing
- Local backend server

### Staging
- Railway/Render for backend
- Supabase for database
- Cloudinary for images
- Expo development build

### Production
- Railway/Render with autoscaling
- Managed PostgreSQL (Supabase/Neon)
- CDN for static assets
- Production Expo build (App Store/Play Store)

## Monitoring & Analytics

### Application Monitoring
- Error tracking: Sentry
- Analytics: PostHog or Mixpanel
- Logs: Railway/Render built-in

### Performance Monitoring
- API response times
- Database query performance
- WebSocket connection health
- Image upload speeds

## Free Tier Service Limits

### Supabase (Database + Storage)
- 500MB database
- 1GB storage
- 2GB bandwidth
- Unlimited API requests

### Railway (Backend Hosting)
- $5 free credit/month
- ~500 hours runtime

### Cloudinary (Images)
- 25GB storage
- 25GB bandwidth
- Image transformations

## Future Enhancements

1. **Redis Integration**
   - Session caching
   - Real-time leaderboards
   - Rate limiting

2. **Push Notifications**
   - Expo Push Notifications (free)
   - Friend activity alerts

3. **Advanced Analytics**
   - Drinking patterns
   - Social insights
   - Achievement system

4. **Offline Support**
   - AsyncStorage for caching
   - Queue for offline posts
   - Sync on reconnection
