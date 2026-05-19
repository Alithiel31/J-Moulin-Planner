# J-Moulin Planner - Setup Guide

Complete setup guide for the J-Moulin Planner project with both frontend and backend API.

## Project Structure

```
J-Moulin Planner/
├── frontend/              # SvelteKit frontend application
│   ├── src/
│   ├── Dockerfile         # Frontend container
│   └── package.json
├── backend-api/           # Express REST API
│   ├── src/
│   ├── prisma/            # Database schema
│   ├── Dockerfile         # API container
│   ├── package.json
│   └── README.md          # API-specific documentation
├── prisma/                # Shared Prisma schema (managed in parent)
│   └── schema.prisma
├── docker-compose.yml     # Local development orchestration
├── .env.local             # Environment variables for local development
└── SETUP.md              # This file
```

## Quick Start with Docker Compose

The easiest way to get everything running locally:

### 1. Prerequisites

- Docker and Docker Compose
- At least 2GB of free disk space

### 2. Setup

Clone/navigate to the project:

```bash
cd "J-Moulin Planner"
```

Create a `.env` file from `.env.local`:

```bash
cp .env.local .env
```

Edit `.env` if needed (the defaults are fine for local development).

### 3. Start Services

```bash
docker-compose up
```

This will:
- Start PostgreSQL database
- Run database migrations automatically
- Start the Express API on port 3000
- Start the SvelteKit frontend on port 5173

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api
- **API Health**: http://localhost:3000/health

### 5. Seed Sample Data (Optional)

In another terminal:

```bash
docker-compose exec backend-api pnpm run db:seed
```

Test credentials:
- Admin: `admin` / `admin123`
- TeamLead: `teamlead` / `lead123`
- User: `user1` / `user123`
- User: `user2` / `user123`

### 6. Stop Services

```bash
docker-compose down
```

To also remove the database volume:

```bash
docker-compose down -v
```

## Local Development (Without Docker)

If you prefer running services locally:

### Backend API

```bash
cd backend-api

# Install dependencies
pnpm install

# Setup database (ensure PostgreSQL is running)
pnpm run db:push

# Seed sample data (optional)
pnpm run db:seed

# Start development server
pnpm run dev
```

API will be available at `http://localhost:3000`

### Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

Frontend will be available at `http://localhost:5173`

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=j_moulin
DB_PORT=5432

# Backend API
NODE_ENV=development
API_PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Frontend
FRONTEND_PORT=5173
VITE_API_URL=http://localhost:3000/api
```

## Database Management

### Using Docker Compose

```bash
# View database with Prisma Studio
docker-compose exec backend-api pnpm run db:studio

# Reset database and reseed
docker-compose exec backend-api pnpm run db:reset

# Apply migrations
docker-compose exec backend-api pnpm run db:push
```

### Local Setup

```bash
cd backend-api

# View database with Prisma Studio
pnpm run db:studio

# Reset database and reseed
pnpm run db:reset

# Apply migrations
pnpm run db:push
```

## Database Schema

The application manages the following entities:

- **User**: Application users with role-based access
- **Team**: Groups of users managed by a team lead
- **Task**: Work items with assignments and deadlines
- **Comment**: Comments on tasks for collaboration
- **Event**: Team events and meetings
- **Attachment**: File attachments on tasks
- **ActivityLog**: Audit trail of all changes

See `backend-api/README.md` for API documentation and `backend-api/prisma/schema.prisma` for the full database schema.

## Deployment to Railway

### Backend API

1. Create a Railway project
2. Add PostgreSQL service
3. Add your GitHub repository as source
4. Configure environment variables:
   - `JWT_SECRET` (generate a secure value)
   - `CORS_ORIGIN` (your frontend URL)
   - `NODE_ENV=production`
5. Deploy will trigger automatically on push to main

### Frontend

1. In the same Railway project, add a new service
2. Connect your GitHub repository
3. Set start command: `npm run build && npm run preview`
4. Configure environment variables:
   - `VITE_API_URL` (your Railway API URL)
5. Railway will automatically deploy on push

See `backend-api/README.md` for detailed deployment instructions.

## Common Issues

### Port Already in Use

If port 3000 or 5173 is already in use, either:
1. Stop the conflicting service
2. Change the port in docker-compose.yml or .env file

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Node Modules Issues

```bash
# Clear node_modules and reinstall
rm -rf backend-api/node_modules frontend/node_modules
docker-compose build --no-cache

# Or locally
pnpm install --force
```

### Migration Failed

```bash
# Reset everything (WARNING: deletes all data)
docker-compose exec backend-api pnpm run db:reset

# Or manually
docker-compose exec backend-api pnpm run db:push --force-reset
```

## Development Workflow

### Creating a New Feature

1. Create a task in the application
2. Assign it to team members
3. Use comments for collaboration
4. Update task status as work progresses
5. View activity logs to track changes

### Making Changes to Database Schema

1. Edit `backend-api/prisma/schema.prisma`
2. Run `pnpm run db:push` to apply changes
3. Restart the backend API

### Adding New API Endpoints

See `backend-api/README.md` for the API structure and examples.

## Testing the API

### Using cURL

```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Get current user
curl http://localhost:3000/api/auth/me
```

### Using Postman/Insomnia

Import the API endpoints from `backend-api/README.md` documentation.

## Architecture

- **Frontend**: SvelteKit (UI)
- **API**: Express.js + TypeScript (REST API)
- **Database**: PostgreSQL (Data)
- **ORM**: Prisma (Database client)
- **Authentication**: JWT with Argon2id hashing
- **Authorization**: Role-Based Access Control (RBAC)

## Additional Documentation

- [Backend API Documentation](./backend-api/README.md)
- [Database Schema](./backend-api/prisma/schema.prisma)
- [Frontend README](./frontend/README.md) (if available)

## Support

For issues or questions:
1. Check the relevant README files
2. Review error logs in docker-compose output
3. Check database state with Prisma Studio

## License

MIT
