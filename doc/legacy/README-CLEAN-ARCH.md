# Task Manager API - Clean Architecture

A RESTful CRUD API built with Node.js and Express following Clean Architecture principles.

## Architecture

This project follows Robert C. Martin's Clean Architecture principles with four distinct layers:

```
┌─────────────────────────────────────┐
│           Frameworks & Drivers       │  ← Outermost
│  (Web, UI, DB, External Services)   │
└─────────────────────────────────────┘
                 ↑ depends on
┌─────────────────────────────────────┐
│            Interface Adapters       │
│  (Controllers, Presenters, Gateways) │
└─────────────────────────────────────┘
                 ↑ depends on
┌─────────────────────────────────────┐
│              Use Cases              │
│  (Application Business Rules)       │
└─────────────────────────────────────┘
                 ↑ depends on
┌─────────────────────────────────────┐
│              Entities               │  ← Innermost
│  (Enterprise Business Rules)        │
└─────────────────────────────────────┘
```

## Project Structure

```
src/
├── entities/                    # Business entities (innermost layer)
│   └── Task.js                 # Task entity with business rules
├── usecases/                   # Application business rules
│   ├── CreateTask.js          # Create task use case
│   ├── GetAllTasks.js         # Get all tasks use case
│   ├── GetTaskById.js         # Get task by ID use case
│   ├── UpdateTask.js          # Update task use case
│   └── DeleteTask.js          # Delete task use case
├── repositories/               # Repository interfaces
│   └── TaskRepository.js      # Task repository interface
├── adapters/                   # Interface adapters
│   ├── controllers/
│   │   └── TaskController.js  # HTTP request/response handling
│   └── repositories/
│       └── SQLiteTaskRepository.js  # SQLite implementation
└── frameworks/                 # Frameworks and drivers (outermost layer)
    └── server.js             # Express server setup
```

## Key Principles

### 1. Dependency Rule
- Dependencies can only point inward
- Nothing in an inner circle can know anything about an outer circle

### 2. Layer Responsibilities

**Entities (Innermost)**
- Enterprise-wide business rules
- Framework-independent
- Pure business logic
- Highly reusable

**Use Cases**
- Application-specific business rules
- Orchestrate flow of data
- Use entities to implement rules
- Don't depend on frameworks

**Interface Adapters**
- Controllers handle HTTP requests
- Presenters format responses
- Gateways talk to external systems

**Frameworks & Drivers**
- Web framework (Express)
- Database (SQLite)
- External APIs

### 3. Benefits

**Testability**
- Business logic independent of frameworks
- Easy to unit test use cases
- Mock repositories for testing

**Independence**
- UI can change without affecting business rules
- Database can change without affecting use cases
- Frameworks can be swapped easily

**Maintainability**
- Clear separation of concerns
- Each layer has single responsibility
- Easy to locate and fix bugs

**Scalability**
- Add new features without breaking existing code
- Easy to add new use cases
- Clear boundaries prevent coupling

## Installation

```bash
npm install
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Testing
```bash
npm test
npm run test:watch
npm run test:coverage
```

## API Endpoints

### Get All Tasks
```http
GET /api/tasks?page=1&limit=20&status=pending
```

### Get Single Task
```http
GET /api/tasks/:id
```

### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Task title",
  "description": "Task description",
  "status": "pending"
}
```

### Update Task
```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated title",
  "status": "in-progress"
}
```

### Delete Task
```http
DELETE /api/tasks/:id
```

## Business Rules

### Task Status Transitions
- `pending` → `in-progress` → `completed`
- `in-progress` → `pending`
- `completed` → `in-progress`

### Validation Rules
- Title: Required, max 200 characters
- Description: Optional, max 1000 characters
- Status: Must be one of `pending`, `in-progress`, `completed`

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Testing**: Jest, Supertest
- **Architecture**: Clean Architecture

## License

MIT
