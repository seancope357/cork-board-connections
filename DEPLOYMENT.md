# Deployment Guide

This guide covers deploying the Cork Board Connections application (frontend + backend) to production.

## Architecture Overview

- **Frontend**: React SPA (Vite build)
- **Backend**: Node.js + Express API
- **Database**: PostgreSQL
- **File Storage**: S3-compatible storage (future)

## Recommended Platforms

### Option 1: Vercel (Frontend) + Railway (Backend + Database)

**Frontend on Vercel:**
- Automatic deployments from Git
- Global CDN
- Zero configuration

**Backend + Database on Railway:**
- Managed PostgreSQL
- Easy environment variables
- Automatic deployments

### Option 2: Single Platform (Render)

Deploy both frontend and backend on Render.com with managed PostgreSQL.

---

## Option 1: Vercel + Railway (Recommended)

### Prerequisites
- GitHub account
- Vercel account
- Railway account

### Step 1: Deploy Database on Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Provision PostgreSQL"
3. Copy the `DATABASE_URL` from the "Variables" tab
4. Keep this tab open, you'll need it later

### Step 2: Deploy Backend on Railway

1. In Railway, click "New" → "GitHub Repo"
2. Select your cork-board-connections repository
3. Railway will detect it's a monorepo
4. Set the root directory: `server`
5. Add environment variables:
   ```
   DATABASE_URL=<from step 1>
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=<your-vercel-domain>
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```
6. Set build command: `npm install && npm run db:generate && npm run build`
7. Set start command: `npm start`
8. Deploy and copy the generated URL (e.g., `https://your-app.up.railway.app`)

### Step 3: Run Database Migrations

In Railway's backend service:
1. Go to "Settings" → "Build & Deploy"
2. Add a deploy script: `npm run db:migrate`
3. Or use Railway CLI:
   ```bash
   npm install -g @railway/cli
   railway login
   railway run npm run db:migrate
   ```

### Step 4: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" → Import from GitHub
3. Select your cork-board-connections repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add environment variable:
   ```
   VITE_API_URL=<your-railway-backend-url>
   ```
6. Deploy

### Step 5: Update CORS on Backend

Go back to Railway backend environment variables and update:
```
CORS_ORIGIN=<your-vercel-domain>
```

Redeploy the backend service.

---

## Option 2: Render.com (All-in-One)

### Step 1: Create PostgreSQL Database

1. Go to [render.com](https://render.com)
2. New → PostgreSQL
3. Name: `corkboard-db`
4. Copy the "Internal Database URL"

### Step 2: Deploy Backend

1. New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `corkboard-api`
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run db:generate && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables:
   ```
   DATABASE_URL=<internal-database-url>
   NODE_ENV=production
   PORT=3001
   ```
5. After first deploy, run migrations:
   - Open Shell and run: `npm run db:migrate`

### Step 3: Deploy Frontend

1. New → Static Site
2. Connect your GitHub repository
3. Configure:
   - **Name**: `corkboard-app`
   - **Root Directory**: `.`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. Add environment variable:
   ```
   VITE_API_URL=<your-backend-url>
   ```
5. Deploy

### Step 4: Update CORS

Update backend environment variable:
```
CORS_ORIGIN=<your-frontend-url>
```

---

## Environment Variables Reference

### Frontend (.env)
```env
VITE_API_URL=https://your-api-domain.com
```

### Backend (.env)
```env
DATABASE_URL=postgresql://...
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Post-Deployment Checklist

- [ ] Database migrations ran successfully
- [ ] API health check returns 200: `curl https://your-api/api/health`
- [ ] Frontend can connect to backend
- [ ] CORS is configured correctly
- [ ] Rate limiting is working
- [ ] SSL/HTTPS is enabled
- [ ] Error logging is set up (optional: Sentry)
- [ ] Database backups are configured
- [ ] Environment variables are secure

---

## Monitoring & Maintenance

### Health Checks

Frontend:
```bash
curl https://your-app.com
```

Backend:
```bash
curl https://your-api.com/api/health
```

### Database Backups

**Railway**: Automatic backups included in all plans

**Render**: Configure in database settings

### Logs

**Vercel**: Available in dashboard under "Deployments"

**Railway**: Available in service logs

**Render**: Available in service logs

### Performance Monitoring (Optional)

Consider adding:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **PostHog**: Analytics
- **DataDog**: Performance monitoring

---

## Troubleshooting

### CORS Errors
- Verify `CORS_ORIGIN` matches exactly (no trailing slash)
- Check that frontend is using correct API URL
- Ensure backend is deployed and running

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure migrations have run

### Build Failures
- Check Node.js version (should be 20+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### 429 Rate Limit Errors
- Adjust `RATE_LIMIT_MAX_REQUESTS` if needed
- Consider implementing user authentication for higher limits

---

## Scaling Considerations

When your app grows:

1. **Database**:
   - Add connection pooling
   - Consider read replicas
   - Implement caching (Redis)

2. **API**:
   - Horizontal scaling (multiple instances)
   - Add CDN for static assets
   - Implement API gateway

3. **File Storage**:
   - Move to S3/Cloudflare R2
   - Implement CDN for images

4. **Performance**:
   - Add database indexes
   - Implement pagination
   - Use compression (gzip)

---

## Support

For deployment issues:
- Check platform documentation (Vercel, Railway, Render)
- Review application logs
- Verify environment variables
- Test API endpoints manually
