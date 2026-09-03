import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getPostLoginRedirect } from '@/services/auth'
import { LoadingSpinner } from '@/components/common/LoadingState'

interface GuestRouteProps {
  children: React.ReactNode
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" text="Checking session..." />
      </div>
    )
  }

  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } })?.from
    return <Navigate to={getPostLoginRedirect(from)} replace />
  }

  return <>{children}</>
}
