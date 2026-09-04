import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CheckSquare,
  PlusCircle,
  Users,
  Layers,
  LogOut,
  User as UserIcon,
  UserCheck,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'

interface SidebarProps {
  className?: string
  onCloseMobile?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const mainNavItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'member'] as Role[],
    },
    {
      label: 'All Tasks',
      href: '/tasks',
      icon: CheckSquare,
      roles: ['admin', 'member'] as Role[],
    },
    {
      label: 'Create Task',
      href: '/tasks/create',
      icon: PlusCircle,
      roles: ['admin', 'member'] as Role[],
    },
    {
      label: 'Team Directory',
      href: '/users',
      icon: Users,
      roles: ['admin'] as Role[],
      badge: 'admin',
    },
  ]

  const visibleNavItems = mainNavItems.filter(
    (item) => !!user?.role && item.roles.includes(user.role)
  )

  // Assigned to me is active only when Dashboard's My Tasks section is selected
  const isAssignedToMeActive =
    location.pathname === '/dashboard' &&
    location.hash === '#my-tasks'

  // Handle Assigned to me click
  const handleAssignedToMeClick = (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault()
    onCloseMobile?.()

    // Navigate to Dashboard with the hash
    navigate('/dashboard#my-tasks')

    // Wait for Dashboard to render/update, then scroll to My Tasks
    setTimeout(() => {
      document.getElementById('my-tasks')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 100)
  }

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col border-r border-border/70 bg-card text-card-foreground',
        className
      )}
    >
      {/* Brand & Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border/60 px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
          <Layers className="h-4 w-4" />
        </div>

        <div className="flex flex-col leading-none">
          <span className="font-semibold text-sm tracking-tight text-foreground">
            TaskFlow
          </span>

          <span className="mt-1 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            Internal Operations
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {/* Main Section */}
        <div>
          <div className="px-3 mb-2">
            <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
              Navigation
            </span>
          </div>

          <nav className="space-y-0.5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon

              /*
               * Manual active state is used because React Router's
               * NavLink considers /dashboard and /dashboard#my-tasks
               * as the same pathname.
               */
              const isItemActive =
                item.href === '/dashboard'
                  ? location.pathname === '/dashboard' &&
                  location.hash !== '#my-tasks'
                  : item.href === '/tasks'
                    ? location.pathname === '/tasks'
                    : location.pathname === item.href

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end
                  onClick={onCloseMobile}
                  className={cn(
                    'group relative flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors duration-150',
                    isItemActive
                      ? 'bg-accent text-foreground font-medium'
                      : 'text-muted-foreground font-normal hover:bg-accent/50 hover:text-foreground'
                  )}
                >
                  {/* Subtle left accent indicator for the active item */}
                  <span
                    className={cn(
                      'absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary transition-opacity',
                      isItemActive ? 'opacity-100' : 'opacity-0'
                    )}
                  />

                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isItemActive
                          ? 'text-primary'
                          : 'text-muted-foreground/80 group-hover:text-foreground'
                      )}
                    />

                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border border-border/70 text-muted-foreground/80">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Quick Views */}
        <div>
          <div className="px-3 mb-2">
            <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
              Quick Views
            </span>
          </div>

          <div className="space-y-0.5 text-[13px]">
            <NavLink
              to="/dashboard#my-tasks"
              onClick={handleAssignedToMeClick}
              className={cn(
                'relative flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors',
                isAssignedToMeActive
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary transition-opacity',
                  isAssignedToMeActive ? 'opacity-100' : 'opacity-0'
                )}
              />
              <UserCheck
                className={cn(
                  'h-4 w-4',
                  isAssignedToMeActive ? 'text-primary' : 'text-muted-foreground/80'
                )}
              />

              <span>Assigned to me</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* User Info & Footer */}
      {user && (
        <div className="border-t border-border/60 p-3">
          <div className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-accent/50 transition-colors">
            <div className="relative shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground/70 text-xs font-medium">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
              )}

              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-[13px] font-medium text-foreground">
                {user.name}
              </span>

              <span className="text-[11px] text-muted-foreground truncate">
                {user.department || user.email}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
