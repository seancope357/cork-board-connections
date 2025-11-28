# Deployment Guide

This guide covers deploying the Cork Board Connections application to production with Supabase and Vercel.

## Architecture Overview

- **Frontend**: React SPA (Vite build) on Vercel
- **Backend**: Node.js + Express API on Vercel Serverless Functions
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (future)

## Recommended Stack: Vercel + Supabase

This is the optimal setup for this application:
- **Vercel**: Frontend and Backend (serverless functions)
- **Supabase**: Database, Authentication, and Storage
- Both have generous free tiers
- Minimal configuration required
- Automatic HTTPS and CDN

---

## Deployment Steps

### Prerequisites
- GitHub account
- Vercel account
- Supabase account
- Your repository pushed to GitHub

### Step 1: Set Up Supabase

Follow the complete guide in `SUPABASE_SETUP.md` to:
1. Create a Supabase project
2. Run the database migration
3. Get your API keys
4. (Optional) Enable OAuth providers

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" → Import from GitHub
3. Select your `cork-board-connections` repository
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add environment variables:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_API_URL=https://your-vercel-app.vercel.app
   ```

6. Click "Deploy" and wait for the build to complete

### Step 3: Configure Backend Environment Variables

After your first deployment:

1. Go to your Vercel project settings
2. Navigate to "Settings" → "Environment Variables"
3. Add backend environment variables:
   ```
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NODE_ENV=production
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. Redeploy to apply the new environment variables

### Step 4: Update Supabase Redirect URLs

1. Go to your Supabase project
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel domain to **Site URL**:
   ```
   https://your-vercel-app.vercel.app
   ```
4. Add redirect URLs (if using OAuth):
   ```
   https://your-vercel-app.vercel.app
   https://your-vercel-app.vercel.app/**
   ```

### Step 5: Test Your Deployment

1. Visit your Vercel URL: `https://your-vercel-app.vercel.app`
2. Click "Sign In" and create an account
3. Verify email if required
4. Create a board and add some items
5. Check Supabase dashboard to confirm data is being saved

---

## Environment Variables Reference

### Frontend (Vercel)
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=https://your-vercel-app.vercel.app
```

### Backend (Vercel)
```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
CORS_ORIGIN=https://your-vercel-app.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Post-Deployment Checklist

- [ ] Supabase project created and migration ran successfully
- [ ] All environment variables configured in Vercel
- [ ] Frontend loads without errors
- [ ] Authentication works (sign up, sign in, sign out)
- [ ] Can create boards and items
- [ ] Data persists in Supabase
- [ ] CORS configured correctly
- [ ] Rate limiting is working
- [ ] SSL/HTTPS is enabled (automatic with Vercel)
- [ ] OAuth providers enabled (optional)
- [ ] Row Level Security policies are active

---

## Monitoring & Maintenance

### Vercel Monitoring

**Deployment Logs**:
1. Go to your Vercel project
2. Click on "Deployments"
3. Select a deployment to view logs

**Function Logs** (for backend API):
1. Go to "Functions" tab
2. View real-time logs for API calls

**Analytics** (optional):
- Enable Vercel Analytics for performance metrics
- Track Core Web Vitals automatically

### Supabase Monitoring

**Database Usage**:
1. Go to Supabase dashboard
2. Navigate to "Database" → "Usage"
3. Monitor:
   - Database size
   - Active connections
   - Query performance

**Auth Monitoring**:
1. Go to "Authentication" → "Users"
2. Monitor user signups and activity
3. View authentication logs

**API Usage**:
1. Go to "Settings" → "Usage"
2. Monitor API requests
3. Check for rate limiting

### Backups

**Supabase**:
- Automatic daily backups on Pro plan
- Point-in-time recovery available
- Manual backups via dashboard

### Performance Monitoring (Optional)

Consider adding:
- **Sentry**: Error tracking for both frontend and backend
- **PostHog**: User analytics and session replay
- **Vercel Analytics**: Performance and visitor metrics

---

## Troubleshooting

### Authentication Issues

**Can't sign in:**
- Check browser console for errors
- Verify Supabase URL and anon key are correct
- Check that Supabase project is active
- Verify email confirmation if required

**OAuth not working:**
- Check redirect URLs in Supabase settings
- Verify OAuth provider credentials
- Check that provider is enabled in Supabase dashboard

### CORS Errors

- Verify `CORS_ORIGIN` in Vercel environment variables matches your frontend URL exactly
- No trailing slash in URLs
- Redeploy after changing environment variables

### Database Errors

**RLS policy errors:**
- Verify migration ran successfully in Supabase
- Check user is authenticated
- Verify policies exist in Supabase dashboard

**Can't read/write data:**
- Check Supabase service role key is correct in backend env vars
- Verify user has permissions (check RLS policies)
- Check Supabase dashboard for error logs

### Build Failures

**Vercel build fails:**
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Check Node.js version (should be 20+)
- Ensure environment variables are set

**TypeScript errors:**
- Run `npm run type-check` locally
- Fix any type errors before pushing

### Performance Issues

**Slow API responses:**
- Check Supabase query performance in dashboard
- Add indexes if needed
- Consider caching frequently accessed data

**Rate limiting:**
- Adjust `RATE_LIMIT_MAX_REQUESTS` in Vercel environment variables
- Monitor API usage in Supabase dashboard

---

## Scaling Considerations

When your app grows:

1. **Supabase Database**:
   - Upgrade to Pro plan for better performance
   - Enable connection pooling (PgBouncer)
   - Add custom indexes for frequently queried fields
   - Consider read replicas for high-traffic apps

2. **Vercel**:
   - Automatically scales with traffic
   - Upgrade to Pro for higher limits
   - Enable Edge Functions for faster response times
   - Use Vercel Analytics for performance insights

3. **File Storage**:
   - Enable Supabase Storage for file uploads
   - Use CDN for images (Supabase has built-in CDN)
   - Implement image optimization

4. **Performance Optimizations**:
   - Implement pagination for large datasets
   - Add database indexes (already included in migration)
   - Use Supabase Realtime for live updates
   - Cache frequently accessed data

5. **Monitoring**:
   - Set up Sentry for error tracking
   - Enable Vercel Analytics
   - Monitor Supabase usage dashboard
   - Set up alerts for quota limits

---

## Free Tier Limits

### Vercel Free Tier:
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Serverless function execution
- ✅ Automatic HTTPS
- ✅ Preview deployments

### Supabase Free Tier:
- ✅ 500 MB database storage
- ✅ 1 GB file storage
- ✅ 50,000 monthly active users
- ✅ 2 GB bandwidth/month
- ✅ Unlimited API requests
- ✅ 7-day log retention

Both tiers are generous enough for most personal projects and small applications.

---

## Support

For deployment issues:
- Check `SUPABASE_SETUP.md` for Supabase-specific help
- Review Vercel deployment logs
- Check Supabase dashboard for database issues
- Verify environment variables in Vercel settings
- Test authentication flow in incognito mode
- Check browser console for frontend errors

**Additional Resources:**
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Project repository issues
