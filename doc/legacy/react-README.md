# CRUD React Frontend

React-based frontend for the Task Manager API.

## Features

- ✅ Create, Read, Update, Delete tasks
- ✅ Real-time task management
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Modern UI with animations

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on http://localhost:3000

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open in your browser at http://localhost:3001

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production

## Project Structure

```
src/
├── api.js                 # API client with axios
├── App.js                 # Main application component
├── index.js               # Entry point
├── index.css              # Global styles
└── components/
    ├── TaskForm.js        # Task creation/editing form
    ├── TaskItem.js        # Single task display
    └── TaskList.js        # Task list container
```

## API Integration

The app connects to the backend API at `http://localhost:3000/api`:

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Components

### App
Main application component that manages state and handles CRUD operations.

### TaskList
Displays a list of tasks with loading and empty states.

### TaskItem
Displays a single task with edit and delete actions.

### TaskForm
Modal form for creating and editing tasks with validation.

## Features Implemented

### State Management
- React hooks (useState, useEffect)
- Local component state
- Error state handling

### Form Validation
- Required field validation
- Character limit validation
- Real-time error feedback

### UI/UX
- Responsive design
- Smooth animations
- Loading states
- Error banners
- Confirmation dialogs

### Error Handling
- API error handling
- User-friendly error messages
- Error recovery

## Technologies Used

- React 18.3.1
- React DOM 18.3.1
- Axios 1.7.7
- React Scripts 5.0.1

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC
