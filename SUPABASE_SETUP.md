# Supabase Setup Guide

This guide will walk you through setting up Supabase for your Cork Board Connections application.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in the details:
   - **Name**: cork-board-connections
   - **Database Password**: Generate a strong password (save it somewhere safe)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
6. Click "Create new project" (this takes ~2 minutes)

## Step 2: Get Your API Keys

Once your project is created:

1. Go to **Settings** → **API**
2. You'll see two important values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ Keep this secret!)

## Step 3: Run Database Migration

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql` from your project
4. Paste it into the SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

This creates:
- All tables (boards, items, connections, etc.)
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for auto-updating timestamps

## Step 4: Configure Environment Variables

### Frontend (.env)

Create a `.env` file in the **project root**:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:3001
```

Replace with your actual values from Step 2.

### Backend (server/.env)

Create a `.env` file in the **server** directory:

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Replace with your actual values from Step 2.

⚠️ **Important**: Use the **service_role** key for the backend, not the anon key!

## Step 5: Enable Authentication Providers (Optional)

To enable Google or GitHub sign-in:

1. Go to **Authentication** → **Providers**
2. Click on the provider you want to enable (Google or GitHub)
3. Enable it and follow the setup instructions:

### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret to Supabase

### GitHub OAuth:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Authorization callback URL:
   - `https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

## Step 6: Verify Setup

### Check Database Tables

1. Go to **Table Editor** in Supabase dashboard
2. You should see all tables: boards, items, connections, tags, etc.

### Test Authentication

1. Go to **Authentication** → **Users**
2. You can manually add a test user or wait until you test the app

## Step 7: Start Development

Now you can start your development servers:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd server
npm run dev
```

Visit `http://localhost:3000` and you should see:
- A "Sign In" button in the top-right corner
- Click it to create an account or sign in

## Row Level Security (RLS)

Your database is protected by Row Level Security policies that ensure:

✅ Users can only see their own boards and items
✅ Users can only modify their own data
✅ All queries automatically filter by user_id
✅ No user can access another user's data

## Database Schema Overview

```
boards
├── id (UUID, primary key)
├── user_id (UUID, references auth.users)
├── title
├── description
└── timestamps

items
├── id (UUID, primary key)
├── board_id (references boards)
├── type (enum: note, image, text, shape)
├── content
├── position_x, position_y
├── width, height
├── color, thumbtack_color
├── z_index, rotation
└── timestamps (includes deleted_at for soft delete)

connections
├── id (UUID, primary key)
├── board_id (references boards)
├── from_item_id (references items)
├── to_item_id (references items)
├── style (JSONB)
└── label

item_metadata (flexible key-value storage)
tags (reusable tags)
item_tags (many-to-many relationship)
attachments (file metadata)
```

## Troubleshooting

### "Missing Supabase environment variables" error

- Make sure you created `.env` files in both root and server directories
- Check that you copied the values correctly (no extra spaces)
- Restart your dev servers after creating `.env` files

### "Invalid API key" error

- Double-check you're using the correct keys:
  - Frontend: `anon public` key
  - Backend: `service_role` key
- Make sure you copied the full key (they're very long!)

### RLS policy errors

- Make sure you ran the migration SQL in Step 3
- Check that authentication is working (user is signed in)
- Verify the user has an account in Supabase dashboard

### Can't sign in

- Check browser console for errors
- Verify CORS_ORIGIN in backend .env matches frontend URL
- Make sure both dev servers are running
- Check Supabase dashboard → Authentication → Users to see if user was created

## Next Steps

Once Supabase is set up:

1. ✅ Test authentication (sign up, sign in, sign out)
2. ✅ Create a board and add some items
3. ✅ Verify data appears in Supabase Table Editor
4. ✅ Deploy to Vercel (see DEPLOYMENT.md)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
