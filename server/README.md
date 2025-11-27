# Cork Board Server

Backend API for Cork Board Connections application.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js 20 or higher
- PostgreSQL 14 or higher
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/corkboard?schema=public"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# OR run migrations (for production)
npm run db:migrate

# (Optional) Open Prisma Studio to view database
npm run db:studio
```

## Development

```bash
# Start development server with auto-reload
npm run dev
```

The API will be available at `http://localhost:3001/api`

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Boards
- `GET /api/boards/:id` - Get board with items and connections
- `POST /api/boards` - Create new board
- `PATCH /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Items
- `POST /api/boards/:boardId/items` - Create item
- `PATCH /api/boards/:boardId/items/:itemId` - Update item
- `DELETE /api/boards/:boardId/items/:itemId` - Delete item (soft delete)

### Connections
- `POST /api/boards/:boardId/connections` - Create connection
- `DELETE /api/boards/:boardId/connections/:connectionId` - Delete connection

## Security Features

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**:
  - General: 100 requests per 15 minutes
  - Strict (write operations): 50 requests per 15 minutes
- **Input Validation**: Zod schemas for all inputs
- **Error Handling**: Comprehensive error middleware

## Database Schema

See `prisma/schema.prisma` for the complete database schema.

Key models:
- **Board**: Container for items and connections
- **Item**: Notes, images, or other board items
- **Connection**: Links between items
- **ItemMetadata**: Key-value metadata for items
- **Tag**: Reusable tags for items
- **Attachment**: File attachments

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes (dev)
- `npm run db:migrate` - Run migrations (prod)
- `npm run db:studio` - Open Prisma Studio

## Deployment

See `DEPLOYMENT.md` in the root directory for deployment instructions.

## Error Handling

All errors are handled by centralized error middleware:

- **400**: Validation errors
- **404**: Resource not found
- **409**: Conflict (e.g., duplicate records)
- **429**: Too many requests (rate limit)
- **500**: Internal server error

## Development Tips

1. Use Prisma Studio to inspect database: `npm run db:studio`
2. Check TypeScript errors: `npm run type-check`
3. Format code before committing: `npm run lint:fix`
4. Use environment variables for all configuration
5. Never commit `.env` file or database credentials
