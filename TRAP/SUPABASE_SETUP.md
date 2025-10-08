# Supabase Setup Instructions

## Step-by-Step Setup

### 1. Get Your Supabase Connection String

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon in sidebar)
3. Go to **Database**
4. Scroll to **Connection String** section
5. Select **Transaction Pooler** (recommended for Prisma)
6. Copy the connection string (it will look like this):
   ```
   postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### 2. Configure Your Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create `.env` file (copy from example):
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and replace the `DATABASE_URL`:
   ```bash
   DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

5. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

   This will create all the tables (User, Session, Drink, Group, etc.)

### 3. Verify Setup

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Open Prisma Studio to view your database:
   ```bash
   npm run prisma:studio
   ```
   Opens at http://localhost:5555

3. Check the API health:
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok","message":"TRAP API is running"}`

### 4. Optional: Set Up Supabase Storage for Images

1. In Supabase dashboard, go to **Storage**
2. Create a new bucket called `drink-photos`
3. Set it to **Public** (or configure RLS policies)
4. Add to your `backend/.env`:
   ```
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_KEY=your-anon-key
   ```

### Connection Types Explained

| Type | Port | Use Case | Prisma Compatible |
|------|------|----------|-------------------|
| **Transaction Pooler** | 6543 | Serverless, short connections | ✅ Recommended |
| Session Pooler | 5432 | Long-lived connections | ✅ Works |
| Direct Connection | 5432 | Local development | ✅ Works |

### Why Transaction Pooler?

- Prisma opens and closes connections frequently
- Better for serverless environments (Railway, Render)
- Handles concurrent requests efficiently
- Uses PgBouncer for connection pooling

### Troubleshooting

**Error: "Can't reach database server"**
- Check that you copied the full connection string including password
- Verify your Supabase project is active
- Check firewall/network settings

**Error: "SSL connection required"**
- Supabase requires SSL by default
- Make sure your connection string includes `?pgbouncer=true` at the end

**Error: "Prepared statements not supported"**
- You're using Transaction Pooler - this is expected
- Prisma handles this automatically with `pgbouncer=true`

### Next Steps

Once your database is set up:

1. Start backend: `cd backend && npm run dev`
2. Start mobile: `cd mobile && npm start`
3. Begin building authentication (see `docs/GETTING_STARTED.md`)

### Free Tier Limits (Supabase)

- **Database**: 500MB
- **Storage**: 1GB
- **Bandwidth**: 2GB/month
- **API Requests**: Unlimited

This is more than enough to build and test your app!
