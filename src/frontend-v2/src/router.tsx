import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import { TaskList } from './pages/TaskList'
import { TaskDetail } from './pages/TaskDetail'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Statistics } from './pages/Statistics'
import { Kanban } from './pages/Kanban'
import { ProtectedRoute } from './components/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <TaskList />,
      },
      {
        path: 'tasks/:id',
        element: <TaskDetail />,
      },
      {
        path: 'kanban',
        element: <Kanban />,
      },
      {
        path: 'statistics',
        element: <Statistics />,
      },
    ],
  },
])
