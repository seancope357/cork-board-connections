# Deployment Architecture Note

## Current Setup (Phase 1 - Frontend Only)

### What's Deployed
- **Frontend Only**: React + Vite app on Vercel
- **Database**: Supabase PostgreSQL (with Row Level Security)
- **Authentication**: Supabase Auth (built into frontend)

### How It Works
The frontend communicates **directly with Supabase**:
- Authentication via `@supabase/supabase-js` client
- Database operations through Supabase client (RLS protects data)
- No separate backend API needed for basic functionality

### Backend API Status
The Express backend in `/server` is **prepared but not yet integrated**. It's ready for when you need:
- Complex business logic
- Server-side processing
- Third-party API integrations
- Advanced data transformations

---

## Deployment Steps (Current Architecture)

### Step 1: Set Up Supabase
Follow `SUPABASE_SETUP.md` to:
1. Create Supabase project
2. Run database migration
3. Get API keys

### Step 2: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Vite configuration
4. Add environment variables:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Deploy!

### Step 3: Update Supabase Settings
1. Go to Supabase dashboard
2. Navigate to Authentication → URL Configuration
3. Add your Vercel URL as site URL
4. Add redirect URLs for OAuth

---

## Future: Adding Backend API (Phase 2)

When you're ready to integrate the backend API, you have two options:

### Option A: Vercel Serverless Functions (Recommended)
Convert Express routes to Vercel API routes:
1. Move routes from `/server/src/routes/*` to `/api/*`
2. Convert Express handlers to Vercel serverless functions
3. Update frontend to call `/api/*` endpoints

### Option B: Separate Backend Deployment
Deploy backend to another platform:
1. **Railway**: Easy Node.js deployment
2. **Render**: Free tier available
3. **Fly.io**: Serverless containers
4. Update `VITE_API_URL` to point to backend URL

---

## Why This Architecture?

### Benefits of Frontend-Only + Supabase
- ✅ **Simpler deployment**: One platform, one build
- ✅ **Lower latency**: Direct database access (no backend hop)
- ✅ **Better security**: Row Level Security at database level
- ✅ **Cost effective**: No backend server costs
- ✅ **Auto-scaling**: Supabase handles all scaling

### When You Need the Backend
- Complex calculations or data processing
- Third-party API integrations (hiding API keys)
- Custom business logic not suitable for database functions
- Scheduled tasks or background jobs

---

## Current File Structure

```
cork-board-connections/
├── src/                    # Frontend (deployed to Vercel)
│   ├── lib/supabase.ts    # Direct Supabase connection
│   ├── components/         # React components
│   └── contexts/          # Auth context
│
├── server/                 # Backend (not deployed yet)
│   └── src/               # Express API (prepared for future)
│
└── vercel.json            # Vercel config (frontend only)
```

---

## Troubleshooting

### "Backend API not responding"
- The backend is not deployed yet
- Frontend uses Supabase directly
- No backend API calls are made

### "CORS errors"
- Not applicable in current architecture
- Frontend talks directly to Supabase

### "Database access denied"
- Check Supabase environment variables
- Verify RLS policies in Supabase dashboard
- Ensure user is authenticated

---

For full deployment guide, see `DEPLOYMENT.md`.
