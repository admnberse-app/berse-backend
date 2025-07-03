# Docker Development Setup for BerseMuka App

## Prerequisites
- Docker Desktop installed and running
- Git

## Quick Start

### 1. Clone the repository (if not already done)
```bash
git clone <repository-url>
cd "BerseMuka App"
```

### 2. Run the setup script
```bash
./scripts/docker-setup.sh
```

This will:
- Build Docker images for backend and frontend
- Start PostgreSQL database
- Run database migrations
- Seed sample data

### 3. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Database: localhost:5432 (user: bersemuka_user, password: bersemuka_pass, database: bersemuka_db)

## Docker Commands

### Start services
```bash
docker-compose up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop services
```bash
docker-compose down
```

### Reset everything (including database)
```bash
docker-compose down -v
```

### Run database migrations
```bash
docker-compose exec backend npx prisma migrate dev
```

### Access database CLI
```bash
docker-compose exec postgres psql -U bersemuka_user -d bersemuka_db
```

### Rebuild after code changes
```bash
docker-compose build
docker-compose up -d
```

## Troubleshooting

### Port already in use
If you get port conflicts, you can change the ports in `docker-compose.yml`:
- Change `"5432:5432"` to `"5433:5432"` for PostgreSQL
- Change `"3000:3000"` to `"3001:3000"` for backend
- Change `"5173:5173"` to `"5174:5173"` for frontend

Remember to update the environment variables accordingly.

### Database connection issues
1. Ensure PostgreSQL container is healthy:
   ```bash
   docker-compose ps
   ```
2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

### Frontend can't connect to backend
1. Ensure backend is running:
   ```bash
   docker-compose ps backend
   ```
2. Check CORS settings in backend
3. Verify proxy settings in `frontend/vite.config.ts`

## Development Workflow

1. **Backend changes**: Changes to `/src` are automatically reloaded by nodemon
2. **Frontend changes**: Changes to `/frontend/src` are automatically reloaded by Vite
3. **Database schema changes**: 
   - Update `prisma/schema.prisma`
   - Run `docker-compose exec backend npx prisma migrate dev`

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://bersemuka_user:bersemuka_pass@postgres:5432/bersemuka_db?schema=public"
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```