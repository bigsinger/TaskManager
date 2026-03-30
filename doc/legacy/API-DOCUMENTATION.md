# Task Manager API Documentation

**Version**: 1.0.0
**Base URL**: `http://localhost:3000`
**Environment**: Development

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Data Models](#data-models)
5. [Error Codes](#error-codes)
6. [Rate Limiting](#rate-limiting)
7. [Monitoring](#monitoring)

---

## Overview

The Task Manager API provides a simple CRUD interface for managing tasks. It supports creating, reading, updating, and deleting tasks with status tracking.

### Features

- ✅ Create, Read, Update, Delete (CRUD) operations
- ✅ Task status management (pending, in-progress, completed)
- ✅ Automatic timestamps (createdAt, updatedAt)
- ✅ Input validation and error handling
- ✅ Structured logging and monitoring
- ✅ Health check and metrics endpoints

### Technology Stack

- **Runtime**: Node.js v24.14.0
- **Framework**: Express.js
- **Database**: SQLite
- **Platform**: Windows (win32, x64)

---

## Authentication

Currently, the API does not require authentication. This is suitable for development and testing purposes.

**Note**: For production use, implement authentication using JWT tokens or API keys.

---

## Endpoints

### 1. Health Check

Check if the API is running and healthy.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2026-03-26T05:49:24.000Z",
  "uptime": 62,
  "environment": "development",
  "version": "1.0.0",
  "database": "connected",
  "memory": {
    "rss": 70082560,
    "heapTotal": 9777152,
    "heapUsed": 8147736,
    "external": 2326243,
    "arrayBuffers": 18891
  },
  "metrics": {
    "requestCount": 1,
    "errorCount": 0,
    "avgResponseTime": "4.00ms"
  }
}
```

**Status Codes**:
- `200 OK` - API is healthy

---

### 2. Detailed Health Check

Get detailed health information including system metrics.

**Endpoint**: `GET /health/detailed`

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2026-03-26T05:49:24.000Z",
  "uptime": 62,
  "environment": "development",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "path": "F:\\agent\\baijingjing\\projects\\crud-backend\\tasks.db"
  },
  "system": {
    "platform": "win32",
    "arch": "x64",
    "nodeVersion": "v24.14.0",
    "memory": { ... }
  },
  "metrics": {
    "requestCount": 1,
    "errorCount": 0,
    "avgResponseTime": "4.00ms",
    "errorRate": "0.00%",
    "requestsByEndpoint": {}
  },
  "logs": {
    "directory": "F:\\agent\\baijingjing\\projects\\crud-backend\\logs",
    "level": "INFO"
  }
}
```

**Status Codes**:
- `200 OK` - Detailed health information retrieved

---

### 3. System Metrics

Get performance metrics and statistics.

**Endpoint**: `GET /api/metrics`

**Response**:
```json
{
  "uptime": 62,
  "memory": {
    "rss": 70082560,
    "heapTotal": 9777152,
    "heapUsed": 8147736,
    "external": 2326243,
    "arrayBuffers": 18891
  },
  "environment": "development",
  "nodeVersion": "v24.14.0",
  "timestamp": "2026-03-26T05:49:02.000Z",
  "metrics": {
    "requestCount": 1,
    "errorCount": 0,
    "avgResponseTime": "4.00ms",
    "errorRate": "0.00%",
    "requestsByEndpoint": {}
  }
}
```

**Status Codes**:
- `200 OK` - Metrics retrieved successfully

---

### 4. Get All Tasks

Retrieve all tasks from the database, ordered by creation date (newest first).

**Endpoint**: `GET /api/tasks`

**Response**:
```json
[
  {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "in-progress",
    "createdAt": "2026-03-26T05:00:00.000Z",
    "updatedAt": "2026-03-26T05:30:00.000Z"
  },
  {
    "id": 2,
    "title": "Review code",
    "description": "Review and refactor code",
    "status": "pending",
    "createdAt": "2026-03-26T04:00:00.000Z",
    "updatedAt": "2026-03-26T04:00:00.000Z"
  }
]
```

**Status Codes**:
- `200 OK` - Tasks retrieved successfully
- `500 Internal Server Error` - Database error

---

### 5. Get Single Task

Retrieve a specific task by its ID.

**Endpoint**: `GET /api/tasks/:id`

**Parameters**:
- `id` (path parameter, required) - Task ID (integer)

**Response**:
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "in-progress",
  "createdAt": "2026-03-26T05:00:00.000Z",
  "updatedAt": "2026-03-26T05:30:00.000Z"
}
```

**Status Codes**:
- `200 OK` - Task retrieved successfully
- `404 Not Found` - Task not found
- `400 Bad Request` - Invalid task ID

---

### 6. Create Task

Create a new task.

**Endpoint**: `POST /api/tasks`

**Request Body**:
```json
{
  "title": "New Task",
  "description": "Task description (optional)",
  "status": "pending"
}
```

**Request Parameters**:
- `title` (required, string, max 200 chars) - Task title
- `description` (optional, string, max 1000 chars) - Task description
- `status` (optional, string) - Task status: `pending`, `in-progress`, or `completed`

**Response**:
```json
{
  "id": 3,
  "title": "New Task",
  "description": "Task description (optional)",
  "status": "pending",
  "createdAt": "2026-03-26T05:50:00.000Z",
  "updatedAt": "2026-03-26T05:50:00.000Z"
}
```

**Status Codes**:
- `201 Created` - Task created successfully
- `400 Bad Request` - Invalid input (missing title, invalid status)
- `500 Internal Server Error` - Database error

**Validation Rules**:
- Title is required and cannot be empty
- Title is trimmed of leading/trailing whitespace
- Status must be one of: `pending`, `in-progress`, `completed`
- If status is not provided, defaults to `pending`

---

### 7. Update Task

Update an existing task.

**Endpoint**: `PUT /api/tasks/:id`

**Parameters**:
- `id` (path parameter, required) - Task ID (integer)

**Request Body**:
```json
{
  "title": "Updated Task",
  "description": "Updated description",
  "status": "completed"
}
```

**Request Parameters**:
- `title` (required, string) - Updated task title
- `description` (optional, string) - Updated task description
- `status` (optional, string) - Updated task status

**Response**:
```json
{
  "id": 1,
  "title": "Updated Task",
  "description": "Updated description",
  "status": "completed",
  "createdAt": "2026-03-26T05:00:00.000Z",
  "updatedAt": "2026-03-26T05:55:00.000Z"
}
```

**Status Codes**:
- `200 OK` - Task updated successfully
- `400 Bad Request` - Invalid input
- `404 Not Found` - Task not found
- `500 Internal Server Error` - Database error

**Validation Rules**:
- Title is required and cannot be empty
- Title is trimmed of leading/trailing whitespace
- Status must be one of: `pending`, `in-progress`, `completed`
- `updatedAt` is automatically updated

---

### 8. Delete Task

Delete a task by its ID.

**Endpoint**: `DELETE /api/tasks/:id`

**Parameters**:
- `id` (path parameter, required) - Task ID (integer)

**Response**:
```json
{
  "message": "Task deleted successfully"
}
```

**Status Codes**:
- `200 OK` - Task deleted successfully
- `404 Not Found` - Task not found
- `400 Bad Request` - Invalid task ID
- `500 Internal Server Error` - Database error

---

### 9. API Documentation

Get this API documentation.

**Endpoint**: `GET /api/docs`

**Response**:
```json
{
  "title": "Task Manager API Documentation",
  "version": "1.0.0",
  "baseUrl": "http://localhost:3000",
  "environment": "development",
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/tasks",
      "description": "Get all tasks",
      "response": "Array of task objects"
    },
    ...
  ],
  "healthCheck": "/health",
  "errorCodes": {
    "400": "Bad Request - Invalid input",
    "404": "Not Found - Task not found",
    "500": "Internal Server Error - Server error"
  }
}
```

**Status Codes**:
- `200 OK` - Documentation retrieved successfully

---

### 10. Root Endpoint

Get API information.

**Endpoint**: `GET /`

**Response**:
```json
{
  "name": "Task Manager API",
  "version": "1.0.0",
  "description": "Simple CRUD API for task management",
  "environment": "development",
  "endpoints": {
    "tasks": "/api/tasks",
    "health": "/health",
    "docs": "/api/docs"
  },
  "frontend": "http://localhost:3001",
  "methods": ["GET", "POST", "PUT", "DELETE"]
}
```

**Status Codes**:
- `200 OK` - API information retrieved successfully

---

## Data Models

### Task Object

```typescript
interface Task {
  id: number;              // Auto-generated unique identifier
  title: string;           // Task title (required, max 200 chars)
  description: string;    // Task description (optional, max 1000 chars)
  status: TaskStatus;     // Task status
  createdAt: string;      // ISO 8601 timestamp
  updatedAt: string;      // ISO 8601 timestamp
}

type TaskStatus = 'pending' | 'in-progress' | 'completed';
```

### Status Values

| Status | Description |
|--------|-------------|
| `pending` | Task is not started yet |
| `in-progress` | Task is currently being worked on |
| `completed` | Task is finished |

---

## Error Codes

| Code | Description | Example |
|------|-------------|---------|
| `400 Bad Request` | Invalid input | Missing title, invalid status |
| `404 Not Found` | Resource not found | Task ID does not exist |
| `500 Internal Server Error` | Server error | Database connection failed |

### Error Response Format

```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. All requests are processed without restrictions.

**Note**: For production use, implement rate limiting using `express-rate-limit` middleware.

---

## Monitoring

### Logging

The API uses structured logging with the following levels:

- **ERROR**: Critical errors that need attention
- **WARN**: Warning messages for potential issues
- **INFO**: Informational messages about normal operations
- **DEBUG**: Detailed debugging information

Log files are stored in the `logs/` directory with the format `app-YYYY-MM-DD.log`.

### Metrics

The API tracks the following metrics:

- **requestCount**: Total number of requests
- **errorCount**: Total number of errors
- **avgResponseTime**: Average response time in milliseconds
- **errorRate**: Error rate as a percentage
- **requestsByEndpoint**: Request count and errors per endpoint

Metrics can be retrieved via the `/api/metrics` endpoint.

### Health Checks

- **Basic Health**: `GET /health`
- **Detailed Health**: `GET /health/detailed`

---

## Examples

### Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Node.js",
    "description": "Complete Node.js tutorial",
    "status": "in-progress"
  }'
```

### Get All Tasks

```bash
curl http://localhost:3000/api/tasks
```

### Update a Task

```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Node.js (Updated)",
    "status": "completed"
  }'
```

### Delete a Task

```bash
curl -X DELETE http://localhost:3000/api/tasks/1
```

---

## Testing

The API includes a comprehensive test suite with 25 tests covering all endpoints and edge cases.

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial release with CRUD operations, logging, and monitoring |

---

## Support

For issues or questions, please refer to the project repository or contact the development team.

---

**Last Updated**: 2026-03-26
**API Version**: 1.0.0
