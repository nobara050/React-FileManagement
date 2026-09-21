import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import AuthLayout from '../layouts/AuthLayout/AuthLayout';
import AppLayout from '../layouts/AppLayout/AppLayout';
import AdminLayout from '../layouts/AdminLayout/AdminLayout';

// Pages
import LoginPage from '../pages/LoginPage/LoginPage';
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import MyDrivePage from '../pages/MyDrivePage/MyDrivePage';
import SharedPage from '../pages/SharedPage/SharedPage';
import TrashPage from '../pages/TrashPage/TrashPage';
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage';

// Admin Pages
import AdminUsersPage from '../pages/Admin/AdminUsersPage/AdminUsersPage';
import AdminRolesPage from '../pages/Admin/AdminRolesPage/AdminRolesPage';
import AdminProfilePage from '../pages/Admin/AdminProfilePage/AdminProfilePage';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// Route guards
function RouteLoading() {
  return (
    <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );
}

function RootRedirect() {
  const { isAuthenticated, user, initialLoading } = useAuth();
  if (initialLoading) {
    return <RouteLoading />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return user?.isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/drive" replace />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, user, initialLoading } = useAuth();
  if (initialLoading) {
    return <RouteLoading />;
  }
  if (isAuthenticated) {
    return user?.isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/drive" replace />;
  }
  return <Outlet />;
}

function UserRoute() {
  const { isAuthenticated, user, initialLoading } = useAuth();
  if (initialLoading) {
    return <RouteLoading />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // Admin accounts do not have a normal drive interface
  if (user?.isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
}

function AdminRoute() {
  const { isAuthenticated, user, initialLoading } = useAuth();
  if (initialLoading) {
    return <RouteLoading />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // Non-admins cannot access admin portal
  if (!user?.isAdmin) {
    return <Navigate to="/drive" replace />;
  }
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
        ],
      },
    ],
  },
  {
    // Normal user drive routes
    element: <UserRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: 'drive',
            element: <MyDrivePage />,
          },
          {
            path: 'drive/folder/:folderId',
            element: <MyDrivePage />,
          },
          {
            path: 'shared',
            element: <SharedPage />,
          },
          {
            path: 'shared/folder/:folderId',
            element: <SharedPage />,
          },
          {
            path: 'trash',
            element: <TrashPage />,
          },
        ],
      },
    ],
  },
  {
    // Dedicated Admin routes
    path: 'admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/admin/users" replace />,
          },
          {
            path: 'users',
            element: <AdminUsersPage />,
          },
          {
            path: 'roles',
            element: <AdminRolesPage />,
          },
          {
            path: 'profile',
            element: <AdminProfilePage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
