# Development Guide

## Development Workflow

### Daily Development

1. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on `http://localhost:3000`

2. **Start Mobile App**
   ```bash
   cd mobile
   npm start
   ```
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code for physical device

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules (to be configured)
- Use Prettier for formatting
- Commit messages: conventional commits format

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add drink posting feature"

# Push and create PR
git push origin feature/your-feature-name
```

## Setting Up Development Environment

### Database Setup (Local PostgreSQL)

```bash
# Install PostgreSQL (macOS)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb trap_db

# Update .env in backend/
DATABASE_URL="postgresql://localhost:5432/trap_db?schema=public"

# Run migrations
cd backend
npm run prisma:migrate
```

### Database Setup (Supabase - Recommended for Free Tier)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Update `backend/.env`:
   ```
   DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
   ```
5. Run migrations:
   ```bash
   cd backend
   npm run prisma:migrate
   ```

### Image Storage Setup

#### Option 1: Cloudinary (Recommended)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get credentials from Dashboard
3. Add to `backend/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

#### Option 2: Supabase Storage
1. Already included if using Supabase for DB
2. Create bucket in Supabase dashboard
3. Add to `backend/.env`:
   ```
   SUPABASE_URL=your_project_url
   SUPABASE_KEY=your_anon_key
   ```

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Mobile Testing
```bash
cd mobile
npm test
```

### E2E Testing
```bash
# Install Detox (iOS)
npm install -g detox-cli
cd mobile
detox test --configuration ios.sim.debug
```

## Debugging

### Backend Debugging
- Use VS Code debugger
- Add breakpoints in TypeScript files
- Launch configuration in `.vscode/launch.json`

### Mobile Debugging
- React Native Debugger
- Flipper for advanced debugging
- Chrome DevTools for web version

### Database Debugging
```bash
# Open Prisma Studio
cd backend
npm run prisma:studio
```
Opens GUI at `http://localhost:5555`

## Common Development Tasks

### Adding a New API Endpoint

1. **Create route**
   ```typescript
   // backend/src/routes/drinks.ts
   router.post('/', authMiddleware, drinkController.create);
   ```

2. **Create controller**
   ```typescript
   // backend/src/controllers/drinkController.ts
   export const create = async (req, res) => {
     // Handle request
   };
   ```

3. **Add business logic to service**
   ```typescript
   // backend/src/services/drinkService.ts
   export const createDrink = async (data) => {
     // Business logic
   };
   ```

### Adding a New Screen

1. **Create screen component**
   ```typescript
   // mobile/src/screens/NewScreen.tsx
   export default function NewScreen() {
     return <View>...</View>;
   }
   ```

2. **Add to navigation**
   ```typescript
   // mobile/src/navigation/AppNavigator.tsx
   <Stack.Screen name="NewScreen" component={NewScreen} />
   ```

### Adding a Database Model

1. **Update Prisma schema**
   ```prisma
   // backend/prisma/schema.prisma
   model NewModel {
     id String @id @default(cuid())
     // fields...
   }
   ```

2. **Create migration**
   ```bash
   npm run prisma:migrate
   ```

3. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

### Adding Shared Types

1. **Add to shared types**
   ```typescript
   // shared/types/index.ts
   export interface NewType {
     // fields...
   }
   ```

2. **Import in backend**
   ```typescript
   import { NewType } from '../../shared/types';
   ```

3. **Import in mobile**
   ```typescript
   import { NewType } from '../../shared/types';
   ```

## Environment Variables

### Backend `.env`
```bash
# Required
PORT=3000
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"

# Optional
REDIS_URL="redis://localhost:6379"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### Mobile Environment
Create `mobile/.env`:
```bash
API_URL=http://localhost:3000
SOCKET_URL=http://localhost:3000
```

## Performance Profiling

### Backend Performance
```bash
# Use Node.js profiler
node --prof src/index.ts

# Use clinic.js
npm install -g clinic
clinic doctor -- node src/index.ts
```

### Mobile Performance
- Use React DevTools Profiler
- Flipper Performance Monitor
- Xcode Instruments (iOS)
- Android Studio Profiler (Android)

## Building for Production

### Backend Build
```bash
cd backend
npm run build
```
Creates `dist/` folder with compiled JavaScript

### Mobile Build

#### Development Build
```bash
cd mobile
eas build --profile development --platform ios
eas build --profile development --platform android
```

#### Production Build
```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

## Troubleshooting

### Common Issues

1. **Expo "Unable to resolve module"**
   ```bash
   # Clear cache
   expo start -c
   ```

2. **Database connection failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Run `npm run prisma:generate`

3. **TypeScript errors**
   ```bash
   # Regenerate types
   cd backend && npm run prisma:generate
   ```

4. **Port already in use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

5. **iOS build fails**
   ```bash
   # Clear pods
   cd mobile/ios
   pod deintegrate
   pod install
   ```

## Useful Commands

```bash
# View all running processes
ps aux | grep node

# Check database
psql trap_db

# View logs
tail -f backend/logs/app.log

# Clear npm cache
npm cache clean --force

# Reset database
cd backend
npm run prisma:migrate reset

# Generate Prisma ERD
npx prisma generate
npx prisma-erd-generator
```

## Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Socket.io Docs](https://socket.io/docs/v4/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
