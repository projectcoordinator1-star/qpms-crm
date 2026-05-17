import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import CRM from '../pages/CRM.jsx';
import Sites from '../pages/Sites.jsx';
import Tickets from '../pages/Tickets.jsx';
import Tasks from '../pages/Tasks.jsx';
import Reports from '../pages/Reports.jsx';
import Employees from '../pages/Employees.jsx';
import Settings from '../pages/Settings.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <Login /> },
      {
        element: <MainLayout />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'crm', element: <CRM /> },
          { path: 'sites', element: <Sites /> },
          { path: 'site-visit/:id', element: <Sites /> },
          { path: 'tickets', element: <Tickets /> },
          { path: 'tasks', element: <Tasks /> },
          { path: 'reports', element: <Reports /> },
          { path: 'employees', element: <Employees /> },
          { path: 'settings', element: <Settings /> },
        ],
      },
      { path: '*', element: <Navigate to="/login" replace /> },
    ],
  },
]);
