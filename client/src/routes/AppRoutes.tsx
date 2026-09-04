import React from 'react'

import { Routes, Route, Navigate } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'

import { ProtectedRoute } from '@/routes/ProtectedRoute'

import { GuestRoute } from '@/routes/GuestRoute'

// Pages
import LoginPage from '@/pages/auth/LoginPage'
import MemberRegisterPage from '@/pages/auth/MemberRegisterPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import TasksListPage from '@/pages/tasks/TasksListPage'
import TaskCreatePage from '@/pages/tasks/TaskCreatePage'
import TaskEditPage from '@/pages/tasks/TaskEditPage'
import UsersPage from '@/pages/users/UsersPage'
import NotFoundPage from '@/pages/not-found/NotFoundPage'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />

      <Route
        path="/register"
        element={
          <GuestRoute>
            <MemberRegisterPage />
          </GuestRoute>
        }
      />

      {/* Authenticated Layout Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<DashboardPage />} />

        <Route path="tasks" element={<TasksListPage />} />

        <Route path="tasks/create" element={<TaskCreatePage />} />

        <Route path="tasks/:id/edit" element={<TaskEditPage />} />

        {/* Admin-only Route */}
        <Route
          path="users"
          element={
            <ProtectedRoute requiredRole="admin">
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes