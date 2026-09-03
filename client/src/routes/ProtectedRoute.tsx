import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LoadingSpinner } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import type { Role } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: Role
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" text="Authenticating session..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="py-12">
        <ErrorState
          title="Access Restricted"
          message={`This area requires the "${requiredRole}" role. Your current system role is "${user?.role}".`}
        />
      </div>
    )
  }

  return <>{children}</>
}
