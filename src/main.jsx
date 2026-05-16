import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { WorkflowProvider } from './context/WorkflowContext.jsx';
import { router } from './routes/AppRoutes.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <WorkflowProvider>
        <RouterProvider router={router} />
      </WorkflowProvider>
    </AuthProvider>
  </StrictMode>,
);
