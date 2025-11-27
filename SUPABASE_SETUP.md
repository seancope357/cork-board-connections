# Supabase Setup Guide

This guide will help you set up Supabase for persistent storage in your Cork Board for Connections application.

## Prerequisites

✅ **Already completed:**
- Supabase client installed (`@supabase/supabase-js`)
- Environment variables configured in `.env`
- Database types defined in `src/types/database.ts`
- Supabase client configured in `src/lib/supabase.ts`
- Database schema ready in `supabase-schema.sql`

## Step-by-Step Setup

### 1. Access Your Supabase Project

Go to: https://supabase.com/dashboard/project/dcilnecmypmtpjdlojza

### 2. Create Database Tables

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the contents of `supabase-schema.sql` from the project root
4. Paste it into the SQL editor
5. Click **Run** to execute the SQL

This will create:
- `boards` table - stores cork board metadata
- `items` table - stores notes and images
- `connections` table - stores red string connections
- Indexes for performance
- Row Level Security (RLS) policies for public access

### 3. Verify Tables Created

1. Click on **Table Editor** in the left sidebar
2. You should see three tables: `boards`, `items`, `connections`
3. You should also see a default board "My Conspiracy Board"

### 4. Test the Connection

The dev server should automatically reconnect with the new environment variables. If not, restart it:

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

### 5. Using Supabase in Your App

You have two options:

#### Option A: Use the Supabase Hook (Recommended)

The `useSupabaseBoard` hook provides real-time persistence:

```typescript
import { useSupabaseBoard } from '@/hooks/useSupabaseBoard';

function CorkBoard() {
  const {
    items,
    connections,
    isLoading,
    error,
    boardId,
    saveItem,
    updateItem,
    deleteItem,
    saveConnection,
    deleteConnection,
    createBoard,
  } = useSupabaseBoard();

  // Use these instead of local state
}
```

#### Option B: Hybrid Approach

Keep the existing local state but add auto-save:

```typescript
import { useSupabaseBoard } from '@/hooks/useSupabaseBoard';
import { useBoard, useConnections } from '@/hooks';

function CorkBoard() {
  // Local state (fast, immediate updates)
  const localBoard = useBoard();

  // Supabase sync (persistent storage)
  const supabase = useSupabaseBoard();

  // Sync changes to Supabase
  useEffect(() => {
    // Debounce and save changes
  }, [localBoard.items]);
}
```

## Database Schema Overview

### Boards Table
- `id` - Unique board identifier (UUID)
- `title` - Board name
- `description` - Optional description
- `created_at`, `updated_at` - Timestamps

### Items Table
- `id` - Unique item identifier (UUID)
- `board_id` - Reference to board
- `type` - 'note' or 'image'
- `content` - Note text or image URL
- `x`, `y` - Position coordinates
- `width`, `height` - Item dimensions
- `color` - Note color
- `thumbtack_color` - Pin color
- `metadata` - JSONB field for tags, dates, etc.
- `files` - JSONB array of attachments
- `z_index`, `rotation` - Display properties

### Connections Table
- `id` - Unique connection identifier (UUID)
- `board_id` - Reference to board
- `from_item_id` - Source item
- `to_item_id` - Target item
- `style` - JSONB field for line styling
- `label` - Optional connection label

## Security Notes

**Current Setup:**
- Public access enabled (anyone can read/write)
- Good for development and demos

**For Production:**
You should add authentication:

1. Enable Supabase Auth
2. Update RLS policies to check `auth.uid()`
3. Add user ownership to boards

Example secure policy:
```sql
CREATE POLICY "Users can only access their own boards"
    ON boards FOR SELECT
    USING (auth.uid() = user_id);
```

## Real-time Subscriptions (Optional)

Enable real-time updates so multiple users see changes instantly:

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('board-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'items',
      filter: `board_id=eq.${boardId}`
    }, (payload) => {
      // Update local state with changes
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, [boardId]);
```

## Troubleshooting

**"Missing Supabase environment variables"**
- Make sure `.env` file exists in project root
- Restart the dev server after creating `.env`

**"Cannot find module '@/lib/supabase'"**
- Run `npm install @supabase/supabase-js`
- Restart TypeScript server in your editor

**"relation 'boards' does not exist"**
- Run the SQL schema in Supabase SQL Editor
- Make sure you're connected to the correct project

**RLS Policy Errors**
- The schema includes permissive policies for development
- Check Supabase logs for specific policy violations

## Next Steps

1. ✅ Run the SQL schema
2. ✅ Verify tables in Supabase dashboard
3. ✅ Restart dev server
4. Choose integration approach (hook or hybrid)
5. Test by creating notes and refreshing the page

Your cork board data will now persist across sessions! 🎉
