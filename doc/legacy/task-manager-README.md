# Task Manager - Enterprise Edition

## Overview

Enterprise-grade Task Management System with clean architecture, TypeScript, and advanced features.

## Features

### Core Features
- ✅ Task CRUD operations
- ✅ User authentication and authorization
- ✅ Task assignment and collaboration
- ✅ Real-time notifications
- ✅ File attachments
- ✅ Tag system
- ✅ Search functionality
- Batch operations
- Data import/export
- Reports and analytics

### Advanced Features
- Workflow engine
- Task templates
- Automation rules
- Third-party integrations
- Webhooks
- API key management
- OAuth integrations

### Enterprise Features
- Multi-tenancy
- Role-based access control
- Audit logging
- Performance monitoring
- Error tracking
- Log aggregation
- Alerting rules
- Data backup and recovery
- CI/CD pipeline
- Docker containerization
- Blue-green deployment
- Rollback strategies

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT
- **Testing**: Jest + Supertest + Playwright
- **CI/CD**: GitHub Actions
- **Container**: Docker

## Architecture

### Layered Architecture

```
├── src/
│   ├── domain/              # Domain Layer (Business Logic)
│   │   ├── entities/
│   │   │   ├── Task.ts
│   │   │   ├── User.ts
│   │   │   └── Tag.ts
│   │   ├── value-objects/
│   │   │   ├── TaskStatus.ts
│   │   │   ├── TaskPriority.ts
│   │   │   └── UserRole.ts
│   │   ├── repositories/
│   │   │   ├── ITaskRepository.ts
│   │   │   ├── TaskRepository.ts
│   │   │   ├── IUserRepository.ts
│   │   └── UserRepository.ts
│   │   └── services/
│   │       ├── TaskService.ts
│   ├── application/         # Application Layer (Use Cases)
│   │   ├── use-cases/
│   │   │   ├── CreateTask.ts
│   │   ├── GetAllTasks.ts
│   │   ├── GetTaskById.ts
│   │   ├── UpdateTask.ts
│   │   └── DeleteTask.ts
│   │   └── dto/
│   │       ├── CreateTaskDto.ts
│   │       ├── UpdateTaskDto.ts
│   │       └── TaskResponseDto.ts
│   ├── infrastructure/      # Infrastructure Layer
│   │   ├── database/
│   │   │   ├── prisma/
│   │   └── connection.ts
│   │   ├── logging/
│   │   │   └── WinstonLogger.ts
│   │   ├── cache/
│   │   │   ├── ICacheService.ts
│   │   └── RedisCacheService.ts
│   │   ├── config/
│   │   │   ├── Config.ts
│   │   │   ├── DatabaseConfig.ts
│   │   └── SecurityConfig.ts
│   │   └── security/
│   │       ├── AuthenticationService.ts
│   │       ├── JwtService.ts
│   │       └── PasswordService.ts
│   └── interfaces/          # Interfaces
│       ├── ITaskRepository.ts
│       ├── IUserRepository.ts
│       ├── ICacheService.ts
│       ├── IAuthenticationService.ts
│       └── IPasswordService.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── api/
    └── architecture/
```

## Development

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6
- Docker >= 20

### Setup

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate

# Start development server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/task_manager"
REDIS_URL="redis://localhost:6379"
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
CACHE_TTL=3600
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
LOG_LEVEL=info
```

## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Tasks

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the project",
  "status": "pending",
  "priority": "high",
  "tags": "documentation,writing"
}
```

#### Get All Tasks
```http
GET /api/tasks?page=1&limit=10&status=pending&priority=high
Authorization: Bearer <token>
```

#### Get Task by ID
```http
GET /api/tasks/:id
Authorization: Bearer <token>
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in-progress"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

#### Get Task Stats
```http
GET /api/tasks/stats
Authorization: Bearer <token>
```

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## Deployment

### Docker
```bash
# Build image
docker build -t task-manager:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:password@db:5432/task_manager \
  -e REDIS_URL=redis://redis:6379 \
  task-manager:latest
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

## Monitoring

### Health Check
```http
GET /health
```

### Metrics
```http
GET /metrics
```

### Logs
```bash
# View logs
docker logs task-manager

# View logs with tail
docker logs -f task-manager
```

## License

MIT
