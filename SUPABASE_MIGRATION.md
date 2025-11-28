# Migration to Supabase + Vercel

This document explains the architectural changes made to migrate from Prisma/PostgreSQL to Supabase with Vercel deployment.

## What Changed

### Before (Prisma + PostgreSQL)
- **Database**: Self-hosted PostgreSQL or Railway/Render
- **ORM**: Prisma with migrations
- **Authentication**: None (single-user only)
- **Backend Deployment**: Railway or Render
- **Frontend Deployment**: Vercel

### After (Supabase + Vercel)
- **Database**: Supabase PostgreSQL
- **ORM**: Supabase Client (direct queries)
- **Authentication**: Supabase Auth (email/password + OAuth)
- **Backend Deployment**: Vercel Serverless Functions
- **Frontend Deployment**: Vercel

## Key Benefits

### 1. **Built-in Authentication**
- Email/password authentication out of the box
- OAuth providers (Google, GitHub, etc.)
- JWT token management
- User management dashboard
- Email verification and password reset

### 2. **Row Level Security (RLS)**
- Database-level security policies
- Users can only access their own data
- No need for manual permission checks in code
- Prevents data leaks

### 3. **Simplified Deployment**
- One platform (Vercel) for both frontend and backend
- Automatic scaling with serverless functions
- No need to manage separate backend infrastructure
- Generous free tiers on both platforms

### 4. **Better Developer Experience**
- Real-time subscriptions (future feature)
- Built-in storage for file uploads
- Dashboard for database management
- Automatic backups (on Pro plan)
- No migration files to manage manually

## Technical Changes

### Frontend Changes

#### New Files Created:
- `src/lib/supabase.ts` - Supabase client configuration
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/components/AuthModal.tsx` - Sign in/sign up UI
- `src/components/UserMenu.tsx` - User menu with sign out

#### Modified Files:
- `src/App.tsx` - Wrapped with AuthProvider
- `.env.example` - Updated with Supabase variables

#### New Dependencies:
- `@supabase/supabase-js` - Supabase JavaScript client

### Backend Changes

#### New Files Created:
- `server/src/utils/supabase.ts` - Server-side Supabase client
- `server/src/middleware/auth.ts` - JWT token verification

#### Modified Files:
- `server/.env.example` - Replaced Prisma with Supabase variables
- All controller files will use Supabase client instead of Prisma

#### Removed Dependencies:
- `@prisma/client` - No longer needed
- `prisma` - No longer needed

#### New Dependencies:
- `@supabase/supabase-js` - Supabase JavaScript client

### Database Changes

#### Migration from Prisma Schema:
The Prisma schema has been converted to SQL migration:
- **Location**: `supabase/migrations/001_initial_schema.sql`
- **Changes**:
  - Added `user_id` to boards table (references auth.users)
  - Added Row Level Security policies
  - Same table structure as Prisma
  - Same indexes and relationships

#### Key Differences:
- UUID primary keys (instead of auto-increment)
- `user_id` column references Supabase auth.users
- RLS policies enforce data isolation
- Triggers for `updated_at` timestamps

### Deployment Changes

#### New Files Created:
- `vercel.json` - Configuration for Vercel serverless functions
- `SUPABASE_SETUP.md` - Step-by-step Supabase setup guide

#### Modified Files:
- `DEPLOYMENT.md` - Updated with Supabase + Vercel instructions

## Environment Variables

### Frontend (.env)
```env
# Before
VITE_API_URL=http://localhost:3001

# After
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001
```

### Backend (server/.env)
```env
# Before
DATABASE_URL="postgresql://user:password@localhost:5432/corkboard?schema=public"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# After
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Migration Steps for Existing Projects

If you have an existing deployment with Prisma, follow these steps:

### 1. Set Up Supabase
Follow `SUPABASE_SETUP.md` to create a project and run migrations.

### 2. Data Migration (if you have existing data)
If you have data in an existing PostgreSQL database:

1. Export data from existing database:
   ```bash
   pg_dump -h old-host -U user -d corkboard --data-only > data.sql
   ```

2. Modify the SQL to add `user_id`:
   - You'll need to manually add user_id values
   - Associate existing data with a Supabase user

3. Import to Supabase:
   - Use Supabase SQL Editor
   - Or use psql with connection string from Supabase

### 3. Update Environment Variables
- Add Supabase variables to `.env` files
- Remove Prisma `DATABASE_URL`

### 4. Install New Dependencies
```bash
# Frontend
npm install @supabase/supabase-js

# Backend
cd server
npm install @supabase/supabase-js
npm uninstall @prisma/client prisma
```

### 5. Test Locally
```bash
# Start both servers
npm run dev
cd server && npm run dev
```

Test authentication and data operations.

### 6. Deploy to Vercel
Follow updated `DEPLOYMENT.md` instructions.

## API Changes

### Authentication Required

All API endpoints now require authentication. Requests must include:

```javascript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

fetch('/api/boards/123', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### User Isolation

Data is automatically filtered by user:
- Users can only access their own boards
- RLS policies enforce this at the database level
- No need for manual user checks in backend code

## Future Enhancements Enabled

With Supabase, these features become much easier:

1. **Real-time Collaboration**
   - Use Supabase Realtime subscriptions
   - Multiple users can edit same board in real-time

2. **File Storage**
   - Use Supabase Storage for attachments
   - Automatic CDN for fast delivery
   - Image transformations

3. **Advanced Auth**
   - Magic links (passwordless)
   - Phone authentication
   - Multi-factor authentication (MFA)

4. **Database Functions**
   - PostgreSQL functions for complex queries
   - Edge Functions for serverless logic

## Rollback Plan

If you need to rollback to Prisma:

1. Keep Prisma files in a branch
2. Restore old `.env` variables
3. Redeploy backend to Railway/Render
4. Remove authentication components from frontend

## Questions?

See:
- `SUPABASE_SETUP.md` for setup instructions
- `DEPLOYMENT.md` for deployment guide
- [Supabase Documentation](https://supabase.com/docs)
