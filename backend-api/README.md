# J-Moulin Planner - Backend API

Production-ready Express REST API for J-Moulin Planner, built with TypeScript, Prisma, and PostgreSQL.

## Features

- **Authentication**: JWT-based authentication with Argon2id password hashing
- **Authorization**: Role-Based Access Control (RBAC) with three roles: Admin, TeamLead, TeamMate
- **Entities**: Users, Teams, Tasks, Comments, Events, Attachments, Activity Logs
- **Validation**: Zod schema validation for all request bodies
- **Error Handling**: Typed error classes with consistent error responses
- **File Uploads**: Multer integration for attachment uploads
- **Security**: Helmet, CORS, rate limiting, XSS protection, input sanitization
- **Logging**: Colored console logging with activity tracking

## Prerequisites

- Node.js 22+
- pnpm or npm
- PostgreSQL 15+ (or use Docker)

## Installation

### Local Development

1. Clone the repository and navigate to the backend-api directory:

```bash
cd backend-api
```

2. Install dependencies:

```bash
pnpm install
# or npm install
```

3. Create a `.env` file in the backend-api directory (copy from `.env.example` in parent):

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/j_moulin"
JWT_SECRET="your-secret-key-min-32-chars"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

4. Setup the database:

```bash
pnpm run db:push
# or: npx prisma db push
```

5. (Optional) Seed the database:

```bash
pnpm run db:seed
# or: npx prisma db seed
```

6. Start the development server:

```bash
pnpm run dev
# or: npm run dev
```

The API will be available at `http://localhost:3000`

## Docker Setup

### Using Docker Compose (recommended for local development)

From the project root:

```bash
# Create .env.local file with your configuration
# See .env.example for required variables

# Start all services
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend-api

# Run database migrations
docker-compose exec backend-api pnpm run db:push
```

### Building Docker Image Locally

```bash
docker build -t j-moulin-api:latest .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@db:5432/j_moulin" \
  -e JWT_SECRET="your-secret" \
  j-moulin-api:latest
```

## API Documentation

### Base URL

- Local: `http://localhost:3000/api`
- Production: `https://api.j-moulin.com/api`

### Authentication

JWT token is stored in httpOnly cookie `auth` and can also be sent via Authorization header:

```
Authorization: Bearer <token>
```

### Endpoints

#### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

#### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

#### Tasks
- `GET /api/tasks` - Get all tasks (filtered by role)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task by ID
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team by ID
- `PATCH /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

#### Comments
- `GET /api/comments/task/:taskId` - Get comments for task
- `POST /api/comments` - Create comment
- `PATCH /api/comments/:id` - Update comment (author/admin only)
- `DELETE /api/comments/:id` - Delete comment (author/admin only)

#### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin only)
- `GET /api/events/:id` - Get event by ID
- `PATCH /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

#### Attachments
- `GET /api/attachments/task/:taskId` - Get attachments for task
- `POST /api/attachments` - Upload attachment (multipart/form-data with 'file' field)
- `GET /api/attachments/:id` - Get attachment info
- `DELETE /api/attachments/:id` - Delete attachment

#### Activity Logs
- `GET /api/activity-logs` - Get all activity logs
- `GET /api/activity-logs/task/:taskId` - Get logs for task
- `GET /api/activity-logs/team/:teamId` - Get logs for team
- `GET /api/activity-logs/user/:userId` - Get logs for user

### Response Format

All responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server with hot reload
pnpm run dev

# Build for production
pnpm run build

# Start production build
pnpm start

# Run TypeScript compiler check
pnpm run typecheck

# Lint code
pnpm run lint

# Format code
pnpm run format

# Prisma commands
pnpm run db:push        # Apply migrations
pnpm run db:studio      # Open Prisma Studio
pnpm run db:seed        # Seed database
```

## Project Structure

```
backend-api/
├── src/
│   ├── config.ts              # Configuration loader
│   ├── index.ts               # Main Express app
│   ├── controllers/           # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── tasks.controller.ts
│   │   ├── teams.controller.ts
│   │   ├── comments.controller.ts
│   │   ├── events.controller.ts
│   │   ├── attachments.controller.ts
│   │   └── activity-logs.controller.ts
│   ├── routers/               # Route definitions
│   │   ├── auth.router.ts
│   │   ├── users.router.ts
│   │   └── ... (other routers)
│   ├── middlewares/           # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── rbac.middleware.ts
│   │   ├── error-handler.ts
│   │   └── async-handler.ts
│   ├── lib/                   # Utilities
│   │   ├── db.ts              # Prisma client
│   │   ├── errors.ts          # Error classes
│   │   ├── password.ts        # Hashing utilities
│   │   ├── token.ts           # JWT utilities
│   │   └── logger.ts          # Logging
│   ├── types/                 # TypeScript types
│   └── models/                # Database models
├── prisma/
│   └── schema.prisma          # Database schema
├── package.json
├── tsconfig.json
├── .env.example
├── Dockerfile
└── README.md
```

## Role-Based Access Control

- **Admin**: Full access to all resources
- **TeamLead**: Can manage their team's tasks and members
- **TeamMate**: Can only see and update their assigned tasks

## Error Handling

The API uses custom error classes that extend a base `AppError`:

- `ValidationError` (400)
- `AuthenticationError` (401)
- `AuthorizationError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)

All errors include a status code and descriptive message.

## Security Considerations

- Passwords are hashed with Argon2id
- JWTs expire after 7 days
- CORS is configured to accept only specified origins
- Rate limiting is enabled (100 requests per 15 minutes)
- XSS protection and helmet security headers are enabled
- File uploads are size-limited and stored with unique names

## Deployment

### Railway

The backend is configured for Railway deployment:

1. Create a Railway project
2. Add PostgreSQL service
3. Add GitHub/GitLab repository as the source
4. Set environment variables in Railway dashboard
5. Enable automatic deployments from main branch

Environment variables needed:
- `DATABASE_URL` (auto-set by Railway PostgreSQL)
- `JWT_SECRET` (set in Railway)
- `NODE_ENV=production`
- `CORS_ORIGIN=https://your-frontend-url.railway.app`

## Troubleshooting

### Database connection issues
- Check `DATABASE_URL` format
- Ensure PostgreSQL is running
- Verify network access to database

### Port already in use
- Change `PORT` environment variable
- Or kill process: `lsof -ti:3000 | xargs kill -9`

### Prisma migration errors
- Reset database: `npx prisma migrate reset`
- Or: `pnpm run db:push --force-reset`

## Contributing

1. Follow the existing code style
2. Run linter and formatter before committing
3. Add tests for new features
4. Update API documentation

## License

MIT
